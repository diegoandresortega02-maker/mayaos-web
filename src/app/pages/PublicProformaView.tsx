import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicProforma } from '../../lib/api'
import type { PublicProformaDoc } from '../../lib/types'
import ProformaDocument from '../components/ProformaDocument'
import PublicDocumentShell from '../components/PublicDocumentShell'

export default function PublicProformaView() {
  const { token } = useParams<{ token: string }>()
  const [doc, setDoc] = useState<PublicProformaDoc | null>(null)
  const [state, setState] = useState<'loading' | 'unavailable' | 'ready'>('loading')
  const docRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) {
      setState('unavailable')
      return
    }
    getPublicProforma(token)
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
      filename={doc ? `Proforma-${String(doc.proforma_number).padStart(4, '0')}.pdf` : 'Proforma.pdf'}
      expiresAt={doc?.expires_at}
    >
      {doc && <ProformaDocument doc={doc} />}
    </PublicDocumentShell>
  )
}
