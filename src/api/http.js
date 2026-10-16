export class ApiError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.cause = cause
  }
}

/** fetch + JSON con timeout y errores legibles. Respeta el AbortSignal del llamador. */
export async function fetchJson(url, { signal, timeoutMs = 10000 } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  signal?.addEventListener('abort', () => ctrl.abort(signal.reason), { once: true })
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) {
      throw new ApiError(res.status === 404 ? 'No se encontró esa parada' : `El servicio respondió con error ${res.status}`, {
        status: res.status,
      })
    }
    return await res.json()
  } catch (err) {
    if (err instanceof ApiError || signal?.aborted) throw err
    throw new ApiError('No se pudo conectar con el servicio', { cause: err })
  } finally {
    clearTimeout(timer)
  }
}
