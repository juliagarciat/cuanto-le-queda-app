import { BackIcon } from './icons.jsx'

export default function Header({ title, subtitle, onBack, action }) {
  return (
    <header className="sticky top-0 z-10 bg-paper/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur">
      <div className="flex items-center gap-1">
        {onBack && (
          <button onClick={onBack} aria-label="Volver" className="-ml-3 grid h-11 w-11 shrink-0 place-items-center rounded-full active:bg-hair">
            <BackIcon />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-extrabold leading-tight tracking-tight">{title}</h1>
          {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  )
}
