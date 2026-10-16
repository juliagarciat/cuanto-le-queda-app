/**
 * Avisos e incidencias del Consorcio (cortes, obras, cambios de horario).
 *   GET {CTAN}/noticias?lang=ES → { noticias: [{ idNoticia, titulo, subTitulo, resumen, categoria,
 *                                               fechaInicio, fechafin, lineas: "12,34" | null }] }
 *   GET {CTAN}/lineas           → { lineas: [{ idLinea, codigo, nombre }] }   (para casar ids con códigos)
 * Solo cubre líneas metropolitanas: no hay fuente pública equivalente para los urbanos de Rober.
 */
import { fetchJson } from './http.js'
import { CTAN_BASE } from './consorcio.js'
import { readCache, writeCache } from '../utils/storage.js'

const TTL = 30 * 60 * 1000
const DAY = 86400000

const clean = (s) =>
  String(s ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const toDate = (v) => {
  if (!v) return null
  const d = new Date(String(v).replace(' ', 'T'))
  return Number.isNaN(d.getTime()) ? null : d
}

export const mapAlert = (n) => ({
  id: n.idNoticia,
  title: clean(n.titulo),
  subtitle: clean(n.subTitulo || n.resumen),
  category: clean(n.categoria),
  from: n.fechaInicio || null,
  to: n.fechafin || n.fechafinFija || null,
  // ids de línea separados por comas; vacío = aviso de todo el consorcio
  lines: n.lineas ? String(n.lineas).split(',').map((x) => x.trim()).filter(Boolean) : [],
})

/** Vigente hoy. Sin fecha de fin solo cuenta si empezó hace menos de 30 días. */
export function isActive(alert, now = new Date()) {
  const from = toDate(alert.from)
  const to = toDate(alert.to)
  if (from && from > now) return false
  if (to) return to.getTime() + DAY > now.getTime()
  return !from || now - from < 30 * DAY
}

/** ¿Afecta el aviso a esta línea? Acepta que `lineas` traiga ids internos o códigos. */
export function matchesLine(alert, code, idByCode = {}) {
  const id = idByCode[code]
  return alert.lines.includes(code) || (id != null && alert.lines.includes(String(id)))
}

let promise = null

export function loadAlerts({ force = false } = {}) {
  if (!force && promise) return promise
  promise = (async () => {
    const fresh = force ? null : readCache('alerts', TTL)
    if (fresh) return fresh
    try {
      const [news, lines] = await Promise.all([
        fetchJson(`${CTAN_BASE}/noticias?lang=ES`),
        fetchJson(`${CTAN_BASE}/lineas`).catch(() => ({ lineas: [] })),
      ])
      const idByCode = {}
      const codeById = {}
      for (const l of lines.lineas ?? []) {
        if (l.codigo != null && l.idLinea != null) {
          idByCode[l.codigo] = String(l.idLinea)
          codeById[String(l.idLinea)] = l.codigo
        }
      }
      const out = { alerts: (news.noticias ?? []).map(mapAlert), idByCode, codeById }
      writeCache('alerts', out)
      return out
    } catch (err) {
      const stale = readCache('alerts', Infinity) // un aviso de ayer vale más que nada
      if (stale) return stale
      throw err
    }
  })().catch((err) => {
    promise = null
    throw err
  })
  return promise
}
