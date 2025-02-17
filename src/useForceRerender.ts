import React from "react"

const useForceRerender = () => {
  const [
    ,
    setRenderCount
  ] = React.useState(0)

  const forceRerender = () => setRenderCount(value => value + 1)
  
  return forceRerender
}

export default useForceRerender