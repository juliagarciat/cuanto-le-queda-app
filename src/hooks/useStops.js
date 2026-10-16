import { useCallback, useEffect, useState } from 'react'
import { loadStops } from '../api/index.js'

/** Catálogo de paradas (ambas redes). status: loading | ready | error. `partial` si falló una de las dos redes. */
export function useStops() {
  const [state, setState] = useState({ status: 'loading', stops: [], partial: false })

  const load = useCallback((force) => {
    let cancelled = false
    setState((s) => ({ ...s, status: 'loading' }))
    loadStops({ force })
      .then(({ stops, partial }) => !cancelled && setState({ status: 'ready', stops, partial }))
      .catch(() => !cancelled && setState({ status: 'error', stops: [], partial: false }))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => load(false), [load])
  return { ...state, reload: () => load(true) }
}
