import Header from '../components/Header.jsx'
import AlertCard from '../components/AlertCard.jsx'

export default function AlertsView({ alerts }) {
  const { status, active, codeById, reload } = alerts
  return (
    <>
      <Header title="Avisos" subtitle="Cortes, obras y cambios de horario" />
      <div className="space-y-2 px-4 pb-6">
        {status === 'loading' && !active.length && <p className="py-6 text-center text-muted">Cargando avisos…</p>}
        {status === 'error' && (
          <div role="alert" className="rounded-xl bg-granada/10 p-3 text-sm text-granada-deep">
            No se pudieron cargar los avisos. <button onClick={reload} className="font-bold underline">Reintentar</button>
          </div>
        )}
        {status === 'ready' && !active.length && <p className="py-6 text-center text-muted">No hay avisos vigentes del Consorcio.</p>}
        <ul className="space-y-2">
          {active.map((a) => <AlertCard key={a.id} alert={a} codeById={codeById} />)}
        </ul>
        <p className="pt-2 text-xs text-muted">
          Avisos de las líneas metropolitanas del Consorcio. Para las líneas urbanas de Rober no hay una fuente pública de avisos.
        </p>
      </div>
    </>
  )
}
