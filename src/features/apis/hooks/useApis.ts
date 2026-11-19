
import { useContext } from 'react'

import { ApiContext } from '../context/ApiContext'

export function useApis() {
  const context = useContext(ApiContext)

  if (!context) {
    throw new Error(
      'useApis debe utilizarse dentro de ApiProvider'
    )
  }

  return context
}
