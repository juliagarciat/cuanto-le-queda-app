import { CloseIcon, SearchIcon } from './icons.jsx'

export default function SearchBar({ value, onChange, placeholder = 'Nombre de calle o nº de parada' }) {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar parada"
        className="h-12 w-full rounded-2xl border border-hair bg-card pl-12 pr-11 text-base outline-none focus:border-granada focus:ring-2 focus:ring-granada/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button onClick={() => onChange('')} aria-label="Borrar búsqueda" className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-muted">
          <CloseIcon width={20} height={20} />
        </button>
      )}
    </div>
  )
}
