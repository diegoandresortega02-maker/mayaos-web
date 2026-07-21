import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createBillingItem,
  createClinicalRecord,
  createProforma,
  getBillingItems,
  getClinicalRecords,
  getConsents,
  getPatient,
  getProformas,
  getTreatments,
  updatePatient,
  type ProformaItemInput,
} from '../../lib/api'
import type { BillingItem, ClinicalRecord, Consent, Patient, Proforma, Treatment } from '../../lib/types'
import { getErrorMessage } from '../../lib/errors'
import { useAuth } from '../AuthContext'

const SENSITIVITY_FIELDS: { key: keyof Patient; label: string }[] = [
  { key: 'sensitivity_frio', label: 'Frío' },
  { key: 'sensitivity_calor', label: 'Calor' },
  { key: 'sensitivity_dulce', label: 'Dulce' },
  { key: 'sensitivity_acido', label: 'Ácido' },
  { key: 'sensitivity_percusion', label: 'Percusión' },
  { key: 'sensitivity_sangrado', label: 'Sangrado' },
]

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { clinicUser } = useAuth()
  const canSeeClinicalRecords = clinicUser?.role !== 'assistant'
  const [patient, setPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<ClinicalRecord[]>([])
  const [billing, setBilling] = useState<BillingItem[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [proformas, setProformas] = useState<Proforma[]>([])
  const [consents, setConsents] = useState<Consent[]>([])
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (!id) return
    try {
      const [p, r, b, t, pf, cs] = await Promise.all([
        getPatient(id),
        getClinicalRecords(id),
        getBillingItems(id),
        getTreatments(),
        getProformas(id),
        getConsents(id),
      ])
      setPatient(p)
      setRecords(r)
      setBilling(b)
      setTreatments(t)
      setProformas(pf)
      setConsents(cs)
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al cargar el paciente'))
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleNewVisit() {
    if (!id) return
    const record = await createClinicalRecord({ patient_id: id, visit_date: new Date().toISOString().slice(0, 10) })
    navigate(`/pacientes/${id}/historia/${record.id}`)
  }

  async function toggleSensitivity(field: keyof Patient) {
    if (!patient || !id) return
    const current = patient[field] as boolean | null
    const next = current === true ? false : current === false ? null : true
    const updated = await updatePatient(id, { [field]: next } as never)
    setPatient(updated)
  }

  if (error) return <p className="p-8 text-sm text-red-600">{error}</p>
  if (!patient) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

  const totalPending = billing.reduce((sum, b) => sum + (Number(b.subtotal) - Number(b.paid_amount)), 0)

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <Link to="/pacientes" className="text-sm text-slate-500 hover:text-slate-700">
          ← Pacientes
        </Link>
        <h1 className="text-xl font-semibold text-ink mt-1">{patient.full_name}</h1>
        <p className="text-sm text-slate-500">
          {patient.age ? `${patient.age} años` : ''} {patient.sex ? `· ${patient.sex}` : ''}{' '}
          {patient.phone ? `· ${patient.phone}` : ''}
        </p>
        {patient.allergies && (
          <p className="text-sm text-red-600 mt-1">⚠ Alergias: {patient.allergies}</p>
        )}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Pruebas de sensibilidad</h2>
        <div className="flex flex-wrap gap-2">
          {SENSITIVITY_FIELDS.map((f) => {
            const value = patient[f.key] as boolean | null
            const style =
              value === true
                ? 'bg-red-100 text-red-700 border-red-200'
                : value === false
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-surface-muted text-slate-500 border-surface-border'
            return (
              <button
                key={String(f.key)}
                onClick={() => toggleSensitivity(f.key)}
                className={`text-xs font-medium border rounded-full px-3 py-1 ${style}`}
                title="Clic para cambiar: sin evaluar → positivo → negativo"
              >
                {f.label}
                {value === true ? ' (+)' : value === false ? ' (-)' : ''}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-700">Consentimientos</h2>
          <Link
            to={`/pacientes/${id}/consentimiento/nuevo`}
            className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-medium rounded-control px-3 py-1.5"
          >
            + Nuevo consentimiento
          </Link>
        </div>
        {consents.length === 0 ? (
          <p className="text-sm text-slate-400">Sin consentimientos firmados.</p>
        ) : (
          <div className="bg-white rounded-card border border-surface-border divide-y divide-slate-100">
            {consents.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <p className="text-ink">Firmado el {new Date(c.signed_at).toLocaleString()}</p>
                <Link
                  to={`/pacientes/${id}/consentimiento/${c.id}/imprimir`}
                  target="_blank"
                  className="text-xs text-brand-primary font-medium hover:underline"
                >
                  Ver / Imprimir
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {canSeeClinicalRecords && !patient.clinical_history_started_at && (
        <section className="bg-white rounded-card border border-surface-border p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Historial clínico no iniciado</h2>
          <p className="text-sm text-slate-500 mb-3">
            Este paciente aún no tiene un historial clínico. Podés iniciarlo cuando decida comenzar un tratamiento; si
            solo necesita una revisión o proforma, podés dejarlo pendiente.
          </p>
          <Link
            to={`/pacientes/${id}/historia/iniciar`}
            className="inline-block bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-medium rounded-control px-4 py-2"
          >
            Iniciar historial clínico
          </Link>
        </section>
      )}

      {canSeeClinicalRecords && patient.clinical_history_started_at && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-700">Historia clínica / Odontograma</h2>
            <div className="flex gap-2">
              <Link
                to={`/pacientes/${id}/historia/iniciar`}
                className="bg-white border border-surface-border hover:bg-surface-muted text-ink text-xs font-medium rounded-control px-3 py-1.5"
              >
                Ver historia clínica
              </Link>
              <button
                onClick={handleNewVisit}
                className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-medium rounded-control px-3 py-1.5"
              >
                + Nueva consulta
              </button>
            </div>
          </div>
          {records.length === 0 ? (
            <p className="text-sm text-slate-400">Sin consultas registradas.</p>
          ) : (
            <div className="bg-white rounded-card border border-surface-border divide-y divide-slate-100">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{r.visit_date}</p>
                    <p className="text-xs text-slate-500">{r.motivo_consulta || 'Sin motivo registrado'}</p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to={`/pacientes/${id}/historia/${r.id}`}
                      className="text-xs text-brand-primary font-medium hover:underline"
                    >
                      Abrir
                    </Link>
                    <Link
                      to={`/pacientes/${id}/imprimir/${r.id}`}
                      target="_blank"
                      className="text-xs text-slate-500 font-medium hover:underline"
                    >
                      Imprimir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-700">Proformas</h2>
        </div>
        <NewProformaForm patientId={id!} treatments={treatments} onCreated={load} />
        {proformas.length === 0 ? (
          <p className="text-sm text-slate-400 mt-2">Sin proformas registradas.</p>
        ) : (
          <div className="bg-white rounded-card border border-surface-border divide-y divide-slate-100 mt-2">
            {proformas.map((pf) => (
              <div key={pf.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">Total: {Number(pf.total).toFixed(2)}</p>
                  <p className="text-xs text-slate-500">
                    Creada {new Date(pf.created_at).toLocaleDateString()} · Válida hasta{' '}
                    {new Date(pf.valid_until).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  to={`/pacientes/${id}/proformas/${pf.id}/imprimir`}
                  target="_blank"
                  className="text-xs text-brand-primary font-medium hover:underline"
                >
                  Ver / Imprimir
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">
          Cobros {totalPending > 0 && <span className="text-red-600">· Saldo pendiente: {totalPending.toFixed(2)}</span>}
        </h2>
        <NewChargeForm patientId={id!} treatments={treatments} onCreated={load} />
        {billing.length === 0 ? (
          <p className="text-sm text-slate-400 mt-2">Sin cobros registrados.</p>
        ) : (
          <div className="bg-white rounded-card border border-surface-border divide-y divide-slate-100 mt-2">
            {billing.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">
                    {b.treatment_name} × {b.quantity}
                  </p>
                  <p className="text-xs text-slate-500">{b.visit_date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-ink">{Number(b.subtotal).toFixed(2)}</p>
                  <p className="text-xs text-slate-500">
                    Cobrado {Number(b.paid_amount).toFixed(2)} ·{' '}
                    <span
                      className={
                        b.status === 'pagado'
                          ? 'text-emerald-600'
                          : b.status === 'parcial'
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }
                    >
                      {b.status}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function NewChargeForm({
  patientId,
  treatments,
  onCreated,
}: {
  patientId: string
  treatments: Treatment[]
  onCreated: () => void
}) {
  const [treatmentId, setTreatmentId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [paidAmount, setPaidAmount] = useState('0')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const treatment = treatments.find((t) => t.id === treatmentId)
    if (!treatment) {
      setError('Selecciona un tratamiento')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const qty = Number(quantity) || 1
      const paid = Number(paidAmount) || 0
      const subtotal = qty * Number(treatment.cost)
      await createBillingItem({
        patient_id: patientId,
        treatment_id: treatment.id,
        treatment_name: treatment.name,
        quantity: qty,
        unit_price: Number(treatment.cost),
        paid_amount: paid,
        status: paid >= subtotal ? 'pagado' : paid > 0 ? 'parcial' : 'pendiente',
      })
      setTreatmentId('')
      setQuantity('1')
      setPaidAmount('0')
      onCreated()
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al registrar el cobro'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end bg-white rounded-card border border-surface-border p-3">
      <select
        value={treatmentId}
        onChange={(e) => setTreatmentId(e.target.value)}
        className="rounded-control border border-surface-border px-2 py-1.5 text-sm flex-1 min-w-[160px]"
      >
        <option value="">Tratamiento…</option>
        {treatments.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({Number(t.cost).toFixed(2)})
          </option>
        ))}
      </select>
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-20 rounded-control border border-surface-border px-2 py-1.5 text-sm"
        placeholder="Cant."
      />
      <input
        type="number"
        min={0}
        step="0.01"
        value={paidAmount}
        onChange={(e) => setPaidAmount(e.target.value)}
        className="w-28 rounded-control border border-surface-border px-2 py-1.5 text-sm"
        placeholder="Cobrado"
      />
      <button
        type="submit"
        disabled={saving}
        className="bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-control px-3 py-1.5"
      >
        Agregar
      </button>
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
    </form>
  )
}

function NewProformaForm({
  patientId,
  treatments,
  onCreated,
}: {
  patientId: string
  treatments: Treatment[]
  onCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<ProformaItemInput[]>([])
  const [treatmentId, setTreatmentId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [discount, setDiscount] = useState('0')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addItem() {
    const treatment = treatments.find((t) => t.id === treatmentId)
    if (!treatment) {
      setError('Selecciona un tratamiento')
      return
    }
    setError(null)
    setItems((prev) => [
      ...prev,
      {
        treatment_id: treatment.id,
        treatment_name: treatment.name,
        quantity: Number(quantity) || 1,
        unit_price: Number(treatment.cost),
      },
    ])
    setTreatmentId('')
    setQuantity('1')
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  const discountBs = Number(discount) || 0
  const total = Math.max(0, subtotal - discountBs)

  async function handleSave() {
    if (items.length === 0) {
      setError('Agrega al menos un tratamiento')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createProforma(patientId, items, discountBs)
      setItems([])
      setDiscount('0')
      setOpen(false)
      onCreated()
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al guardar la proforma'))
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-medium rounded-control px-3 py-1.5"
      >
        + Nueva proforma
      </button>
    )
  }

  return (
    <div className="bg-white rounded-card border border-surface-border p-3 space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <select
          value={treatmentId}
          onChange={(e) => setTreatmentId(e.target.value)}
          className="rounded-control border border-surface-border px-2 py-1.5 text-sm flex-1 min-w-[160px]"
        >
          <option value="">Tratamiento…</option>
          {treatments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({Number(t.cost).toFixed(2)})
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-20 rounded-control border border-surface-border px-2 py-1.5 text-sm"
          placeholder="Cant."
        />
        <button
          type="button"
          onClick={addItem}
          className="bg-surface-muted hover:bg-slate-200 text-ink text-sm font-medium rounded-control px-3 py-1.5"
        >
          Agregar línea
        </button>
      </div>

      {items.length > 0 && (
        <div className="divide-y divide-slate-100 border border-surface-border rounded-control">
          {items.map((i, idx) => (
            <div key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
              <span>
                {i.treatment_name} × {i.quantity}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-slate-600">{(i.quantity * i.unit_price).toFixed(2)}</span>
                <button type="button" onClick={() => removeItem(idx)} className="text-xs text-red-600 hover:underline">
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Descuento (Bs)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-28 rounded-control border border-surface-border px-2 py-1.5 text-sm"
          />
        </div>
        <div className="text-sm text-slate-600">Subtotal: {subtotal.toFixed(2)}</div>
        <div className="text-sm font-semibold text-ink">Total: {total.toFixed(2)}</div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-control px-4 py-2"
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setItems([])
            setError(null)
          }}
          className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
