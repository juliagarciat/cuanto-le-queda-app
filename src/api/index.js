/** Fachada única: las vistas no saben qué API hay detrás. */
import * as movgr from './movgr.js'
import * as consorcio from './consorcio.js'
import { readCache, writeCache } from '../utils/storage.js'

const SOURCES = { urbano: movgr, consorcio }
const STOPS_TTL = 24 * 60 * 60 * 1000

export const NETWORKS = {
  urbano: { label: 'Urbano', agency: movgr.AGENCY },
  consorcio: { label: 'Metropolitano', agency: consorcio.AGENCY },
}

/** Próximos autobuses de una parada → [{ line, destination, minutesLeft, agency, stopId, ... }] */
export const fetchArrivals = (stop, opts) => SOURCES[stop.network].fetchArrivals(stop.id, opts)

let stopsPromise = null

/** Catálogo unificado de paradas de ambas redes. Cacheado en memoria y 24 h en localStorage. */
export function loadStops({ force = false } = {}) {
  if (!force && stopsPromise) return stopsPromise
  stopsPromise = (async () => {
    const cached = force ? null : readCache('stops', STOPS_TTL)
    if (cached) return cached
    const results = await Promise.allSettled(Object.values(SOURCES).map((s) => s.fetchStops()))
    const stops = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    if (!stops.length) throw new Error('No se pudo cargar el catálogo de paradas')
    const out = { stops, partial: results.some((r) => r.status === 'rejected') }
    if (!out.partial) writeCache('stops', out)
    return out
  })().catch((err) => {
    stopsPromise = null
    throw err
  })
  return stopsPromise
}
