import { lazy, Suspense, useState } from 'react'
import Header from '../components/Header.jsx'
import { LocateIcon } from '../components/icons.jsx'
import { NETWORKS } from '../api/index.js'
import { useGeolocation } from '../hooks/useGeolocation.js'
import { useStops } from '../hooks/useStops.js'

const StopMap = lazy(() => import('../components/StopMap.jsx'))

export default function MapView({ onOpenStop }) {
  const { stops, status } = useStops()
  const geo = useGeolocation()
  const [selected, setSelected] = useState(null)

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Mapa"
        action={
          <button onClick={geo.request} aria-label="Ir a mi ubicación" className="grid h-11 w-11 place-items-center rounded-full text-granada active:bg-hair">
            <LocateIcon />
          </button>
        }
      />
      <div className="relative min-h-0 flex-1">
        <Suspense fallback={<div className="h-full animate-pulse bg-hair" />}>
          <StopMap stops={stops} userPosition={geo.position} onSelectStop={setSelected} />
        </Suspense>

        {status === 'loading' && <p className="absolute bottom-3 left-3 z-[1000] rounded-full bg-card px-3 py-1.5 text-sm shadow">Cargando paradas…</p>}
        {status === 'error' && <p role="alert" className="absolute bottom-3 left-3 right-3 z-[1000] rounded-xl bg-card p-3 text-sm text-granada-deep shadow">No se pudo cargar la lista de paradas.</p>}
        {(geo.status === 'denied' || geo.status === 'error') && !selected && (
          <p role="alert" className="absolute inset-x-3 bottom-3 z-[1000] rounded-xl bg-card p-3 text-sm text-granada-deep shadow">
            {geo.status === 'denied' ? 'Has bloqueado la ubicación en el navegador.' : 'No se pudo obtener tu ubicación.'}
          </p>
        )}

        {selected && (
          <div className="absolute inset-x-3 bottom-3 z-[1000] rounded-2xl bg-card p-3 shadow-lg">
            <p className="truncate font-bold">{selected.name}</p>
            <p className="truncate text-sm text-muted">
              {NETWORKS[selected.network].label}, parada {selected.id}
              {selected.municipality && selected.network === 'consorcio' ? `, ${selected.municipality}` : ''}
            </p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => onOpenStop(selected)} className="h-11 flex-1 rounded-xl bg-granada font-bold text-white active:bg-granada-deep">Ver tiempos</button>
              <button onClick={() => setSelected(null)} className="h-11 rounded-xl px-4 font-bold text-muted active:bg-hair">Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
