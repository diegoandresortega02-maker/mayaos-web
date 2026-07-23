import { useEffect, useState } from 'react'
import {
  adminApprovePaymentRequest,
  adminGetPaymentRequestHistory,
  adminGetPendingPaymentRequests,
  adminGetProofUrl,
  adminRejectPaymentRequest,
} from '../../lib/api'
import type { PaymentRequest } from '../../lib/types'

export default function AdminSolicitudes() {
  const [pending, setPending] = useState<PaymentRequest[]>([])
  const [history, setHistory] = useState<PaymentRequest[]>([])
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      const [p, h] = await Promise.all([adminGetPendingPaymentRequests(), adminGetPaymentRequestHistory()])
      setPending(p)
      setHistory(h)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error al cargar las solicitudes')
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-xl font-semibold text-ink">Solicitudes de pago</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Pendientes ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-400">No hay solicitudes pendientes.</p>
        ) : (
          <div className="space-y-4">
            {pending.map((r) => (
              <PendingCard key={r.id} request={r} onDone={load} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Historial</h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">Sin historial todavía.</p>
        ) : (
          <div className="bg-white rounded-card border border-surface-border divide-y divide-slate-100">
            {history.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{r.clinics?.name}</p>
                  <p className="text-xs text-slate-500">
                    {r.subscription_plans?.name} · Bs {r.amount_bs}
                    {r.extra_seats > 0 ? ` (+${r.extra_seats} usuario(s))` : ''} ·{' '}
                    {r.reviewed_at && new Date(r.reviewed_at).toLocaleDateString('es-BO')}
                  </p>
                </div>
                <span className={`text-xs font-medium ${r.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {r.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function PendingCard({ request, onDone }: { request: PaymentRequest; onDone: () => void }) {
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminGetProofUrl(request.proof_storage_path)
      .then(setProofUrl)
      .catch((err) => console.error(err))
  }, [request.proof_storage_path])

  async function handleApprove() {
    setBusy(true)
    setError(null)
    try {
      await adminApprovePaymentRequest(request, request.subscription_plans?.duration_months ?? 1)
      onDone()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error al aprobar')
    } finally {
      setBusy(false)
    }
  }

  async function handleReject() {
    if (!reason.trim()) {
      setError('Escribe un motivo de rechazo')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await adminRejectPaymentRequest(request.id, reason.trim())
      onDone()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error al rechazar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white rounded-card border border-surface-border p-5 flex gap-5">
      <div className="w-32 h-32 shrink-0 bg-surface-muted rounded-control overflow-hidden flex items-center justify-center">
        {proofUrl ? (
          <a href={proofUrl} target="_blank" rel="noreferrer">
            <img src={proofUrl} alt="Comprobante" className="w-full h-full object-cover" />
          </a>
        ) : (
          <span className="text-xs text-slate-400">Cargando…</span>
        )}
      </div>

      <div className="flex-1">
        <p className="font-semibold text-ink">{request.clinics?.name}</p>
        <p className="text-sm text-slate-500">
          {request.subscription_plans?.name} · Bs {request.amount_bs}
          {request.extra_seats > 0 ? ` (incluye ${request.extra_seats} usuario(s) extra)` : ''} ·{' '}
          {new Date(request.created_at).toLocaleString('es-BO')}
        </p>

        {!showReject ? (
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApprove}
              disabled={busy}
              className="bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-control px-4 py-2"
            >
              Aprobar
            </button>
            <button
              onClick={() => setShowReject(true)}
              disabled={busy}
              className="border border-surface-border hover:bg-surface-muted text-sm font-medium rounded-control px-4 py-2"
            >
              Rechazar
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo del rechazo…"
              rows={2}
              className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={busy}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-control px-4 py-2"
              >
                Confirmar rechazo
              </button>
              <button
                onClick={() => setShowReject(false)}
                className="text-sm text-slate-500 hover:text-ink px-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  )
}
