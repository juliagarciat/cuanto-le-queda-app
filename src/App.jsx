import { useCallback, useEffect, useState } from 'react'
import Navigation from './components/Navigation.jsx'
import FavoritesView from './views/FavoritesView.jsx'
import SearchStopView from './views/SearchStopView.jsx'
import NearbyView from './views/NearbyView.jsx'
import MapView from './views/MapView.jsx'
import AlertsView from './views/AlertsView.jsx'
import StopDetailView from './views/StopDetailView.jsx'
import { useFavorites } from './hooks/useFavorites.js'
import { useAlerts } from './hooks/useAlerts.js'

export default function App() {
  const [tab, setTab] = useState('favorites')
  const [stop, setStop] = useState(null) // parada abierta (detalle) o null
  const { favorites, isFavorite, toggleFavorite } = useFavorites()
  const alerts = useAlerts()

  // El botón "atrás" del móvil cierra el detalle en vez de salir de la PWA.
  const openStop = useCallback((s) => {
    history.pushState({ detail: true }, '')
    setStop(s)
  }, [])
  const closeStop = useCallback(() => history.back(), [])
  useEffect(() => {
    const onPop = () => setStop(null)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const changeTab = (id) => {
    if (stop) history.back()
    setTab(id)
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col bg-paper">
      <main className="min-h-0 flex-1 overflow-y-auto">
        {stop ? (
          <StopDetailView stop={stop} alerts={alerts} isFavorite={isFavorite(stop)} onToggleFavorite={toggleFavorite} onBack={closeStop} />
        ) : tab === 'favorites' ? (
          <FavoritesView favorites={favorites} onOpenStop={openStop} onGoSearch={() => setTab('search')} />
        ) : tab === 'search' ? (
          <SearchStopView onOpenStop={openStop} />
        ) : tab === 'map' ? (
          <MapView onOpenStop={openStop} />
        ) : tab === 'alerts' ? (
          <AlertsView alerts={alerts} />
        ) : (
          <NearbyView onOpenStop={openStop} />
        )}
      </main>
      <Navigation active={tab} onChange={changeTab} />
    </div>
  )
}
