/** Distancia en metros entre dos puntos (fórmula del haversine). */
export function distanceMeters(a, b) {
  const R = 6371000
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export const formatDistance = (m) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`)

export function nearestStops(stops, position, limit = 20) {
  return stops
    .filter((s) => s.lat != null && s.lon != null)
    .map((stop) => ({ stop, distance: distanceMeters(position, stop) }))
    .sort((x, y) => x.distance - y.distance)
    .slice(0, limit)
}
