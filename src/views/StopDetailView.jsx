import { useMemo } from 'react'
import Header from '../components/Header.jsx'
import BusCard from '../components/BusCard.jsx'
import AlertCard from '../components/AlertCard.jsx'
import VehicleMapCard from '../components/VehicleMapCard.jsx'
import { RefreshIcon, StarIcon } from '../components/icons.jsx'
import { NETWORKS } from '../api/index.js'
import { useBusTimes } from '../hooks/useBusTimes.js'
import { clockTime } from '../utils/format.js'

export default function StopDetailView({ stop, alerts, isFavorite, onToggleFavorite, onBack }) {
  const { arrivals, vehicles, status, updatedAt, refresh } = useBusTimes(stop)
  const scheduled = arrivals.some((a) => a.scheduled)

  // Avisos vigentes que afectan a las líneas que pasan por esta parada (solo red metropolitana).
  const lineCodes = useMemo(
    () => (stop.network === 'consorcio' ? [...new Set(arrivals.map((a) => a.line))] : []),
    [stop.network, arrivals]
  )
  const stopAlerts = useMemo(() => (lineCodes.length ? alerts.forLines(lineCodes) : []), [alerts, lineCodes])
  const lineHasAlert = (code) => stopAlerts.length > 0 && alerts.forLines([code]).length > 0

  return (
    <>
      <Header
        title={stop.name}
        subtitle={`${NETWORKS[stop.network].label}, parada ${stop.id}`}
        onBack={onBack}
        action={
          <button
            onClick={() => onToggleFavorite(stop)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            className={`grid h-11 w-11 place-items-center rounded-full active:bg-hair ${isFavorite ? 'text-granada' : 'text-muted'}`}
          >
            <StarIcon filled={isFavorite} />
          </button>
        }
      />
      <div className="space-y-3 px-4 pb-6">
        {status === 'error' && (
          <p role="alert" className="rounded-xl bg-granada/10 p-3 text-sm text-granada-deep">
            {arrivals.length ? 'No se pudo actualizar. Mostrando los últimos datos recibidos.' : 'No se pudieron cargar los tiempos. Reintentando automáticamente.'}
          </p>
        )}

        {stopAlerts.length > 0 && (
          <section aria-label="Avisos en esta parada" className="space-y-2">
            <h2 className="font-display text-lg font-extrabold">
              {stopAlerts.length === 1 ? 'Hay un aviso en una línea de esta parada' : `Hay ${stopAlerts.length} avisos en líneas de esta parada`}
            </h2>
            <ul className="space-y-2">
              {stopAlerts.map((a) => <AlertCard key={a.id} alert={a} codeById={alerts.codeById} />)}
            </ul>
          </section>
        )}

        {status === 'loading' && (
          <ul className="space-y-2" aria-busy="true">
            {[0, 1, 2].map((i) => <li key={i} className="h-[74px] animate-pulse rounded-2xl bg-hair" />)}
          </ul>
        )}

        {arrivals.length > 0 && (
          <ul className="space-y-2">
            {arrivals.map((a, i) => (
              <BusCard key={`${a.line}-${a.destination}-${i}`} arrival={a} hasAlert={a.network === 'consorcio' && lineHasAlert(a.line)} />
            ))}
          </ul>
        )}

        {status === 'ok' && !arrivals.length && (
          <p className="rounded-2xl border border-dashed border-hair p-6 text-center text-muted">Ahora mismo no hay autobuses previstos en esta parada.</p>
        )}

        <VehicleMapCard stop={stop} vehicles={vehicles} />

        {scheduled && <p className="text-sm text-muted">Los horarios del Consorcio son los previstos. «En ruta» indica que hay un autobús de esa línea circulando en ese sentido.</p>}

        <div className="flex items-center justify-between pt-1 text-sm text-muted">
          <span>{updatedAt ? `Actualizado a las ${clockTime(updatedAt)}` : 'Cargando…'}</span>
          <button onClick={refresh} className="flex h-11 items-center gap-1.5 rounded-full px-3 font-bold text-granada active:bg-hair">
            <RefreshIcon width={18} height={18} /> Actualizar
          </button>
        </div>
      </div>
    </>
  )
}
