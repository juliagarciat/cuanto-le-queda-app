import { useMemo, useState } from 'react'
import Header from '../components/Header.jsx'
import SearchBar from '../components/SearchBar.jsx'
import StopListItem from '../components/StopListItem.jsx'
import { useStops } from '../hooks/useStops.js'
import { searchStops } from '../utils/search.js'

export default function SearchStopView({ onOpenStop }) {
  const { stops, status, partial, reload } = useStops()
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchStops(stops, query), [stops, query])
  const q = query.trim()
  // Las paradas urbanas se pueden consultar por número aunque no estén en el catálogo.
  const directNumber = /^\d+$/.test(q) && !results.some((s) => s.network === 'urbano' && s.id === q) ? q : null

  return (
    <>
      <Header title="Buscar parada" />
      <div className="space-y-3 px-4 pb-6">
        <SearchBar value={query} onChange={setQuery} />

        {status === 'loading' && <p className="py-6 text-center text-muted">Cargando paradas…</p>}
        {status === 'error' && (
          <div role="alert" className="rounded-xl bg-granada/10 p-3 text-sm text-granada-deep">
            No se pudo cargar la lista de paradas.{' '}
            <button onClick={reload} className="font-bold underline">Reintentar</button>
          </div>
        )}
        {partial && status === 'ready' && (
          <p className="rounded-xl bg-granada/10 p-3 text-sm text-granada-deep">
            Solo se ha podido cargar una de las dos redes. <button onClick={reload} className="font-bold underline">Reintentar</button>
          </p>
        )}

        <ul className="space-y-2">
          {directNumber && (
            <StopListItem
              stop={{ network: 'urbano', id: directNumber, name: `Parada urbana ${directNumber}`, municipality: 'Granada' }}
              onClick={() => onOpenStop({ network: 'urbano', id: directNumber, name: `Parada ${directNumber}`, municipality: 'Granada' })}
            />
          )}
          {results.map((stop) => (
            <StopListItem key={`${stop.network}:${stop.id}`} stop={stop} onClick={() => onOpenStop(stop)} />
          ))}
        </ul>

        {status === 'ready' && !q && <p className="py-6 text-center text-muted">Escribe el nombre de la calle o el número que figura en la marquesina.</p>}
        {status === 'ready' && q && !results.length && !directNumber && <p className="py-6 text-center text-muted">No hay paradas que coincidan con «{q}».</p>}
      </div>
    </>
  )
}
