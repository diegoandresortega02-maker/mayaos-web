declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

const META_EVENT_MAP: Record<string, { name: string; standard: boolean }> = {
  sign_up: { name: 'CompleteRegistration', standard: true },
  clinic_created: { name: 'StartTrial', standard: true },
  staff_joined: { name: 'StaffJoined', standard: false },
  appointment_created: { name: 'Schedule', standard: true },
  proforma_created: { name: 'ProformaCreated', standard: false },
  payment_submitted: { name: 'Purchase', standard: true },
}

// Datos del odontólogo (nuestro cliente) para que Meta pueda emparejarlo con su
// cuenta. Nunca datos de los pacientes de las clínicas.
export type TrackUser = {
  email?: string | null
  telefono?: string | null
  nombre?: string | null
  apellido?: string | null
}

function cookie(nombre: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${nombre}=`))
    ?.split('=')[1]
}

// Meta reporta baja cobertura de fbc si la cookie no existe. Se arma a partir
// del fbclid que viene en la URL del anuncio, antes de que cargue el píxel.
export function ensureFbc() {
  if (typeof document === 'undefined' || cookie('_fbc')) return
  const fbclid = new URLSearchParams(window.location.search).get('fbclid')
  if (!fbclid) return
  // 90 días es la ventana de atribución máxima de Meta
  document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid}; max-age=7776000; path=/; SameSite=Lax`
}

const newEventId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(36).slice(2)

/**
 * Reenvía el evento a la API de Conversiones (api/capi.js).
 *
 * Viaja con el MISMO event_id que el píxel del navegador: Meta descarta la
 * copia y se queda con una. Si el navegador estaba bloqueado llega solo esta;
 * si no, llegan las dos y se cuenta una sola vez.
 *
 * Usa sendBeacon para que el envío sobreviva al cambio de página: sin eso, una
 * acción que navega cancelaría el pedido justo cuando más importa.
 */
function sendToServer(
  metaName: string,
  params: Record<string, unknown> | undefined,
  eventId: string,
  user: TrackUser,
) {
  const cuerpo = JSON.stringify({
    evento: metaName,
    event_id: eventId,
    event_source_url: window.location.href,
    datos: params ?? {},
    usuario: { ...user, fbp: cookie('_fbp'), fbc: cookie('_fbc') },
  })

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/capi', new Blob([cuerpo], { type: 'application/json' }))
    } else {
      fetch('/api/capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: cuerpo,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    // La medición nunca debe romper la navegación
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>, user: TrackUser = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }

  const meta = META_EVENT_MAP[name]
  if (!meta || typeof window === 'undefined') return

  // El mismo id por los dos caminos: es lo que evita el conteo doble.
  const eventId = newEventId()
  if (typeof window.fbq === 'function') {
    window.fbq(meta.standard ? 'track' : 'trackCustom', meta.name, params, { eventID: eventId })
  }
  sendToServer(meta.name, params, eventId, user)
}
