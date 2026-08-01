import type { ReactNode, RefObject } from 'react'
import DocumentActions from './DocumentActions'
import logoWordmark from '../../assets/brand/logo-wordmark.png'

// Marco de las páginas públicas (/ver/...): son las únicas del sistema que se
// abren sin iniciar sesión, así que no comparten el Layout del consultorio.
type Props = {
  state: 'loading' | 'unavailable' | 'ready'
  targetRef: RefObject<HTMLDivElement | null>
  filename: string
  expiresAt?: string
  children: ReactNode
}

export default function PublicDocumentShell({ state, targetRef, filename, expiresAt, children }: Props) {
  if (state === 'loading') {
    return <p className="p-8 text-sm text-slate-400 text-center">Cargando…</p>
  }

  if (state === 'unavailable') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <img src={logoWordmark} alt="MayaOS" className="h-7 w-auto" />
        <h1 className="text-lg font-semibold text-ink">Este enlace ya no está disponible</h1>
        <p className="text-sm text-slate-500 max-w-md">
          Puede que haya vencido. Pedile a tu odontólogo/a que te lo comparta de nuevo.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 print:p-0">
      <DocumentActions targetRef={targetRef} filename={filename} />
      <div ref={targetRef}>{children}</div>
      {expiresAt && (
        <p className="text-xs text-slate-400 mt-8 print:hidden">
          Este enlace vence el {new Date(expiresAt).toLocaleDateString('es-BO')}. Descargá el PDF para guardarlo.
        </p>
      )}
      <div className="flex justify-center mt-6 print:hidden">
        <img src={logoWordmark} alt="MayaOS" className="h-5 w-auto opacity-40" />
      </div>
    </div>
  )
}
