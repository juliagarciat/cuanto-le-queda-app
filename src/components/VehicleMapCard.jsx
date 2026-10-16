import { lazy, Suspense, useMemo } from 'react'
import { distanceMeters, formatDistance } from '../utils/geo.js'

const StopMap = lazy(() => import('./StopMap.jsx')) // Leaflet solo se descarga cuando hace falta
const MAX_KM = 15

export default function VehicleMapCard({ stop, vehicles }) {
  const focus = stop.lat != null && stop.lon != null ? stop : null
  const shown = useMemo(() => {
    const withDistance = vehicles.map((v) => ({ ...v, distance: focus ? distanceMeters(focus, v) : null }))
    return focus ? withDistance.filter((v) => v.distance <= MAX_KM * 1000).sort((a, b) => a.distance - b.distance) : withDistance
  }, [vehicles, focus])

  if (!shown.length) return null
  return (
    <section aria-label="Autobuses en ruta" className="overflow-hidden rounded-2xl border border-hair bg-card">
      <div className="h-56">
        <Suspense fallback={<div className="h-full animate-pulse bg-hair" />}>
          <StopMap focus={focus} vehicles={shown} showStops={false} />
        </Suspense>
      </div>
      <div className="p-3">
        <p className="font-bold">Autobuses en ruta</p>
        <ul className="mt-1 space-y-0.5 text-sm text-muted">
          {shown.slice(0, 5).map((v, i) => (
            <li key={`${v.line}-${v.direction}-${i}`}>
              Línea {v.line}
              {v.distance != null && `, a ${formatDistance(v.distance)} de la parada`}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">
          Posición de los autobuses de las líneas que paran aquí. Alguno puede haber pasado ya por la parada.
        </p>
      </div>
    </section>
  )
}
