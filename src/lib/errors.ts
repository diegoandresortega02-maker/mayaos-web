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

export function getErrorMessage(err: unknown, fallback: string): string {
  if (isWriteBlockedError(err)) return WRITE_BLOCKED_MESSAGE
  if (err instanceof Error) return err.message
  return fallback
}
