const FAVORITES_KEY = 'cql:favorites:v1'
const CACHE_PREFIX = 'cql:cache:v1:'

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* modo privado o cuota llena: la app sigue funcionando sin persistir */
  }
}

// ── Favoritos ──
export const loadFavorites = () => {
  const list = read(FAVORITES_KEY)
  return Array.isArray(list) ? list : []
}
export const saveFavorites = (list) => write(FAVORITES_KEY, list)

// ── Caché con caducidad (catálogos de paradas) ──
export function readCache(name, ttlMs) {
  const entry = read(CACHE_PREFIX + name)
  return entry && Date.now() - entry.at < ttlMs ? entry.value : null
}
export const writeCache = (name, value) => write(CACHE_PREFIX + name, { at: Date.now(), value })
