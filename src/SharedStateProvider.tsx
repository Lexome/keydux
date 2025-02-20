
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



export class StateManager {
  state: SharedState
  rerendersToTrigger: {
    [key: string]: RenderFunction[]
  }

  constructor() {
    this.state = {}
    this.rerendersToTrigger = {}
    this.read = this.read.bind(this)
    this.write = this.write.bind(this)
    this.watchForUpdates = this.watchForUpdates.bind(this)
    this.endWatch = this.endWatch.bind(this)
  }

  write<T = any>(key: string, value: T) {
    const lastValue = this.state[key]

    this.state[key] = value

    this.rerendersToTrigger[key]?.forEach((render) => {
      render({ lastValue, newValue: value })
    })
  }

  read() {
    return this.state
  }

  watchForUpdates(key: string, rerenderFunction: RenderFunction) {
    if (!this.rerendersToTrigger[key]) {
      this.rerendersToTrigger[key] = []
    }

    this.rerendersToTrigger[key].push(rerenderFunction)
  }

  endWatch(key: string, subscription: RenderFunction) {
    this.rerendersToTrigger[key] = this.rerendersToTrigger[key].filter((s) => s !== subscription)
  }
}

type SharedStateProviderProps = PropsWithChildren<{
  stateManager: StateManager
}>


export const SharedStateProvider: FC<SharedStateProviderProps> = ({
  children,
  stateManager: stateManagerProp
}) => {
  const stateManager = useRef<StateManager>(stateManagerProp || new StateManager())

  return (
    <SharedStateContext.Provider
      value={{
        read: stateManager.current.read,
        write: stateManager.current.write,
        watchForUpdates: stateManager.current.watchForUpdates,
        endWatch: stateManager.current.endWatch
      }}
    >
      {children}
    </SharedStateContext.Provider>
  )
}
