import React from 'react'

const fallbackMemory: {
  [key: string]: string
} = {}

const isBrowser = typeof window !== 'undefined'
interface _Storage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

const fallbackStorage: _Storage = {
  getItem(key: string) {
    return fallbackMemory[key]
  },

  setItem(key: string, value: string) {
    fallbackMemory[key] = value
  },
}

export class StorageAdaptor implements _Storage {
  prefix?: string
  storage: _Storage

  // Cache parsed objects to avoid parsing them on every call
  // In addition to performance, this is crucial when doing
  // object identity checks
  objectCache: {
    [key: string]: any
  } = {}

  constructor(prefix?: string) {
    if (isBrowser) {
      this.storage = window.localStorage || fallbackStorage
    } else {
      this.storage = fallbackStorage
    }
    this.prefix = prefix
  }

  getStorageKey(key: string) {
    return this.prefix ? `${this.prefix}-${key}` : key
  }

  getItem(key: string) {
    const storageKey = this.getStorageKey(key)

    if (this.objectCache[storageKey]) {
      return this.objectCache[storageKey]
    }

    const item = this.storage.getItem(storageKey)
    try {
      const parsedItem = item ? JSON.parse(item) : undefined

      if (typeof parsedItem === 'object' && parsedItem !== null) {
        this.objectCache[storageKey] = parsedItem
      }

      return parsedItem

    } catch {
      return undefined
    }
  }

  setItem(key: string, value: any) {
    const storageKey = this.getStorageKey(key)

    if (typeof value === 'object' && value !== null) {
      this.objectCache[storageKey] = value
    }

    this.storage.setItem(storageKey, JSON.stringify(value))
  }
}

export const useStorage = (prefix?: string) => {
  const storage = React.useMemo(() => {
    return new StorageAdaptor(prefix)
  }, [prefix])

  return storage
}

export const useStoredValue = <V>(key: string, defaultValue: V) => {
  const storage = useStorage()
  const [value, setValue] = React.useState<V>(storage.getItem(key) || defaultValue)

  const set = (value: V) => {
    storage.setItem(key, value)
    setValue(value)
  }

  return [value, set] as const
}