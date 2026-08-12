// A blocked write can be caused either by an expired membership (clinic_is_writable())
// or by a role restriction (has_permission()) — both surface as the same generic
// Postgres RLS error, so we can't tell which one happened from the error alone.
// The UI already hides controls the current role can't use, so in practice this
// message is mostly a safety net for stale screens or direct API calls.
const WRITE_BLOCKED_MESSAGE =
  'No podés hacer esto: puede ser porque tu rol no tiene permiso, o porque la membresía del consultorio venció. Si creés que es un error, consultá con el dueño del consultorio.'

function isWriteBlockedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const e = err as { code?: string; message?: string }
  if (e.code === '42501') return true
  return typeof e.message === 'string' && e.message.toLowerCase().includes('row-level security')
}

// Postgres/PostgREST errors carry a `code` field (even our own RPCs' plain
// `raise exception 'text'` calls, which land on code P0001) and their raw
// `message` can reveal table/column/constraint names. Only the exact business
// messages we raise ourselves are safe to show verbatim (translated below);
// anything else from the database falls back to a generic message instead of
// leaking schema details to the user.
const KNOWN_SERVER_MESSAGES: Record<string, string> = {
  'not authorized': 'No tenés permiso para hacer esto.',
  'payment request not found': 'No se encontró la solicitud de pago.',
  'name cannot be empty': 'El nombre no puede estar vacío.',
  'clinic not found': 'No se encontró el consultorio.',
  'cannot change trial end date for a clinic with an active paid plan':
    'No se puede cambiar la fecha de prueba de un consultorio con un plan pago activo.',
  'user already belongs to a clinic': 'Este usuario ya pertenece a un consultorio.',
  'cannot self-assign owner role': 'No podés unirte como dueño con un código de invitación.',
  terms_not_accepted: 'Tenés que aceptar los términos y condiciones.',
  'invalid invite code': 'El código de invitación no es válido.',
  seat_limit_reached: 'Este consultorio alcanzó su límite de usuarios. Pedile al dueño/a que compre más cupos en Planes.',
  'only the clinic owner can export data': 'Solo el dueño del consultorio puede exportar los datos.',
  'los importes no pueden ser negativos': 'Los importes no pueden ser negativos.',
  'el monto pagado no puede superar el total':
    'El monto cobrado no puede superar el total del tratamiento. Revisá el precio y lo ya cobrado.',
}

function isServerError(err: unknown): err is { code?: string; message?: string } {
  return !!err && typeof err === 'object' && 'code' in err
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (isWriteBlockedError(err)) return WRITE_BLOCKED_MESSAGE
  if (isServerError(err)) {
    const message = typeof err.message === 'string' ? err.message.toLowerCase() : ''
    const known = KNOWN_SERVER_MESSAGES[message]
    if (known) return known
    // Una violación de restricción sin mensaje propio: decir al menos que el
    // problema son los datos y no un fallo del sistema, sin nombrar la tabla.
    if (err.code === '23514') {
      return 'Alguno de los datos no es válido. Revisá los importes y valores cargados.'
    }
    return fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}

// Supabase Auth errors come back in English with codes/messages that vary a bit
// across versions - check the stable `code` field first, then fall back to
// matching the raw message, before ever showing the crude original to a user.
export function translateAuthError(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback
  const e = err as { code?: string; status?: number; message?: string }
  const message = (e.message ?? '').toLowerCase()

  if (e.code === 'user_already_exists' || message.includes('already registered')) {
    return 'Este correo ya tiene una cuenta registrada. Iniciá sesión o recuperá tu contraseña.'
  }
  if (e.status === 429 || e.code === 'over_request_rate_limit' || message.includes('rate limit')) {
    return 'Intentaste demasiadas veces. Esperá unos minutos y volvé a intentarlo.'
  }
  if (e.code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }

  return getErrorMessage(err, fallback)
}
