import React, { FC, PropsWithChildren, useRef } from "react"

type SharedState = {
  [key: string]: any
}

type SharedStateOperations = {
  read: () => SharedState,
  write: (key: string, value: any) => void,
  watchForUpdates: (key: string, subscription: RenderFunction) => void
  endWatch: (key: string, subscription: RenderFunction) => void
}

export const SharedStateContext = React.createContext<SharedStateOperations>({
  read: () => ({}),
  write: () => {},
  watchForUpdates: () => {},
  endWatch: () => {}
})

export type RenderFunction = ({
  lastValue,
  newValue
}: {
  lastValue: any
  newValue: any
}) => void

export const SharedStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const state = useRef<SharedState>({})
  const rerendersToTrigger = useRef<{
    [key: string]: RenderFunction[]
  }>({})

  function write<T = any>(key: string, value: T) {
    const lastValue = state.current[key]

    state.current[key] = value

    rerendersToTrigger.current[key]?.forEach((render) => {
      render({ lastValue, newValue: value })
    })
  }

  function read() {
    return state.current
  }

  // Adds rerender function to trigger when a key's value changes
  function watchForUpdates(key: string, rerenderFunction: RenderFunction) {
    if (!rerendersToTrigger.current[key]) {
      rerendersToTrigger.current[key] = []
    }
    rerendersToTrigger.current[key].push(rerenderFunction)
  }

  // Removes rerender function watched for a key
  function endWatch(key: string, rerenderFunction: Function) {
    rerendersToTrigger.current[key] =
      rerendersToTrigger.current[key].filter((s) => s !== rerenderFunction)
  }

  return (
    <SharedStateContext.Provider
      value={{
        read,
        write,
        watchForUpdates,
        endWatch
      }}
    >
      {children}
    </SharedStateContext.Provider>
  )
}

