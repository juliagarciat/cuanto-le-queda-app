/**
 * Mock del backend de datos, solo para desarrollo.
 *
 * `vite dev` no tiene un servidor de datos, así que este plugin registra
 * middleware que responde a las rutas que consumen `src/api/` con datos
 * ficticios. Permite probar la app sin montar nada.
 *
 * Nunca se registra en el build de producción (`apply: 'serve'`).
 */

// ── Ayuda ─────────────────────────────────────────────────────────

/** Minutos transcurridos desde las 00:00 en la zona de Madrid. */
function minutesSinceMidnight(date = new Date()) {
  const parts = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return get('hour') * 60 + get('minute')
}

const twoDigits = (n) => String(n).padStart(2, '0')

/** "HH:MM" a partir de minutos desde las 00:00. */
function clockOf(minutes) {
  const h = Math.floor(minutes / 60) % 24
  return `${twoDigits(h)}:${twoDigits(minutes % 60)}`
}

/** Minutos hasta la hora "HH:MM" (misma lógica que `consorcio.js`). */
function minutesUntil(clock, nowMinutes) {
  const [h, m] = clock.split(':').map(Number)
  let diff = h * 60 + m - nowMinutes
  if (diff < 0) diff += 24 * 60
  return Math.max(0, diff)
}

// ── Urbano (Transportes Rober) ───────────────────────────────────

const URBAN_STOPS = [
  { id: '1', nombre: 'Estación de Autobuses', lat: 37.18, lon: -3.6 },
  { id: '2', nombre: 'Andrés Segovia', lat: 37.181, lon: -3.604 },
  { id: '3', nombre: 'Plaza Bib-Rambla', lat: 37.178, lon: -3.795 },
  { id: '4', nombre: 'Plaza Nueva', lat: 37.187, lon: -3.769 },
  { id: '5', nombre: 'Auditorio Manuel Blanco', lat: 37.183, lon: -3.79 },
  { id: '6', nombre: 'Avenida Menéndez Pelayo', lat: 37.185, lon: -3.72 },
  { id: '7', nombre: 'Calle Horno de Abad', lat: 37.183, lon: -3.75 },
  { id: '8', nombre: 'Hospital Universitario', lat: 37.195, lon: -3.508 },
  { id: '9', nombre: 'Parada de la Paz', lat: 37.16, lon: -3.68 },
  { id: '10', nombre: 'Parada Catedral', lat: 37.19, lon: -3.77 },
]

const URBAN_LINES = [
  { id: '12', nombre: 'Hospital', color: '#9c1a3b', text_color: '#ffffff' },
  { id: '34', nombre: 'Centro', color: '#1f6b66', text_color: '#ffffff' },
  { id: '26', nombre: 'Albaicín', color: '#d97706', text_color: '#ffffff' },
  { id: '38', nombre: 'San Jerónimo', color: '#7c3aed', text_color: '#ffffff' },
]

const URBAN_DESTINATIONS = {
  12: 'Hospital Universitario',
  34: 'Plaza Nueva',
  26: 'Barrio del Albaicín',
  38: 'San Jerónimo',
}

/** Catálogo de paradas: el adaptador de `movgr.js` espera un array. */
function urbanoStops() {
  return URBAN_STOPS.map((p) => ({
    network: 'urbano',
    id: String(p.id),
    name: p.nombre,
    municipality: 'Granada',
    lat: p.lat,
    lon: p.lon,
  }))
}

/** Próximos autobuses: `minutos` es lo que falta para la salida. */
function urbanoArrivals(stopId) {
  const picks = URBAN_LINES.map((line, i) => {
    const minutos = 2 + ((i * 4) % 12)
    return {
      linea: { id: line.id, nombre: line.nombre, color: line.color, text_color: line.text_color },
      destino: URBAN_DESTINATIONS[line.id] ?? line.nombre,
      minutos,
    }
  })
  return {
    parada: stopId,
    proximos: picks.sort((a, b) => a.minutos - b.minutos),
  }
}

// ── Metropolitano (Consorcio) ───────────────────────────────────

const CONSORCIO_STOPS = [
  { idParada: '1', nombre: 'Parada de la Concepción', municipio: 'Granada', nucleo: 'Centro', latitud: 37.18, longitud: -3.76 },
  { idParada: '2', nombre: 'Parada del Zoo', municipio: 'Granada', nucleo: 'Nueva', latitud: 37.21, longitud: -3.53 },
  { idParada: '3', nombre: 'Parada del Campus', municipio: 'Granada', nucleo: 'Nueva', latitud: 37.4, longitud: -3.52 },
  { idParada: '4', nombre: 'Parada del Aeropuerto', municipio: 'Granada', nucleo: 'Airport', latitud: 37.11, longitud: -3.6 },
  { idParada: '5', nombre: 'Parada del Albaicín', municipio: 'Granada', nucleo: 'Albaicín', latitud: 37.29, longitud: -3.82 },
  { idParada: '6', nombre: 'Parada de la Fuente', municipio: 'Granada', nucleo: 'Nueva', latitud: 37.39, longitud: -3.58 },
  { idParada: '7', nombre: 'Parada Libertadores', municipio: 'Granada', nucleo: 'Centro', latitud: 37.19, longitud: -3.78 },
  { idParada: '8', nombre: 'Parada Monasterio', municipio: 'Granada', nucleo: 'Centro', latitud: 37.14, longitud: -3.68 },
]

const CONSORCIO_LINES = [
  { idLinea: '1', codigo: '1', nombre: 'Granada · Loja' },
  { idLinea: '2', codigo: '2', nombre: 'Granada · Airport' },
  { idLinea: '3', codigo: '3', nombre: 'Granada · Aljibe' },
  { idLinea: '4', codigo: '4', nombre: 'Granada · Zaidín' },
]

const CONSORCIO_DESTINATIONS = {
  1: 'Hospital Universitario',
  2: 'Aeropuerto Federico García Lorca',
  3: 'Aljibe El Saladilla',
  4: 'Granada ciudad centro',
}

/** Catálogo de paradas: el adaptador espera `{ paradas: [...] }`. */
function consorcioStops() {
  return {
    paradas: CONSORCIO_STOPS.map((p) => ({
      idParada: String(p.idParada),
      nombre: p.nombre,
      municipio: p.municipio,
      nucleo: p.nucleo,
      latitud: p.latitud,
      longitud: p.longitud,
    })),
  }
}

/** Servicios programados (se usa el respaldo cuando MovGR falla). */
function consorcioServices(stopId) {
  const nowMinutes = minutesSinceMidnight()
  const picks = CONSORCIO_LINES.map((line, i) => {
    const clock = ['08:15', '11:30', '14:00', '17:45'][i % 4]
    return {
      linea: line.codigo,
      idLinea: line.idLinea,
      destino: CONSORCIO_DESTINATIONS[line.idLinea] ?? line.nombre,
      nombre: line.nombre,
      servicio: clock,
      sentido: i % 2 === 0 ? 'A' : 'B',
    }
  })
  return {
    parada: stopId,
    servicios: picks
      .map((s) => ({ ...s, minutos: minutesUntil(s.servicio, nowMinutes) }))
      .sort((a, b) => a.minutos - b.minutos),
  }
}

/** Servicios en curso y posición de vehículos. */
function consorcioLiveArrivals(stopId) {
  const nowMinutes = minutesSinceMidnight()
  const nowClock = clockOf(nowMinutes)

  const planned = [
    {
      line: '1',
      destino: CONSORCIO_DESTINATIONS[1],
      clock: '08:15',
      minutos: minutesUntil('08:15', nowMinutes),
      sentido: 'A',
      en_ruta: false,
    },
    {
      line: '2',
      destino: CONSORCIO_DESTINATIONS[2],
      clock: '11:30',
      minutos: minutesUntil('11:30', nowMinutes),
      sentido: 'A',
      en_ruta: true,
    },
    {
      line: '3',
      destino: CONSORCIO_DESTINATIONS[3],
      clock: '14:00',
      minutos: minutesUntil('14:00', nowMinutes),
      sentido: 'B',
      en_ruta: true,
    },
    {
      line: '4',
      destino: CONSORCIO_DESTINATIONS[4],
      clock: '17:45',
      minutos: minutesUntil('17:45', nowMinutes),
      sentido: 'A',
      en_ruta: false,
    },
  ].map((s) => ({
    line: s.line,
    linea: { id: s.line },
    destino: s.destino,
    hora: s.clock,
    minutos: s.minutos,
    sentido: s.sentido,
    en_ruta: s.en_ruta,
  }))

  const vehicles = []
  for (const s of planned) {
    if (!s.en_ruta) continue
    vehicles.push({
      linea: s.line,
      sentido: s.sentido,
      lat: 37.19,
      lon: -3.72,
      visto: nowClock,
    })
    vehicles.push({
      linea: s.line,
      sentido: s.sentido === 'A' ? 'B' : 'A',
      lat: 37.21,
      lon: -3.66,
      visto: nowClock,
    })
  }

  return { parada: stopId, proximos: planned, vehiculos: vehicles }
}

// ── Avisos (Consorcio) ──────────────────────────────────────────

const CONSORCIO_NOTICIAS = [
  {
    idNoticia: 1,
    titulo: 'Obra en la M-30',
    subTitulo: 'Corte entre los km 4 y 6',
    categoria: 'Obra',
    fechaInicio: '2026-10-10',
    fechafin: '2026-10-20',
    lineas: '1,2',
  },
  {
    idNoticia: 2,
    titulo: 'Cambio de horario en la línea 3',
    subTitulo: 'Por la ampliación de la estación central',
    categoria: 'Horario',
    fechaInicio: '2026-10-12',
    lineas: '3',
  },
]

const CONSORCIO_LINEAS = [
  { idLinea: '1', codigo: '1', nombre: 'Granada · Loja' },
  { idLinea: '2', codigo: '2', nombre: 'Granada · Airport' },
  { idLinea: '3', codigo: '3', nombre: 'Granada · Aljibe' },
  { idLinea: '4', codigo: '4', nombre: 'Granada · Zaidín' },
]

function clean(s) {
  return String(s ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function consorcioNews() {
  return {
    noticias: CONSORCIO_NOTICIAS.map((n) => ({
      id: n.idNoticia,
      title: clean(n.titulo),
      subtitle: clean(n.subTitulo),
      category: clean(n.categoria),
      from: n.fechaInicio,
      to: n.fechafin ?? null,
      lines: n.lineas ? n.lineas.split(',').map((x) => x.trim()).filter(Boolean) : [],
    })),
  }
}

function consorcioLines() {
  return { lineas: CONSORCIO_LINEAS }
}

// ── Servidor ────────────────────────────────────────────────────

function sendJson(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
  return true
}

function parseRoute(pathname) {
  let stopId = null
  let handler = null
  if (pathname === '/api/movgr/bus/paradas' || pathname === '/api/movgr/bus/paradas/') {
    handler = urbanoStops
  } else if (pathname.startsWith('/api/movgr/bus/llegadas/')) {
    stopId = decodeURIComponent(pathname.slice('/api/movgr/bus/llegadas/'.length).split('/')[0])
    handler = (id) => urbanoArrivals(id)
  } else if (pathname.startsWith('/api/movgr/ctagr/llegadas/')) {
    stopId = decodeURIComponent(pathname.slice('/api/movgr/ctagr/llegadas/'.length).split('/')[0])
    handler = (id) => consorcioLiveArrivals(id)
  } else if (pathname === '/api/ctan/paradas' || pathname === '/api/ctan/paradas/') {
    handler = consorcioStops
  } else if (pathname.startsWith('/api/ctan/paradas/') && pathname.endsWith('/servicios')) {
    const rest = pathname.slice('/api/ctan/paradas/'.length, -'/servicios'.length)
    stopId = decodeURIComponent(rest.split('/')[0])
    handler = (id) => consorcioServices(id)
  } else if (pathname === '/api/ctan/noticias' || pathname === '/api/ctan/noticias/') {
    handler = consorcioNews
  } else if (pathname === '/api/ctan/lineas' || pathname === '/api/ctan/lineas/') {
    handler = consorcioLines
  }
  return { handler, stopId }
}

async function handleApiRequest(req, res) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const { handler, stopId } = parseRoute(url.pathname)
  if (!handler) {
    return false // no es una ruta de datos: se deja pasar
  }
  const data = await handler(stopId)
  sendJson(res, 200, data)
  return true
}

export function mockApiPlugin() {
  return {
    name: 'cuanto-le-queda-mock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        handleApiRequest(req, res).catch(next).then((handled) => {
          if (!handled) next()
        })
      })
    },
  }
}

export default mockApiPlugin
