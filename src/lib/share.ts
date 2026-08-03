import { toWhatsAppNumber, whatsAppUrl } from './phone'

export type ShareOutcome = 'whatsapp' | 'clipboard'

// Sin teléfono cargado no tiene sentido abrir WhatsApp a ciegas: se copia el
// link para que el odontólogo lo mande por donde quiera.
export async function shareLink(
  url: string,
  phone: string | null | undefined,
  message: string,
): Promise<ShareOutcome> {
  if (toWhatsAppNumber(phone)) {
    window.open(whatsAppUrl(phone, message), '_blank', 'noopener')
    return 'whatsapp'
  }
  await navigator.clipboard.writeText(url)
  return 'clipboard'
}

export const NO_PHONE_NOTICE = 'Este paciente no tiene teléfono cargado. Copiamos el link al portapapeles.'

export function documentShareMessage(opts: {
  patientName: string
  clinicName: string
  /** Ej. "tu recibo N° 0022" o "la proforma N° 0008" */
  documentLabel: string
  url: string
  /** true para "descargala y guardala" (proforma), false para "descargalo" (recibo) */
  feminine?: boolean
}): string {
  const verb = opts.feminine ? 'descargala y guardala' : 'descargalo y guardalo'
  return (
    `Hola ${opts.patientName}, te comparto ${opts.documentLabel} de ${opts.clinicName}.\n\n` +
    `${opts.url}\n\n` +
    `El enlace vence en 10 días: ${verb}.`
  )
}
