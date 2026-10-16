import Header from '../components/Header.jsx'
import StopSummaryCard from '../components/StopSummaryCard.jsx'
import { stopKey } from '../utils/format.js'

// Parada urbana de ejemplo (Avda. Sierra Nevada 97) para probar sin guardar nada.
const DEMO_STOP = { network: 'urbano', id: '9', name: 'Avda. Sierra Nevada 97', municipality: 'Granada' }

export default function FavoritesView({ favorites, onOpenStop, onGoSearch }) {
  return (
    <>
      <Header title="¿Cuánto le queda?" subtitle="Autobuses de Granada" />
      <div className="px-4 pb-6">
        {favorites.length ? (
          <ul className="space-y-2">
            {favorites.map((stop) => (
              <StopSummaryCard key={stopKey(stop)} stop={stop} onClick={() => onOpenStop(stop)} />
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-hair p-6 text-center">
            <p className="font-display text-xl font-extrabold">Aún no tienes paradas guardadas</p>
            <p className="mt-1 text-muted">Busca tu parada y toca la estrella para verla aquí con un solo toque.</p>
            <div className="mt-5 flex flex-col gap-2">
              <button onClick={onGoSearch} className="h-12 rounded-xl bg-granada font-bold text-white active:bg-granada-deep">Buscar una parada</button>
              <button onClick={() => onOpenStop(DEMO_STOP)} className="h-12 rounded-xl font-bold text-granada active:bg-hair">Probar con una parada de ejemplo</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
