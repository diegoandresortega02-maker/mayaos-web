import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicReceipt } from '../../lib/api'
import type { PublicReceiptDoc } from '../../lib/types'
import ReceiptDocument from '../components/ReceiptDocument'
import PublicDocumentShell from '../components/PublicDocumentShell'

export default function PublicReceiptView() {
  const { token } = useParams<{ token: string }>()
  const [doc, setDoc] = useState<PublicReceiptDoc | null>(null)
  const [state, setState] = useState<'loading' | 'unavailable' | 'ready'>('loading')
  const docRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) {
      setState('unavailable')
      return
    }
    getPublicReceipt(token)
      .then((d) => {
        setDoc(d)
        setState(d ? 'ready' : 'unavailable')
      })
      .catch((err) => {
        console.error(err)
        setState('unavailable')
      })
  }, [token])

  return (
    <PublicDocumentShell
      state={state}
      targetRef={docRef}
      filename={doc ? `Recibo-${String(doc.receipt_number).padStart(4, '0')}.pdf` : 'Recibo.pdf'}
      expiresAt={doc?.expires_at}
    >
      {doc && <ReceiptDocument doc={doc} />}
    </PublicDocumentShell>
  )
}
