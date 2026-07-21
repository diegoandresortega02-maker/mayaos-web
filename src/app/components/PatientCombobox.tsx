import { useEffect, useRef, useState } from 'react'
import type { Patient } from '../../lib/types'

export default function PatientCombobox({
  patients,
  value,
  onChange,
  className,
}: {
  patients: Patient[]
  value: string
  onChange: (patientId: string) => void
  className?: string
}) {
  const selected = patients.find((p) => p.id === value) || null
  const [query, setQuery] = useState(selected?.full_name || '')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Si el valor seleccionado cambia desde afuera (por ejemplo, se resetea el form), reflejarlo
    setQuery(selected?.full_name || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery(selected?.full_name || '')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  const filtered =
    query.trim() === ''
      ? patients
      : patients.filter((p) => p.full_name.toLowerCase().includes(query.trim().toLowerCase()))

  function handleSelect(p: Patient) {
    onChange(p.id)
    setQuery(p.full_name)
    setOpen(false)
  }

  function handleInputChange(next: string) {
    setQuery(next)
    setOpen(true)
    if (value) onChange('')
  }

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Buscar paciente por nombre…"
        className="w-full rounded-control border border-surface-border px-3 py-2 text-sm"
      />
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white rounded-control border border-surface-border shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">Sin resultados.</p>
          ) : (
            filtered.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => handleSelect(p)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-muted ${
                  p.id === value ? 'bg-brand-primary/10 text-brand-primary-dark' : 'text-ink'
                }`}
              >
                {p.full_name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
