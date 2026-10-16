const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

/** Busca por nombre, municipio o número de parada. Prioriza coincidencias exactas y al inicio. */
export function searchStops(stops, query, limit = 40) {
  const q = normalize(query).trim()
  if (!q) return []
  const terms = q.split(/\s+/)
  const scored = []
  for (const stop of stops) {
    const name = normalize(stop.name)
    const hay = `${name} ${normalize(stop.municipality)}`
    if (!terms.every((t) => hay.includes(t)) && stop.id !== q) continue
    let score = 3
    if (stop.id === q) score = 0
    else if (name.startsWith(q)) score = 1
    else if (name.includes(q)) score = 2
    scored.push({ stop, score })
  }
  return scored
    .sort((a, b) => a.score - b.score || a.stop.name.localeCompare(b.stop.name, 'es'))
    .slice(0, limit)
    .map((x) => x.stop)
}
