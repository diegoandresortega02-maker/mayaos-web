import { Link } from 'react-router-dom'

export default function LegalCheckbox({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-start gap-2 text-xs text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5"
      />
      <span>
        He leído y acepto los{' '}
        <Link to="/terminos" target="_blank" className="text-brand-primary hover:underline">
          Términos y Condiciones
        </Link>{' '}
        y la{' '}
        <Link to="/privacidad" target="_blank" className="text-brand-primary hover:underline">
          Política de Privacidad
        </Link>{' '}
        de MayaOS.
      </span>
    </label>
  )
}
