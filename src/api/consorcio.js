/**
 * Autobuses interurbanos del Consorcio de Transporte Metropolitano del Área de Granada.
 *
 * Tiempos y posiciones (vía MovGR, que cruza horarios CTAN con posiciones en vivo):
 *   GET {MOVGR}/ctagr/llegadas/{parada}
 *     → { parada, proximos: [{ linea: { id }, destino, hora, minutos, sentido, en_ruta }],
 *         vehiculos: [{ linea, sentido, lat, lon, visto }] }
 * Respaldo si MovGR falla (sin posiciones), API abierta CTAN, consorcio nº 3:
 *   GET {CTAN}/paradas                 → { paradas: [{ idParada, nombre, municipio, nucleo, latitud, longitud }] }
 *   GET {CTAN}/paradas/{id}/servicios  → { servicios: [{ linea, idLinea, destino, nombre, servicio: "HH:MM", sentido }] }
 *
 * OJO: los minutos salen del horario previsto. `enRoute` significa que hay un autobús de esa
 * línea y sentido emitiendo posición ahora mismo; no garantiza que sea ese servicio concreto.
 */
import { fetchJson } from './http.js'
import { MOVGR_BASE } from './movgr.js'

export const CTAN_BASE = (import.meta.env.VITE_CTAN_BASE || '/api/ctan').replace(/\/$/, '')
export const AGENCY = 'Consorcio Metropolitano'
const MAX_AHEAD_MIN = 180

/** Minutos hasta HH:MM (hora de Madrid). Si ya pasó hace más de 1 min, se asume mañana. */
export function minutesUntil(hhmm, now = new Date()) {
  const [h, m] = hhmm.split(':').map(Number)
  const parts = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (t) => Number(parts.find((p) => p.type === t).value)
  let diff = h * 60 + m - (get('hour') * 60 + get('minute'))
  if (diff < -1) diff += 1440
  return Math.max(0, diff)
}

const num = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

// ── Adaptadores a la estructura unificada ──
export const mapStop = (p) => ({
  network: 'consorcio',
  id: String(p.idParada),
  name: p.nombre || `Parada ${p.idParada}`,
  municipality: p.municipio || p.nucleo || '',
  lat: num(p.latitud),
  lon: num(p.longitud),
})

const base = (stopId) => ({ agency: AGENCY, stopId: String(stopId), network: 'consorcio', color: null, textColor: null, scheduled: true })

/** Servicio de la ruta MovGR /ctagr/llegadas */
export const mapLiveArrival = (item, stopId) => ({
  ...base(stopId),
  line: item.linea.id,
  destination: item.destino || item.linea.nombre || item.linea.id,
  minutesLeft: item.minutos,
  time: (item.hora || '').slice(0, 5),
  direction: item.sentido ?? null,
  enRoute: Boolean(item.en_ruta),
})

/** Servicio de la API CTAN directa */
export const mapScheduledArrival = (item, stopId, now) => {
  const line = item.linea || String(item.idLinea)
  return {
    ...base(stopId),
    line,
    destination: item.destino || item.nombre || line,
    minutesLeft: minutesUntil(item.servicio, now),
    time: item.servicio.slice(0, 5),
    direction: item.sentido ?? null,
    enRoute: false,
  }
}

export const mapVehicle = (v) => ({ line: v.linea, direction: v.sentido ?? null, lat: num(v.lat), lon: num(v.lon), seen: v.visto ?? null })

/** Próximos ≤3 h; si hoy ya no queda nada, los primeros de mañana en vez de una pantalla vacía. */
function pickUpcoming(all) {
  const sorted = [...all].sort((a, b) => a.minutesLeft - b.minutesLeft)
  const soon = sorted.filter((a) => a.minutesLeft <= MAX_AHEAD_MIN)
  return soon.length ? soon : sorted.slice(0, 3)
}

/** Descarta vehículos de líneas/sentidos que no sirven a esta parada. */
export function relevantVehicles(vehicles, arrivals) {
  const keys = new Set(arrivals.map((a) => `${a.line}:${a.direction ?? '*'}`))
  return vehicles.filter(
    (v) => v.lat != null && v.lon != null && (keys.has(`${v.line}:${v.direction ?? '*'}`) || keys.has(`${v.line}:*`))
  )
}

export async function fetchStops(opts) {
  const data = await fetchJson(`${CTAN_BASE}/paradas`, { timeoutMs: 30000, ...opts })
  return (data.paradas ?? []).filter((p) => p.idParada != null).map(mapStop)
}

async function viaMovgr(stopId, opts) {
  const data = await fetchJson(`${MOVGR_BASE}/ctagr/llegadas/${encodeURIComponent(stopId)}`, opts)
  const arrivals = pickUpcoming((data.proximos ?? []).map((i) => mapLiveArrival(i, stopId)))
  return { arrivals, vehicles: relevantVehicles((data.vehiculos ?? []).map(mapVehicle), arrivals) }
}

async function viaCtan(stopId, opts) {
  const data = await fetchJson(`${CTAN_BASE}/paradas/${encodeURIComponent(stopId)}/servicios`, opts)
  const now = new Date()
  const all = (data.servicios ?? [])
    .filter((s) => /^\d{1,2}:\d{2}/.test(s.servicio || ''))
    .map((s) => mapScheduledArrival(s, stopId, now))
  return { arrivals: pickUpcoming(all), vehicles: [] }
}

export async function fetchArrivals(stopId, opts) {
  try {
    return await viaMovgr(stopId, opts)
  } catch (err) {
    if (opts?.signal?.aborted) throw err
    return viaCtan(stopId, opts) // MovGR caído: seguimos con horarios, sin posiciones
  }
}
