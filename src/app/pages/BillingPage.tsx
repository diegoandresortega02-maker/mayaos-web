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
  // El plan de 1 mes es la referencia contra la que se calcula el ahorro.
  const monthlyPrice = Number(plans.find((p) => p.duration_months === 1)?.price_bs ?? 0)

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
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-ink">Elegí el plan de tu consultorio</h2>
            <p className="text-sm text-slate-500 mt-1">
              Todos incluyen lo mismo — cambia cuánto pagás por mes y cuánto ahorrás.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 items-start">
            {plans.map((plan) => (
              <PlanCard
                key={plan.code}
                plan={plan}
                monthlyPrice={monthlyPrice}
                selected={selectedPlan === plan.code}
                popular={plan.code === POPULAR_PLAN}
                onSelect={() => setSelectedPlan(plan.code)}
              />
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

// Los tres planes dan exactamente el mismo producto: sólo cambia la duración y
// el precio por mes. La lista es compartida a propósito — inventar diferencias
// entre planes sería mentirle al odontólogo.
const PLAN_FEATURES = [
  'Pacientes, agenda e historia clínica sin límite',
  'Odontograma, proformas y recibos automáticos',
  'Consentimientos con firma digital',
  'Arqueo de caja diaria y reportes',
  'Respaldo y exportación de tus datos',
]

const POPULAR_PLAN: PlanCode = 'anual'

function planSavings(plan: SubscriptionPlan, monthlyPrice: number) {
  const price = Number(plan.price_bs)
  const perMonth = price / plan.duration_months
  if (plan.duration_months <= 1 || monthlyPrice <= 0) return { perMonth, saved: 0, percent: 0 }
  const baseline = monthlyPrice * plan.duration_months
  const saved = baseline - price
  return { perMonth, saved, percent: saved > 0 ? Math.round((saved / baseline) * 100) : 0 }
}

function PlanCard({
  plan,
  monthlyPrice,
  selected,
  popular,
  onSelect,
}: {
  plan: SubscriptionPlan
  monthlyPrice: number
  selected: boolean
  popular: boolean
  onSelect: () => void
}) {
  const { perMonth, saved, percent } = planSavings(plan, monthlyPrice)

  return (
    <div
      className={`relative flex flex-col rounded-card border bg-white p-6 transition ${
        selected
          ? 'border-brand-primary ring-2 ring-brand-primary'
          : popular
            ? 'border-brand-primary/60 border-2'
            : 'border-surface-border'
      } ${popular ? 'sm:-mt-2 sm:pb-8' : ''}`}
    >
      {popular && (
        <span className="absolute top-0 right-0 flex items-center gap-1 bg-brand-primary text-white text-[11px] font-semibold rounded-bl-card rounded-tr-card px-2.5 py-1">
          <StarIcon className="w-3 h-3" />
          Más elegido
        </span>
      )}

      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{plan.name}</p>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-tight text-ink">Bs {Number(plan.price_bs).toFixed(0)}</span>
      </div>
      <p className="text-xs text-slate-500 mt-1">
        {plan.duration_months === 1 ? 'por mes' : `cada ${plan.duration_months} meses`}
        {plan.duration_months > 1 && ` · equivale a Bs ${perMonth.toFixed(0)}/mes`}
      </p>

      {saved > 0 ? (
        <p className="mt-3 inline-flex self-start items-center bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full px-2.5 py-1">
          Ahorrás Bs {saved.toFixed(0)} · {percent}%
        </p>
      ) : (
        <p className="mt-3 text-xs text-slate-400">Sin permanencia, cancelás cuando quieras</p>
      )}

      <ul className="mt-5 space-y-2 flex-1">
        {PLAN_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckIcon className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
            <span className="text-sm text-slate-600 text-left">{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`mt-6 w-full font-medium text-sm rounded-control px-4 py-2.5 transition ${
          selected || popular
            ? 'bg-brand-primary hover:bg-brand-primary-dark text-white'
            : 'border border-surface-border hover:bg-surface-muted text-ink'
        }`}
      >
        {selected ? 'Plan elegido ✓' : `Elegir ${plan.name.toLowerCase()}`}
      </button>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85z" />
    </svg>
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
