import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../lib/errors'

export type ActionMenuItem = {
  label: string
  // Navega en vez de ejecutar una acción.
  to?: string
  newTab?: boolean
  onSelect?: () => void | Promise<void>
  // Si viene, la acción pide doble confirmación dentro del mismo panel.
  confirm?: string
  danger?: boolean
}

// Menú compacto de acciones por fila. Existe para que "Eliminar" y compañía
// dejen de competir visualmente con lo que de verdad importa en cada pantalla.
export default function ActionMenu({ items, label = 'Acciones' }: { items: ActionMenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState<ActionMenuItem | null>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: globalThis.MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close()
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function close() {
    setOpen(false)
    setConfirming(null)
    setStep(1)
    setError(null)
  }

  function stop(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  async function runItem(item: ActionMenuItem) {
    if (item.confirm) {
      setConfirming(item)
      setStep(1)
      return
    }
    await execute(item)
  }

  async function execute(item: ActionMenuItem) {
    setBusy(true)
    setError(null)
    try {
      await item.onSelect?.()
      close()
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'No se pudo completar la acción'))
    } finally {
      setBusy(false)
    }
  }

  const itemClass = 'block w-full text-left px-3 py-2 text-xs hover:bg-surface-muted'

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => {
          stop(e)
          open ? close() : setOpen(true)
        }}
        className="flex items-center justify-center h-7 w-7 rounded-control text-slate-400 hover:text-ink hover:bg-surface-muted"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="1.5" y1="3.5" x2="12.5" y2="3.5" />
            <line x1="1.5" y1="7" x2="12.5" y2="7" />
            <line x1="1.5" y1="10.5" x2="12.5" y2="10.5" />
          </g>
        </svg>
      </button>

      {open && (
        <div
          onClick={stop}
          className="absolute right-0 top-8 z-20 w-56 bg-white border border-surface-border rounded-card shadow-lg overflow-hidden"
        >
          {confirming ? (
            <div className="p-3 text-xs space-y-2">
              {step === 1 ? (
                <>
                  <p className="text-slate-700">{confirming.confirm}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirming(null)}
                      className="flex-1 border border-surface-border rounded-control px-2 py-1.5 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-control px-2 py-1.5 font-medium"
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium text-slate-700">Confirmá de nuevo.</p>
                  <p className="text-slate-500">Vas a poder recuperarlo desde la Papelera durante 30 días.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setConfirming(null)
                        setStep(1)
                        setError(null)
                      }}
                      className="flex-1 border border-surface-border rounded-control px-2 py-1.5 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => execute(confirming)}
                      disabled={busy}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-control px-2 py-1.5 font-medium"
                    >
                      {busy ? 'Eliminando…' : 'Eliminar'}
                    </button>
                  </div>
                </>
              )}
              {error && <p className="text-red-600">{error}</p>}
            </div>
          ) : (
            <div className="py-1">
              {items.map((item) =>
                item.to ? (
                  <Link
                    key={item.label}
                    to={item.to}
                    target={item.newTab ? '_blank' : undefined}
                    onClick={close}
                    className={`${itemClass} ${item.danger ? 'text-red-600' : 'text-ink'}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    type="button"
                    disabled={busy}
                    onClick={() => runItem(item)}
                    className={`${itemClass} disabled:opacity-50 ${item.danger ? 'text-red-600' : 'text-ink'}`}
                  >
                    {item.label}
                  </button>
                ),
              )}
              {error && <p className="px-3 py-2 text-xs text-red-600">{error}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
