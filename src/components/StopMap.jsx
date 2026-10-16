import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const GRANADA = [37.1773, -3.5986]
const STOP_COLOR = { urbano: '#9c1a3b', consorcio: '#1f6b66' }
const MAX_MARKERS = 600
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

/**
 * Mapa Leaflet.
 * - stops: se pintan solo con zoom >= minStopZoom y dentro de la vista (máx. 600) para ir fluido con ~5.000 paradas.
 * - vehicles: [{ line, lat, lon }] como chips con el código de línea.
 * - focus: parada resaltada (el mapa se centra en ella y en los vehículos cercanos).
 */
export default function StopMap({
  stops = [],
  vehicles = [],
  focus = null,
  userPosition = null,
  showStops = true,
  minStopZoom = 14,
  onSelectStop,
  className = 'h-full w-full',
}) {
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const layersRef = useRef(null)
  const drawRef = useRef(null)
  const fittedRef = useRef(null)
  const latest = useRef({})
  latest.current = { stops, showStops, minStopZoom, onSelectStop, focus, userPosition }
  const [zoomedOut, setZoomedOut] = useState(false)

  // Creación del mapa (una vez)
  useEffect(() => {
    const map = L.map(elRef.current, { zoomControl: false, renderer: L.canvas({ tolerance: 10 }) })
    map.attributionControl.setPrefix(false)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)
    const layers = { stops: L.layerGroup().addTo(map), vehicles: L.layerGroup().addTo(map), marks: L.layerGroup().addTo(map) }
    mapRef.current = map
    layersRef.current = layers

    const { focus: f, userPosition: u } = latest.current
    if (f) map.setView([f.lat, f.lon], 16)
    else if (u) map.setView([u.lat, u.lon], 16)
    else map.setView(GRANADA, 13)

    const draw = () => {
      const { stops: all, showStops: show, minStopZoom: minZoom, onSelectStop: onSelect } = latest.current
      layers.stops.clearLayers()
      const low = map.getZoom() < minZoom
      setZoomedOut(show && low)
      if (!show || low) return
      const bounds = map.getBounds().pad(0.15)
      const c = map.getCenter()
      let visible = all.filter((s) => s.lat != null && s.lon != null && bounds.contains([s.lat, s.lon]))
      if (visible.length > MAX_MARKERS) {
        visible = visible
          .map((s) => [s, (s.lat - c.lat) ** 2 + (s.lon - c.lng) ** 2])
          .sort((a, b) => a[1] - b[1])
          .slice(0, MAX_MARKERS)
          .map((x) => x[0])
      }
      for (const s of visible) {
        L.circleMarker([s.lat, s.lon], { radius: 7, weight: 2, color: '#fff', fillColor: STOP_COLOR[s.network], fillOpacity: 1 })
          .on('click', () => onSelect?.(s))
          .addTo(layers.stops)
      }
    }
    drawRef.current = draw
    map.on('moveend', draw)
    draw()

    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(elRef.current)
    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => drawRef.current?.(), [stops, showStops, minStopZoom])

  // Parada resaltada y posición del usuario
  useEffect(() => {
    const { marks } = layersRef.current
    marks.clearLayers()
    if (focus) L.circleMarker([focus.lat, focus.lon], { radius: 11, weight: 4, color: '#fff', fillColor: '#9c1a3b', fillOpacity: 1 }).addTo(marks)
    if (userPosition) {
      L.circleMarker([userPosition.lat, userPosition.lon], { radius: 8, weight: 3, color: '#fff', fillColor: '#2563eb', fillOpacity: 1 }).addTo(marks)
      if (!focus) mapRef.current.setView([userPosition.lat, userPosition.lon], 16)
    }
  }, [focus?.lat, focus?.lon, userPosition?.lat, userPosition?.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  // Vehículos (se encuadran una sola vez para no pelearse con el usuario al refrescar)
  useEffect(() => {
    const map = mapRef.current
    const { vehicles: layer } = layersRef.current
    layer.clearLayers()
    for (const v of vehicles) {
      L.marker([v.lat, v.lon], {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({ className: '', iconSize: [0, 0], html: `<div class="cql-bus">${esc(v.line)}</div>` }),
      }).addTo(layer)
    }
    const key = focus ? `${focus.lat},${focus.lon}` : 'none'
    if (vehicles.length && fittedRef.current !== key) {
      const pts = vehicles.map((v) => [v.lat, v.lon])
      if (focus) pts.push([focus.lat, focus.lon])
      map.fitBounds(L.latLngBounds(pts).pad(0.3), { maxZoom: 16 })
      fittedRef.current = key
    }
  }, [vehicles, focus?.lat, focus?.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`relative ${className}`}>
      <div ref={elRef} className="absolute inset-0" />
      {zoomedOut && (
        <p className="pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/85 px-3 py-1.5 text-sm text-white">
          Acerca el mapa para ver las paradas
        </p>
      )}
    </div>
  )
}
