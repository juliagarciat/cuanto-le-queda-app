import { NETWORKS } from '../api/index.js'
import { formatDistance } from '../utils/geo.js'

const DOT = { urbano: 'bg-granada', consorcio: 'bg-azulejo' }

export default function StopListItem({ stop, distance, onClick }) {
  return (
    <li>
      <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-hair bg-card p-3 text-left active:bg-hair/60">
        <span className={`h-10 w-1.5 shrink-0 rounded-full ${DOT[stop.network]}`} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">{stop.name}</span>
          <span className="block truncate text-sm text-muted">
            {NETWORKS[stop.network].label}, parada {stop.id}
            {stop.municipality && stop.network === 'consorcio' ? `, ${stop.municipality}` : ''}
          </span>
        </span>
        {distance != null && <span className="shrink-0 text-sm font-bold tabular-nums text-muted">{formatDistance(distance)}</span>}
      </button>
    </li>
  )
}
