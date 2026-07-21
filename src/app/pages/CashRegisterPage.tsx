import { useEffect, useState } from 'react'
import { getCashRegisterEntries, upsertCashRegisterEntry } from '../../lib/api'
import type { CashRegisterEntry } from '../../lib/types'
import { getErrorMessage } from '../../lib/errors'
import { useAuth } from '../AuthContext'

const today = () => new Date().toISOString().slice(0, 10)

export default function CashRegisterPage() {
  const { clinicUser } = useAuth()
  const [entries, setEntries] = useState<CashRegisterEntry[]>([])
  const [date, setDate] = useState(today())
  const [opening, setOpening] = useState('0')
  const [cashIn, setCashIn] = useState('0')
  const [cashOut, setCashOut] = useState('0')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      setEntries(await getCashRegisterEntries())
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al cargar el arqueo de caja'))
    }
  }

  useEffect(() => {
    load()
  }, [])

  const closing = Number(opening) + Number(cashIn) - Number(cashOut)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await upsertCashRegisterEntry({
        register_date: date,
        opening_balance: Number(opening) || 0,
        cash_in: Number(cashIn) || 0,
        cash_out: Number(cashOut) || 0,
        closing_balance: closing,
        notes: notes || null,
      })
      setNotes('')
      load()
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'Error al guardar el arqueo'))
    } finally {
      setSaving(false)
    }
  }

  if (clinicUser?.role === 'dentist') {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-ink mb-2">Arqueo de caja diaria</h1>
        <p className="text-sm text-slate-500">Este módulo no está disponible para tu rol.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-ink mb-6">Arqueo de caja diaria</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-card border border-surface-border p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Saldo inicial</label>
          <input
            type="number"
            step="0.01"
            value={opening}
            onChange={(e) => setOpening(e.target.value)}
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Ingresos</label>
          <input
            type="number"
            step="0.01"
            value={cashIn}
            onChange={(e) => setCashIn(e.target.value)}
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Egresos</label>
          <input
            type="number"
            step="0.01"
            value={cashOut}
            onChange={(e) => setCashOut(e.target.value)}
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
          />
        </div>
        <p className="col-span-2 text-sm font-medium text-slate-700">Saldo final calculado: {closing.toFixed(2)}</p>
        {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="col-span-2 bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-control py-2"
        >
          {saving ? 'Guardando…' : 'Guardar arqueo del día'}
        </button>
      </form>

      <div className="bg-white rounded-card border border-surface-border divide-y divide-slate-100">
        {entries.map((e) => (
          <div key={e.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <p className="font-medium text-ink">{e.register_date}</p>
            <p className="text-slate-500">
              Inicial {Number(e.opening_balance).toFixed(2)} · Ingresos {Number(e.cash_in).toFixed(2)} · Egresos{' '}
              {Number(e.cash_out).toFixed(2)} · Final {Number(e.closing_balance).toFixed(2)}
            </p>
          </div>
        ))}
        {entries.length === 0 && <p className="px-4 py-3 text-sm text-slate-400">Sin arqueos registrados.</p>}
      </div>
    </div>
  )
}
