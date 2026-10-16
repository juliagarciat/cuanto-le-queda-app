import { formatMinutes, readableTextColor } from '../utils/format.js'
import { WarningIcon } from './icons.jsx'

const FALLBACK = { urbano: '#9c1a3b', consorcio: '#1f6b66' }

export function LineChip({ arrival }) {
  const bg = arrival.color && arrival.color.toLowerCase() !== '#ffffff' ? arrival.color : FALLBACK[arrival.network]
  const fg = arrival.color && arrival.color.toLowerCase() !== '#ffffff' ? arrival.textColor || readableTextColor(bg) : '#ffffff'
  return (
    <span
      style={{ backgroundColor: bg, color: fg }}
      className="grid h-12 min-w-14 shrink-0 place-items-center rounded-xl px-2 font-display text-xl font-extrabold"
    >
      {arrival.line}
    </span>
  )
}

export default function BusCard({ arrival, hasAlert = false }) {
  const { value, unit } = formatMinutes(arrival.minutesLeft)
  const label = arrival.minutesLeft <= 0 ? 'llegando ya' : `en ${value} ${unit === 'h' ? 'horas' : 'minutos'}`
  return (
    <li
      aria-label={`Línea ${arrival.line} hacia ${arrival.destination}, ${label}`}
      className="flex items-center gap-3 rounded-2xl border border-hair bg-card p-3"
    >
      <LineChip arrival={arrival} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-base font-bold leading-tight">
          <span className="truncate">{arrival.destination}</span>
          {hasAlert && <WarningIcon width={16} height={16} className="shrink-0 text-granada" aria-label="Con aviso" />}
        </p>
        <p className="truncate text-sm text-muted">{arrival.agency}</p>
      </div>
      <div className="text-right">
        <p className="font-display text-3xl font-extrabold leading-none tabular-nums text-granada-deep">
          {value}
          {unit && <span className="ml-0.5 text-sm font-bold text-muted">{unit}</span>}
        </p>
        {arrival.scheduled && <p className="mt-1 text-xs text-muted">horario {arrival.time}</p>}
        {arrival.enRoute && <p className="text-xs font-bold text-azulejo">En ruta</p>}
      </div>
    </li>
  )
}
