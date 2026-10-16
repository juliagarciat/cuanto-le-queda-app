/** Clave única de parada: los ids de ambas redes pueden coincidir. */
export const stopKey = (stop) => `${stop.network}:${stop.id}`

/** Convierte minutos en { value, unit } para pintar el número grande. */
export function formatMinutes(minutes) {
  if (minutes <= 0) return { value: 'Ya', unit: '' }
  if (minutes < 60) return { value: String(minutes), unit: 'min' }
  const h = Math.floor(minutes / 60)
  const m = String(minutes % 60).padStart(2, '0')
  return { value: `${h}:${m}`, unit: 'h' }
}

/** Texto negro o blanco según la luminancia del fondo (para chips de línea). */
export function readableTextColor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return '#FFFFFF'
  const n = parseInt(m[1], 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#17211E' : '#FFFFFF'
}

export const clockTime = (ts) =>
  new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
