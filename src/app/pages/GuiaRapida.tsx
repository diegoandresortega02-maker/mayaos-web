const STEPS: { title: string; steps: string[] }[] = [
  {
    title: '1. Registrá tu primer paciente',
    steps: [
      'Andá a "Pacientes" en el menú y hacé clic en "+ Nuevo paciente".',
      'Completá el nombre y, si lo tenés a mano, el CI — queda automáticamente como su número de historia clínica.',
      'Si el paciente es menor de edad o el responsable es otra persona, activá "Agregar titular" para sus datos de contacto.',
      'Guardar. Listo, ya tenés tu primer paciente cargado.',
    ],
  },
  {
    title: '2. Configurá tus tratamientos y precios',
    steps: [
      'Andá a "Tratamientos" en el menú.',
      'Agregá cada tratamiento que ofrecés con su precio real (limpieza, extracción, ortodoncia, etc.).',
      'Estos precios se usan automáticamente después en proformas y cobros — no hace falta escribirlos de nuevo cada vez.',
    ],
  },
  {
    title: '3. Armá una proforma (cotización)',
    steps: [
      'Entrá al perfil del paciente y bajá a la sección "Proformas".',
      'Hacé clic en "+ Nueva proforma" y agregá los tratamientos y cantidades del catálogo.',
      'Si corresponde, aplicá un descuento sobre el total.',
      'Guardar — la proforma queda numerada automáticamente y lista para imprimir o enviar al paciente.',
    ],
  },
  {
    title: '4. Agendá una cita',
    steps: [
      'Andá a "Agenda" en el menú.',
      'Hacé clic en "+ Nueva cita" y elegí el paciente escribiendo su nombre para encontrarlo más rápido.',
      'Elegí la fecha y la hora, y guardá.',
      'A medida que avanza el día, marcá cada cita como completada o cancelada según corresponda.',
    ],
  },
  {
    title: '5. Iniciá la historia clínica',
    steps: [
      'Desde el perfil del paciente vas a ver "Historial clínico no iniciado" marcado en color — hacé clic para empezarlo.',
      'Completás una vez la anamnesis (antecedentes médicos) y el examen bucal.',
      'A partir de ahí queda disponible el odontograma para cada consulta.',
    ],
  },
  {
    title: '6. Registrá un cobro',
    steps: [
      'Desde el perfil del paciente, sección "Cobros".',
      'Elegí el tratamiento realizado, el monto cobrado y el saldo pendiente si el paciente no pagó todo.',
    ],
  },
  {
    title: '7. Consentimiento informado digital',
    steps: [
      'Desde el perfil del paciente, sección "Consentimientos" → "+ Nuevo consentimiento".',
      'El paciente y el profesional firman en pantalla con el dedo o el mouse.',
      'Queda guardado con fecha y podés volver a firmarlo tantas veces como necesites.',
    ],
  },
  {
    title: '8. Mirá el resumen de tu día',
    steps: [
      'La pantalla de "Inicio" te muestra citas pendientes/atendidas, tratamientos hechos, ingresos y proformas del período.',
      'Podés filtrar por día, mes o año arriba de todo.',
    ],
  },
]

export default function GuiaRapida() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Guía rápida de MayaOS</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Dejá el papeleo atrás y organizá tu consultorio en minutos. Estos son los pasos básicos para
            empezar a sacarle provecho al sistema desde el primer día.
          </p>
        </div>
        <a
          href="/guia-rapida-mayaos.pdf"
          download
          className="shrink-0 inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-medium rounded-control px-5 py-2.5 text-sm"
        >
          Descargar PDF
        </a>
      </div>

      <div className="space-y-4">
        {STEPS.map((section) => (
          <div key={section.title} className="bg-white rounded-card border border-surface-border p-5">
            <h2 className="font-semibold text-ink mb-3">{section.title}</h2>
            <ol className="space-y-1.5 text-sm text-slate-600 list-decimal pl-5">
              {section.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-surface-muted rounded-card p-5 text-sm text-slate-600">
        ¿Tenés dudas o necesitás ayuda? Escribinos a{' '}
        <a href="mailto:diegoandresortega02@gmail.com" className="text-brand-primary font-medium">
          diegoandresortega02@gmail.com
        </a>{' '}
        o al{' '}
        <a href="https://wa.me/59176055763" target="_blank" rel="noreferrer" className="text-brand-primary font-medium">
          +591 76055763
        </a>
        .
      </div>
    </div>
  )
}
