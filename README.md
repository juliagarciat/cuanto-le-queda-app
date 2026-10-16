# ¿Cuánto me queda?

Aplicación web (React + Vite) para consultar **cuánto queda hasta el próximo autobús** en Granada y su área metropolitana, con datos en tiempo real.

## Scripts

- `npm run dev` — servidor de desarrollo.
- `npm run build` — build de producción (Vite + Tailwind CSS).
- `npm run preview` — sirve el build de producción.
- `npm run lint` — linter (oxlint).

## Secciones

- **Favoritos** — paradas guardadas en el navegador.
- **Buscar parada** — catálogo unificado de paradas de ambas redes; también se puede consultar por número aunque no esté en el catálogo.
- **Mapa** — paradas y autobuses en ruta (Leaflet), centrado en la parada seleccionada o en tu posición.
- **Cerca** — las 20 paradas más próximas a tu ubicación (geolocalización).
- **Avisos** — cortes, obras y cambios de horario del Consorcio.
- **Detalle de parada** — próximos autobuses con la cuenta regresiva, posición en vivo y avisos de las líneas que paran ahí.

## Datos

Dos fuentes se combinan bajo una fachada única (`src/api`):

- **Urbano** (`Transportes Rober`, vía MovGR): paradas y tiempos reales.
- **Metropolitano** (`Consorcio Metropolitano`, vía MovGR y API CTAN): tiempos, horarios y posición en ruta; si MovGR falla se usan los horarios de la API CTAN.

Los catálogos y avisos se cachean en `localStorage` con caducidad. Los estilos utilitarios provienen de Tailwind CSS v4, configurado en `src/index.css`.

## Estructura

```
src/
  api/         fachada de datos y adaptadores por red
  components/  componentes de UI (incluido el mapa con Leaflet)
  hooks/       estados reutilizables (tiempos, avisos, favoritos…)
  utils/       formateo, búsqueda, geolocalización y persistencia
  views/       pantallas de la aplicación
```
