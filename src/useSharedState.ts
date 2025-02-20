import { SharedStateContext } from "./SharedStateProvider"
import { useContext, useEffect, useMemo } from "react"
import useForceRerender from "./useForceRerender"
import { useStorage } from "./useStorage"
import { useDebouncedValue } from "./useDebouncedValue"

type StateInterface<T> = {
  value: T,
  debouncedValue: T,
  setValue: (value: ValueOrFunction<T>) => void,
  clear: () => void
}

type TransformFunction<T = any> = (lastValue: T) => T

type ValueOrFunction<T = any> = T | TransformFunction<T>

export function useSharedState<T, K extends string = string> (params: {
  key: K,
  initialValue: T,
  shouldSaveToStorage?: boolean,
  debounceTime?: number
}): StateInterface<T> {
  const {
    key,
    initialValue,
    shouldSaveToStorage = false,
    debounceTime = 500
  } = params

  const fixedInitialValue = useMemo(() => {
    return initialValue
  }, [])

  const {
    read,
    write,
    watchForUpdates,
    endWatch
  } = useContext(SharedStateContext)

  const storage = useStorage()

  const forceRerender = useForceRerender()

  useEffect(() => {
    const rerender = () => {
      forceRerender()
    }

    watchForUpdates(key, rerender)

    return () => {
      endWatch(key, rerender)
    }
  })

  const update = (value: ValueOrFunction<T>) => {
    if (typeof value === 'function') {
      value = (value as TransformFunction<T>)(read()[key])
    }

    write(key, value)

    if (shouldSaveToStorage) {
      storage.setItem(key, value)
    }
  }

  const storedValue = shouldSaveToStorage ? storage.getItem(key) : undefined

  const val = read()[key] || storedValue || fixedInitialValue

  const debouncedValue = useDebouncedValue(val, debounceTime)

  return {
    value: val as T,
    debouncedValue: debouncedValue as T,
    setValue: update,
    clear: () => {
      update(initialValue)
    }
  }
}

export const createUseSharedState = <K extends string> () => {
  return <T>(params: {
    key: K,
    initialValue: T,
    shouldSaveToStorage?: boolean,
    debounceTime?: number
  }) => {
    return useSharedState<T, K>({
      key: params.key,
      initialValue: params.initialValue,
      shouldSaveToStorage: params.shouldSaveToStorage,
      debounceTime: params.debounceTime
    })
  }
}

