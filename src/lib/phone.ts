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

export function isMobileDevice(): boolean {
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData
  if (typeof uaData?.mobile === 'boolean') return uaData.mobile
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function whatsAppUrl(phone: string | null | undefined, message: string): string {
  const number = toWhatsAppNumber(phone)
  const text = encodeURIComponent(message)

  // En el celular se usa el esquema propio whatsapp:// y no https://wa.me.
  // Un link wa.me es un App Link verificado: Android lo asocia a UNA sola app
  // y lo abre directo, así que quien usa WhatsApp Business nunca ve el selector.
  // El esquema whatsapp:// lo registran las dos apps, entonces el sistema
  // pregunta con cuál abrir. En escritorio se mantiene wa.me, que funciona
  // igual con WhatsApp Web sin depender de una app instalada.
  if (isMobileDevice()) {
    return number ? `whatsapp://send?phone=${number}&text=${text}` : `whatsapp://send?text=${text}`
  }
  // Sin número, wa.me abre el selector de contactos igual.
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`
}
