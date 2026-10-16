import { useCallback, useEffect, useMemo, useState } from 'react'
import { isActive, loadAlerts, matchesLine } from '../api/alerts.js'

/** Avisos vigentes del Consorcio. status: loading | ready | error */
export function useAlerts() {
  const [state, setState] = useState({ status: 'loading', alerts: [], idByCode: {}, codeById: {} })

  const load = useCallback((force) => {
    let cancelled = false
    setState((s) => ({ ...s, status: 'loading' }))
    loadAlerts({ force })
      .then((data) => !cancelled && setState({ status: 'ready', ...data }))
      .catch(() => !cancelled && setState((s) => ({ ...s, status: 'error' })))
    return () => {
      cancelled = true
    }
  }, [])
  useEffect(() => load(false), [load])

  const active = useMemo(
    () => state.alerts.filter((a) => isActive(a)).sort((a, b) => String(b.from).localeCompare(String(a.from))),
    [state.alerts]
  )
  /** Avisos vigentes que afectan a alguna de estas líneas (códigos del Consorcio). */
  const forLines = useCallback(
    (codes) => active.filter((a) => codes.some((c) => matchesLine(a, c, state.idByCode))),
    [active, state.idByCode]
  )
  return { status: state.status, active, codeById: state.codeById, forLines, reload: () => load(true) }
}
