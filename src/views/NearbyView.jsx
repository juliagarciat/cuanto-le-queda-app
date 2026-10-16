import { useEffect, useMemo } from 'react'
import Header from '../components/Header.jsx'
import StopListItem from '../components/StopListItem.jsx'
import { useGeolocation } from '../hooks/useGeolocation.js'
import { useStops } from '../hooks/useStops.js'
import { nearestStops } from '../utils/geo.js'

const MESSAGES = {
  denied: 'Has bloqueado la ubicación. Actívala en los ajustes del navegador para ver las paradas cercanas.',
  error: 'No se pudo obtener tu ubicación. Comprueba que el GPS está activado.',
  unsupported: 'Este dispositivo no permite obtener la ubicación.',
}

export default function NearbyView({ onOpenStop }) {
  const geo = useGeolocation()
  const { stops, status } = useStops()
  const { request } = geo
  useEffect(() => request(), [request])

  const nearby = useMemo(() => (geo.position ? nearestStops(stops, geo.position) : []), [stops, geo.position])
  const failed = MESSAGES[geo.status]

  return (
    <>
      <Header title="Cerca de mí" subtitle={geo.status === 'granted' ? 'Las 20 paradas más próximas' : undefined} />
      <div className="space-y-3 px-4 pb-6">
        {(geo.status === 'asking' || (geo.status === 'granted' && status === 'loading')) && <p className="py-6 text-center text-muted">Buscando paradas cerca de ti…</p>}
        {failed && (
          <div role="alert" className="rounded-xl bg-granada/10 p-3 text-sm text-granada-deep">
            {failed}
            {geo.status !== 'unsupported' && <button onClick={request} className="ml-1 font-bold underline">Reintentar</button>}
          </div>
        )}
        {status === 'error' && <p role="alert" className="rounded-xl bg-granada/10 p-3 text-sm text-granada-deep">No se pudo cargar la lista de paradas.</p>}
        <ul className="space-y-2">
          {nearby.map(({ stop, distance }) => (
            <StopListItem key={`${stop.network}:${stop.id}`} stop={stop} distance={distance} onClick={() => onOpenStop(stop)} />
          ))}
        </ul>
      </div>
    </>
  )
}
