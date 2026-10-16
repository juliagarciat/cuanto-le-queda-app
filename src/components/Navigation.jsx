import { MapIcon, PinIcon, SearchIcon, StarIcon, WarningIcon } from './icons.jsx'

const TABS = [
  { id: 'favorites', label: 'Favoritos', Icon: StarIcon },
  { id: 'search', label: 'Buscar', Icon: SearchIcon },
  { id: 'map', label: 'Mapa', Icon: MapIcon },
  { id: 'nearby', label: 'Cerca', Icon: PinIcon },
  { id: 'alerts', label: 'Avisos', Icon: WarningIcon },
]

export default function Navigation({ active, onChange }) {
  return (
    <nav aria-label="Secciones" className="shrink-0 border-t border-hair bg-card pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md">
        {TABS.map(({ id, label, Icon }) => {
          const on = id === active
          return (
            <li key={id} className="flex-1">
              <button
                onClick={() => onChange(id)}
                aria-current={on ? 'page' : undefined}
                className={`flex h-16 w-full flex-col items-center justify-center gap-1 text-xs font-bold ${on ? 'text-granada' : 'text-muted'}`}
              >
                <Icon filled={on && id === 'favorites'} />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
