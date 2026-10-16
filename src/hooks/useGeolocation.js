import { useCallback, useState } from 'react'

/** status: idle | asking | granted | denied | unsupported | error */
export function useGeolocation() {
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [state, setState] = useState({ position: null, status: supported ? 'idle' : 'unsupported' })

  const request = useCallback(() => {
    if (!supported) return
    setState((s) => ({ ...s, status: 'asking' }))
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          position: { lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy },
          status: 'granted',
        }),
      (err) => setState({ position: null, status: err.code === err.PERMISSION_DENIED ? 'denied' : 'error' }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }, [supported])

  return { ...state, request }
}
