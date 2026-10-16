import { WarningIcon } from './icons.jsx'

const fmt = (v) => {
  const d = v ? new Date(String(v).replace(' ', 'T')) : null
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : null
}

function range(from, to) {
  const a = fmt(from)
  const b = fmt(to)
  if (a && b) return `Del ${a} al ${b}`
  if (a) return `Desde el ${a}`
  return null
}

export default function AlertCard({ alert, codeById = {} }) {
  const codes = alert.lines.map((id) => codeById[id] ?? id)
  const dates = range(alert.from, alert.to)
  return (
    <li className="rounded-2xl border border-hair bg-card p-3">
      <div className="flex items-start gap-2">
        <WarningIcon width={20} height={20} className="mt-0.5 shrink-0 text-granada" />
        <div className="min-w-0">
          <p className="font-bold leading-snug">{alert.title}</p>
          {alert.subtitle && <p className="mt-1 text-sm text-muted">{alert.subtitle}</p>}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        {alert.category && <span className="rounded-full bg-hair px-2 py-0.5 font-bold">{alert.category}</span>}
        {codes.slice(0, 8).map((c) => (
          <span key={c} className="rounded-md bg-azulejo px-1.5 py-0.5 font-bold text-white">{c}</span>
        ))}
        {codes.length > 8 && <span className="text-muted">y {codes.length - 8} más</span>}
        {dates && <span className="text-muted">{dates}</span>}
      </div>
    </li>
  )
}
