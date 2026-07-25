import { useEffect, useState, type FormEvent } from 'react'
import { getMyClinic, updateMyClinic } from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'
import type { Clinic } from '../../lib/types'

export default function ClinicProfilePage() {
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMyClinic()
      .then((c) => {
        setClinic(c)
        setName(c.name)
        setAddress(c.address ?? '')
        setPhone(c.phone ?? '')
      })
      .catch((err) => setError(getErrorMessage(err, 'Error al cargar el consultorio')))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await updateMyClinic({ name, address: address || null, phone: phone || null })
      setClinic(updated)
      setSaved(true)
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al guardar los cambios'))
    } finally {
      setSaving(false)
    }
  }

  if (error && !clinic) return <p className="p-8 text-sm text-red-600">{error}</p>
  if (!clinic) return <p className="p-8 text-sm text-slate-400">Cargando…</p>

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-ink mb-1">Mi Consultorio</h1>
      <p className="text-sm text-slate-500 mb-6">
        Estos datos aparecen en las proformas y recibos que le entregás a tus pacientes.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-card border border-surface-border p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del consultorio</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-emerald-600">Guardado.</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white font-medium rounded-control px-5 py-2 text-sm"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
