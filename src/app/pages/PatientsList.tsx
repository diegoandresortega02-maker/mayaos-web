import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPatient, getPatients } from '../../lib/api'
import type { Patient } from '../../lib/types'
import { getErrorMessage } from '../../lib/errors'

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    try {
      setPatients(await getPatients())
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al cargar pacientes'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = patients.filter((p) => p.full_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-ink">Pacientes</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-medium rounded-control px-4 py-2"
        >
          {showForm ? 'Cancelar' : '+ Nuevo paciente'}
        </button>
      </div>

      {showForm && (
        <NewPatientForm
          onCreated={() => {
            setShowForm(false)
            load()
          }}
        />
      )}

      <input
        placeholder="Buscar por nombre…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-control border border-surface-border px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand-primary"
      />

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400">No hay pacientes todavía.</p>
      ) : (
        <div className="bg-white rounded-card border border-surface-border divide-y divide-slate-100">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/pacientes/${p.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-surface-muted"
            >
              <div>
                <p className="text-sm font-medium text-ink">{p.full_name}</p>
                <p className="text-xs text-slate-500">
                  {p.age ? `${p.age} años` : ''} {p.phone ? `· ${p.phone}` : ''}
                </p>
              </div>
              <span className="text-slate-300">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function NewPatientForm({ onCreated }: { onCreated: () => void }) {
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<'M' | 'F' | 'Otro' | ''>('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [allergies, setAllergies] = useState('')
  const [identification, setIdentification] = useState('')
  const [hasTitular, setHasTitular] = useState(false)
  const [titularFullName, setTitularFullName] = useState('')
  const [titularIdentification, setTitularIdentification] = useState('')
  const [titularPhone, setTitularPhone] = useState('')
  const [titularRelationship, setTitularRelationship] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await createPatient({
        full_name: fullName,
        age: age ? Number(age) : null,
        sex: sex || null,
        phone: phone || null,
        address: address || null,
        allergies: allergies || null,
        identification: identification || null,
        titular_full_name: hasTitular ? titularFullName || null : null,
        titular_identification: hasTitular ? titularIdentification || null : null,
        titular_phone: hasTitular ? titularPhone || null : null,
        titular_relationship: hasTitular ? titularRelationship || null : null,
      })
      onCreated()
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al crear paciente'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-card border border-surface-border p-5 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <input
        placeholder="Nombre completo"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="col-span-2 rounded-control border border-surface-border px-3 py-2 text-sm"
      />
      <input
        placeholder="Edad"
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className="rounded-control border border-surface-border px-3 py-2 text-sm"
      />
      <select
        value={sex}
        onChange={(e) => setSex(e.target.value as 'M' | 'F' | 'Otro' | '')}
        className="rounded-control border border-surface-border px-3 py-2 text-sm"
      >
        <option value="">Sexo</option>
        <option value="M">Masculino</option>
        <option value="F">Femenino</option>
        <option value="Otro">Otro</option>
      </select>
      <input
        placeholder="Teléfono"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="rounded-control border border-surface-border px-3 py-2 text-sm"
      />
      <input
        placeholder="Dirección"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="rounded-control border border-surface-border px-3 py-2 text-sm"
      />
      <input
        placeholder="Alergias"
        value={allergies}
        onChange={(e) => setAllergies(e.target.value)}
        className="col-span-2 rounded-control border border-surface-border px-3 py-2 text-sm"
      />
      <input
        placeholder="Identificación / CI"
        value={identification}
        onChange={(e) => setIdentification(e.target.value)}
        className="col-span-2 rounded-control border border-surface-border px-3 py-2 text-sm"
      />

      <label className="col-span-2 flex items-center gap-2 text-sm text-slate-600 mt-1">
        <input type="checkbox" checked={hasTitular} onChange={(e) => setHasTitular(e.target.checked)} />
        El titular/responsable es otra persona (ej. un padre o tutor)
      </label>

      {hasTitular && (
        <>
          <input
            placeholder="Nombre completo del titular"
            value={titularFullName}
            onChange={(e) => setTitularFullName(e.target.value)}
            className="col-span-2 rounded-control border border-surface-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Identificación del titular"
            value={titularIdentification}
            onChange={(e) => setTitularIdentification(e.target.value)}
            className="rounded-control border border-surface-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Teléfono del titular"
            value={titularPhone}
            onChange={(e) => setTitularPhone(e.target.value)}
            className="rounded-control border border-surface-border px-3 py-2 text-sm"
          />
          <select
            value={titularRelationship}
            onChange={(e) => setTitularRelationship(e.target.value)}
            className="col-span-2 rounded-control border border-surface-border px-3 py-2 text-sm"
          >
            <option value="">Parentesco / relación con el paciente…</option>
            <option value="Padre/Madre">Padre/Madre</option>
            <option value="Tutor/a">Tutor/a</option>
            <option value="Cónyuge">Cónyuge</option>
            <option value="Otro">Otro</option>
          </select>
        </>
      )}

      {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="col-span-2 bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-control py-2"
      >
        {saving ? 'Guardando…' : 'Guardar paciente'}
      </button>
    </form>
  )
}
