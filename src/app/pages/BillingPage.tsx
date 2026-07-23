import { useEffect, useState } from 'react'
import { createPaymentRequest, getMyClinic, getMyPaymentRequests, getSubscriptionPlans, uploadPaymentProof } from '../../lib/api'
import type { Clinic, PaymentRequest, PlanCode, SubscriptionPlan } from '../../lib/types'
import { getErrorMessage } from '../../lib/errors'
import { trackEvent } from '../../lib/analytics'
import { useAuth } from '../AuthContext'

const STATUS_LABEL: Record<string, string> = {
  pending: 'En revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-amber-600',
  approved: 'text-emerald-600',
  rejected: 'text-red-600',
}

function daysLeft(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function BillingPage() {
  const { clinicUser } = useAuth()
  const isOwner = clinicUser?.role === 'owner'
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [selectedPlan, setSelectedPlan] = useState<PlanCode | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      const [c, p, r] = await Promise.all([getMyClinic(), getSubscriptionPlans(), getMyPaymentRequests()])
      setClinic(c)
      setPlans(p)
      setRequests(r)
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al cargar la facturación'))
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (error) return <p className="p-8 text-sm text-red-600">{error}</p>
  if (!clinic) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

  const hasPendingRequest = requests.some((r) => r.status === 'pending')

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">Planes</h1>
        <p className="text-sm text-slate-500 mt-1">Gestiona la membresía de tu consultorio</p>
      </div>

      <StatusCard clinic={clinic} />
      <SeatsCard clinic={clinic} />

      {!isOwner ? (
        <div className="bg-surface-muted border border-surface-border rounded-card p-5 text-sm text-slate-500">
          Solo el dueño/a del consultorio puede elegir un plan y enviar el pago.
        </div>
      ) : hasPendingRequest ? (
        <div className="bg-amber-50 border border-amber-200 rounded-card p-5 text-sm text-amber-800">
          Tenés una solicitud de pago en revisión. Te avisamos apenas se apruebe — no hace falta enviar otra.
        </div>
      ) : (
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Elegí un plan</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <button
                key={plan.code}
                onClick={() => setSelectedPlan(plan.code)}
                className={`text-left rounded-card border p-5 transition ${
                  selectedPlan === plan.code
                    ? 'border-brand-primary ring-2 ring-brand-primary bg-brand-primary/5'
                    : 'border-surface-border bg-white hover:border-brand-primary/50'
                }`}
              >
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{plan.name}</p>
                <p className="text-2xl font-semibold text-ink mt-1">Bs {plan.price_bs}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {plan.duration_months === 1 ? 'Pago mensual' : `Cada ${plan.duration_months} meses`}
                </p>
              </button>
            ))}
          </div>

          {selectedPlan && (
            <PaymentForm
              plan={plans.find((p) => p.code === selectedPlan)!}
              clinic={clinic}
              onSubmitted={() => {
                setSelectedPlan(null)
                load()
              }}
            />
          )}
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Historial de solicitudes</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-slate-400">Sin solicitudes todavía.</p>
        ) : (
          <div className="bg-white rounded-card border border-surface-border divide-y divide-slate-100">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{r.subscription_plans?.name ?? r.plan_code}</p>
                  <p className="text-xs text-slate-500">
                    Bs {r.amount_bs}
                    {r.extra_seats > 0 ? ` (incluye ${r.extra_seats} usuario(s) extra)` : ''} ·{' '}
                    {new Date(r.created_at).toLocaleDateString('es-BO')}
                  </p>
                  {r.status === 'rejected' && r.rejection_reason && (
                    <p className="text-xs text-red-600 mt-0.5">Motivo: {r.rejection_reason}</p>
                  )}
                </div>
                <span className={`text-xs font-medium ${STATUS_COLOR[r.status]}`}>{STATUS_LABEL[r.status]}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatusCard({ clinic }: { clinic: Clinic }) {
  if (clinic.subscription_status === 'trial') {
    const remaining = daysLeft(clinic.trial_ends_at)
    return (
      <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-card p-5">
        <p className="text-sm font-semibold text-brand-primary-dark">Período de prueba</p>
        <p className="text-sm text-slate-600 mt-1">
          Te quedan <strong>{remaining}</strong> {remaining === 1 ? 'día' : 'días'} de acceso completo gratuito.
        </p>
      </div>
    )
  }

  if (clinic.subscription_status === 'active') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-card p-5">
        <p className="text-sm font-semibold text-emerald-700">Membresía activa — plan {clinic.current_plan_code}</p>
        {clinic.current_period_end && (
          <p className="text-sm text-slate-600 mt-1">
            Vence el {new Date(clinic.current_period_end).toLocaleDateString('es-BO')}.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-card p-5">
      <p className="text-sm font-semibold text-red-700">Membresía vencida</p>
      <p className="text-sm text-slate-600 mt-1">
        Tu consultorio está en modo de solo lectura. Elegí un plan y enviá tu comprobante para reactivar la edición.
      </p>
    </div>
  )
}

const EXTRA_SEAT_PRICE_BS = 30

function SeatsCard({ clinic }: { clinic: Clinic }) {
  return (
    <div className="bg-white border border-surface-border rounded-card p-5">
      <p className="text-sm font-semibold text-ink">Usuarios de tu consultorio</p>
      <p className="text-sm text-slate-600 mt-1">
        Incluido: dueño/a (1). Cupos extra activos: <strong>{clinic.extra_seats}</strong>{' '}
        {clinic.extra_seats === 1 ? '(1 usuario más)' : `(${clinic.extra_seats} usuarios más)`} — total permitido:{' '}
        <strong>{1 + clinic.extra_seats}</strong>.
      </p>
      <p className="text-xs text-slate-400 mt-1">
        Cada usuario adicional (odontólogo/a o asistente) cuesta Bs {EXTRA_SEAT_PRICE_BS} por período. Se elige al
        pagar o renovar tu plan.
      </p>
    </div>
  )
}

function PaymentForm({ plan, clinic, onSubmitted }: { plan: SubscriptionPlan; clinic: Clinic; onSubmitted: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [extraSeats, setExtraSeats] = useState(clinic.extra_seats)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = plan.price_bs + extraSeats * EXTRA_SEAT_PRICE_BS

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Adjuntá una imagen del comprobante')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const path = await uploadPaymentProof(file)
      await createPaymentRequest(plan.code, total, path, extraSeats)
      trackEvent('payment_submitted', { value: total, currency: 'BOB', plan: plan.code, extra_seats: extraSeats })
      onSubmitted()
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al enviar la solicitud'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-card border border-surface-border p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-ink mb-1">Pagar plan {plan.name}</h3>
        <p className="text-sm text-slate-500">Escaneá el código QR y realizá el pago desde tu app bancaria.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Usuarios extra además del dueño/a (Bs {EXTRA_SEAT_PRICE_BS} c/u por período)
        </label>
        <input
          type="number"
          min={0}
          value={extraSeats}
          onChange={(e) => setExtraSeats(Math.max(0, Number(e.target.value) || 0))}
          className="w-24 rounded-control border border-surface-border px-3 py-2 text-sm"
        />
      </div>

      <div className="bg-surface-muted rounded-control p-3 text-sm text-ink space-y-1">
        <div className="flex justify-between">
          <span>Plan {plan.name}</span>
          <span>Bs {plan.price_bs}</span>
        </div>
        {extraSeats > 0 && (
          <div className="flex justify-between">
            <span>{extraSeats} usuario(s) extra</span>
            <span>Bs {extraSeats * EXTRA_SEAT_PRICE_BS}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold pt-1 border-t border-surface-border">
          <span>Total a pagar</span>
          <span>Bs {total}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 bg-surface-muted rounded-control p-6">
        <QrPlaceholder />
        <p className="text-xs text-slate-500 text-center max-w-xs">
          Banco de Crédito BCP · Cuenta: 701-51200078-3-37 · Titular: Diego Andrés Ortega Villarroel
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Comprobante de pago (imagen)</label>
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-control px-4 py-2"
      >
        {saving ? 'Enviando…' : 'Enviar comprobante'}
      </button>
    </form>
  )
}

function QrPlaceholder() {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="w-40 h-40 flex items-center justify-center bg-white rounded-control border border-dashed border-surface-border text-center px-3">
        <p className="text-[11px] text-slate-400">QR de pago pendiente de subir (public/brand/pago-qr.png)</p>
      </div>
    )
  }

  return (
    <img
      src="/brand/pago-qr.png"
      alt="Código QR de pago"
      className="w-40 h-40 object-contain bg-white rounded-control border border-surface-border"
      onError={() => setFailed(true)}
    />
  )
}
