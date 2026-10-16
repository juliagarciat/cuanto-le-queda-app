/**
 * Autobuses urbanos de Granada (Transportes Rober) vía MovGR.
 *   GET /bus/paradas            → [{ id, nombre, lat, lon, lineas }]
 *   GET /bus/llegadas/{parada}  → { parada, proximos: [{ linea: { id, nombre, color, text_color }, destino, minutos }] }
 * Los minutos son en tiempo real (los calcula Rober), no horario teórico.
 */
import { fetchJson } from './http.js'

export const MOVGR_BASE = (import.meta.env.VITE_MOVGR_BASE || '/api/movgr').replace(/\/$/, '')
const BASE = MOVGR_BASE
export const AGENCY = 'Transportes Rober'

const hex = (c) => (c ? `#${String(c).replace('#', '')}` : null)

// ── Adaptadores a la estructura unificada ──
export const mapStop = (p) => ({
  network: 'urbano',
  id: String(p.id),
  name: p.nombre,
  municipality: 'Granada',
  lat: p.lat ?? null,
  lon: p.lon ?? null,
})

export const mapArrival = (item, stopId) => ({
  line: item.linea.id,
  destination: item.destino,
  minutesLeft: item.minutos,
  agency: AGENCY,
  stopId: String(stopId),
  // extras de presentación
  network: 'urbano',
  color: hex(item.linea.color),
  textColor: hex(item.linea.text_color),
  scheduled: false,
})

export async function fetchStops(opts) {
  const data = await fetchJson(`${BASE}/bus/paradas`, { timeoutMs: 20000, ...opts })
  return data.map(mapStop)
}

export async function fetchArrivals(stopId, opts) {
  const data = await fetchJson(`${BASE}/bus/llegadas/${encodeURIComponent(stopId)}`, opts)
  const arrivals = (data.proximos ?? []).map((item) => mapArrival(item, stopId)).sort((a, b) => a.minutesLeft - b.minutesLeft)
  return { arrivals, vehicles: [] } // la red urbana no publica posición de vehículos
}
