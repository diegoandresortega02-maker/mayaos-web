import { useState, type MouseEvent } from 'react'
import { getErrorMessage } from '../../lib/errors'

type Props = {
  message: string
  onConfirm: () => Promise<void>
  label?: string
}

export default function ConfirmDeleteButton({ message, onConfirm, label = 'Eliminar' }: Props) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function stop(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  async function handleFinalConfirm(e: MouseEvent) {
    stop(e)
    setBusy(true)
    setError(null)
    try {
      await onConfirm()
      setStep(0)
    } catch (err) {
      console.error(err)
      setError(getErrorMessage(err, 'No se pudo eliminar'))
    } finally {
      setBusy(false)
    }
  }

  if (step === 0) {
    return (
      <button
        onClick={(e) => {
          stop(e)
          setStep(1)
        }}
        className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline px-2 py-1"
      >
        {label}
      </button>
    )
  }

  return (
    <div
      onClick={stop}
      className="bg-red-50 border border-red-200 rounded-card p-3 text-xs text-slate-700 space-y-2 max-w-md"
    >
      {step === 1 ? (
        <>
          <p>{message}</p>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                stop(e)
                setStep(0)
              }}
              className="border border-surface-border bg-white rounded-control px-3 py-1.5 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={(e) => {
                stop(e)
                setStep(2)
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-control px-3 py-1.5 font-medium"
            >
              Sí, eliminar
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="font-medium">Confirmá de nuevo para eliminar.</p>
          <p className="text-slate-500">Vas a poder recuperarlo desde la Papelera durante 30 días.</p>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                stop(e)
                setStep(0)
                setError(null)
              }}
              className="border border-surface-border bg-white rounded-control px-3 py-1.5 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleFinalConfirm}
              disabled={busy}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-control px-3 py-1.5 font-medium"
            >
              {busy ? 'Eliminando…' : 'Eliminar definitivamente'}
            </button>
          </div>
        </>
      )}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  )
}
