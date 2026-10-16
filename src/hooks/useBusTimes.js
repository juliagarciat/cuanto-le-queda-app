import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchArrivals } from '../api/index.js'
import { stopKey } from '../utils/format.js'

/**
 * Tiempos de una parada con refresco automático.
 * - Polling cada `intervalMs` (por defecto 25 s), pausado si la pestaña/app está en segundo plano.
 * - Al volver a primer plano refresca al instante.
 * - Si un refresco falla, conserva los últimos datos y marca status "error".
 */
export function useBusTimes(stop, { intervalMs = 25000, enabled = true } = {}) {
  const [state, setState] = useState({ arrivals: [], vehicles: [], status: 'loading', error: null, updatedAt: null })
  const abortRef = useRef(null)
  const stopRef = useRef(stop)
  stopRef.current = stop
  const key = stop ? stopKey(stop) : null

  const load = useCallback(async () => {
    if (!stopRef.current) return
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      const { arrivals, vehicles } = await fetchArrivals(stopRef.current, { signal: ctrl.signal })
      setState({ arrivals, vehicles, status: 'ok', error: null, updatedAt: Date.now() })
    } catch (error) {
      if (error.name === 'AbortError') return
      setState((s) => ({ ...s, status: 'error', error }))
    }
  }, [])

  useEffect(() => {
    if (!key || !enabled) return undefined
    setState({ arrivals: [], vehicles: [], status: 'loading', error: null, updatedAt: null })
    load()
    const visibleLoad = () => document.visibilityState === 'visible' && load()
    const timer = setInterval(visibleLoad, intervalMs)
    document.addEventListener('visibilitychange', visibleLoad)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', visibleLoad)
      abortRef.current?.abort()
    }
  }, [key, enabled, intervalMs, load])

  return { ...state, refresh: load }
}
