const BOLIVIA_COUNTRY_CODE = '591'
const BOLIVIAN_LOCAL_DIGITS = 8

// Convierte un teléfono guardado en el sistema al formato que espera wa.me
// (sólo dígitos, con código de país). Los pacientes se cargan con 8 dígitos
// sin código de país, que es como se escriben los números en Bolivia.
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length === BOLIVIAN_LOCAL_DIGITS) return BOLIVIA_COUNTRY_CODE + digits
  // Ya viene con código de país (propio o extranjero): se respeta tal cual.
  if (digits.length > BOLIVIAN_LOCAL_DIGITS) return digits
  return null
}

export function whatsAppUrl(phone: string | null | undefined, message: string): string {
  const number = toWhatsAppNumber(phone)
  const text = encodeURIComponent(message)
  // Sin número, wa.me abre el selector de contactos igual.
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`
}
