import { useState, type RefObject } from 'react'
import { downloadElementAsPdf } from '../../lib/pdf'
import { NO_PHONE_NOTICE, shareLink } from '../../lib/share'
import { getErrorMessage } from '../../lib/errors'

type ShareConfig = {
  // Genera (o renueva) el link público y lo devuelve.
  createLink: () => Promise<string>
  patientPhone: string | null
  buildMessage: (url: string) => string
}

type Props = {
  targetRef: RefObject<HTMLDivElement | null>
  filename: string
  share?: ShareConfig
}

const BUTTON = 'text-sm font-medium rounded-control px-4 py-2 disabled:opacity-50'

export default function DocumentActions({ targetRef, filename, share }: Props) {
  const [downloading, setDownloading] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    if (!targetRef.current) return
    setDownloading(true)
    setError(null)
    try {
      await downloadElementAsPdf(targetRef.current, filename)
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'No se pudo generar el PDF'))
    } finally {
      setDownloading(false)
    }
  }

  async function handleShare() {
    if (!share) return
    setSharing(true)
    setError(null)
    setNotice(null)
    try {
      const url = await share.createLink()
      const outcome = await shareLink(url, share.patientPhone, share.buildMessage(url))
      if (outcome === 'clipboard') setNotice(NO_PHONE_NOTICE)
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'No se pudo generar el link para compartir'))
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="mb-4 print:hidden">
      <div className="flex flex-wrap justify-end gap-2">
        <button onClick={() => window.print()} className={`${BUTTON} bg-white border border-surface-border text-ink`}>
          Imprimir
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`${BUTTON} bg-brand-primary hover:bg-brand-primary-dark text-white`}
        >
          {downloading ? 'Generando…' : 'Descargar PDF'}
        </button>
        {share && (
          <button
            onClick={handleShare}
            disabled={sharing}
            className={`${BUTTON} bg-[#25D366] hover:brightness-95 text-white`}
          >
            {sharing ? 'Generando link…' : 'Compartir por WhatsApp'}
          </button>
        )}
      </div>
      {notice && <p className="text-xs text-slate-500 text-right mt-2">{notice}</p>}
      {error && <p className="text-xs text-red-600 text-right mt-2">{error}</p>}
    </div>
  )
}
