import { useBusTimes } from '../hooks/useBusTimes.js'
import { formatMinutes } from '../utils/format.js'
import { LineChip } from './BusCard.jsx'

/** Tarjeta de favorito: nombre de la parada y los 3 próximos buses, con refresco propio. */
export default function StopSummaryCard({ stop, onClick }) {
  const { arrivals, status } = useBusTimes(stop)
  const next = arrivals.slice(0, 3)
  return (
    <li>
      <button onClick={onClick} className="w-full rounded-2xl border border-hair bg-card p-3 text-left active:bg-hair/60">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate font-bold">{stop.name}</span>
          <span className="shrink-0 text-sm text-muted">Parada {stop.id}</span>
        </span>
        <span className="mt-2 block space-y-1.5">
          {status === 'loading' && <span className="block h-10 animate-pulse rounded-xl bg-hair" />}
          {status !== 'loading' && !next.length && (
            <span className="block text-sm text-muted">{status === 'error' ? 'No se pudo cargar' : 'Sin próximos autobuses'}</span>
          )}
          {next.map((a, i) => {
            const { value, unit } = formatMinutes(a.minutesLeft)
            return (
              <span key={`${a.line}-${a.destination}-${i}`} className="flex items-center gap-2">
                <span className="scale-75 origin-left"><LineChip arrival={a} /></span>
                <span className="-ml-3 min-w-0 flex-1 truncate text-sm">{a.destination}</span>
                <span className="font-display text-xl font-extrabold tabular-nums text-granada-deep">
                  {value}
                  <span className="ml-0.5 text-xs text-muted">{unit}</span>
                </span>
              </span>
            )
          })}
        </span>
      </button>
    </li>
  )
}
