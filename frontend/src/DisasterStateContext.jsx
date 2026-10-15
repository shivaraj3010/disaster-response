
import { createContext, useContext } from 'react'

export const DisasterStateContext = createContext(null)

export function useDisasterState() {
  const context = useContext(DisasterStateContext)

  if (!context) {
    throw new Error(
      'useDisasterState must be used inside DisasterStateContext.Provider'
    )
  }

  return context
}
