import { useCallback, useEffect, useState } from 'react'
import { loadFavorites, saveFavorites } from '../utils/storage.js'
import { stopKey } from '../utils/format.js'

const slim = ({ network, id, name, municipality, lat, lon }) => ({ network, id, name, municipality, lat, lon })

export function useFavorites() {
  const [favorites, setFavorites] = useState(loadFavorites)
  useEffect(() => saveFavorites(favorites), [favorites])

  const isFavorite = useCallback((stop) => favorites.some((f) => stopKey(f) === stopKey(stop)), [favorites])
  const toggleFavorite = useCallback(
    (stop) =>
      setFavorites((list) =>
        list.some((f) => stopKey(f) === stopKey(stop)) ? list.filter((f) => stopKey(f) !== stopKey(stop)) : [...list, slim(stop)]
      ),
    []
  )
  return { favorites, isFavorite, toggleFavorite }
}
