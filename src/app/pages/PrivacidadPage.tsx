import { Link } from 'react-router-dom'
import logoWordmark from '../../assets/brand/logo-wordmark.png'

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
        ← Volver al inicio
      </Link>
      <img src={logoWordmark} alt="MayaOS" className="h-6 w-auto mt-4 mb-2" />
      <h1 className="text-xl font-semibold text-ink mb-1">Política de Privacidad y Confidencialidad de Datos</h1>
      <p className="text-xs text-slate-400 mb-8">Versión preliminar — sujeta a revisión y actualización.</p>

      <div className="space-y-5 text-sm text-ink leading-relaxed">
        <section>
          <h2 className="font-semibold mb-1">1. Alcance de esta Política</h2>
          <p>
            Esta Política explica qué información se maneja dentro de MayaOS, cómo se protege, y —de forma
            central— cómo se garantiza que la información de cada consultorio odontológico ("el Consultorio") es
            estrictamente confidencial y exclusiva de ese Consultorio, sin que otros consultorios registrados en la
            Plataforma puedan acceder a ella. Los términos usados aquí con mayúscula inicial (Plataforma,
            Consultorio, Usuario, Paciente) tienen el significado que se les da en los Términos y Condiciones de
            Uso.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">2. Qué información se recopila</h2>
          <p className="font-medium mt-2">2.1 Datos del Consultorio y su personal</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Datos de la cuenta del consultorio: nombre, dirección, teléfono.</li>
            <li>Datos del personal (dueño/a, odontólogos, asistentes): nombre, apellido, teléfono, dirección, correo, rol.</li>
            <li>Datos de facturación de la suscripción: plan contratado, historial de pagos y comprobantes cargados.</li>
          </ul>
          <p className="font-medium mt-3">2.2 Datos de los pacientes, ingresados por el Consultorio</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Datos de identificación del paciente (y del titular/responsable, cuando corresponde) y de contacto.</li>
            <li>Antecedentes médicos (anamnesis) y examen bucal/dental.</li>
            <li>Odontograma, evolución y observaciones clínicas por consulta.</li>
            <li>Tratamientos realizados, proformas/cotizaciones y registros de cobro.</li>
            <li>Consentimientos informados firmados digitalmente por el paciente, incluyendo la imagen de su firma.</li>
          </ul>
          <p className="mt-2">
            Estos datos de pacientes son ingresados, controlados y son propiedad del Consultorio. MayaOS los trata
            únicamente como encargado, siguiendo las instrucciones del Consultorio y con la única finalidad de
            operar la Plataforma para ese Consultorio.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">3. Confidencialidad y aislamiento entre consultorios</h2>
          <p>
            La información de cada Consultorio, y en particular la de sus pacientes, es estrictamente confidencial
            y de uso exclusivo de ese Consultorio. Ningún otro consultorio que use MayaOS puede ver, buscar, editar,
            descargar ni conocer de ninguna otra forma la información de un Consultorio distinto. Esto se implementa
            mediante:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              Control de acceso a nivel de base de datos: cada registro (pacientes, historias clínicas, odontogramas,
              cobros, proformas, consentimientos, citas, caja) queda asociado de forma permanente al Consultorio que
              lo creó, y el sistema exige esa coincidencia en cada lectura o escritura.
            </li>
            <li>
              Autenticación individual: cada usuario inicia sesión con sus propias credenciales, y el sistema
              determina a qué Consultorio pertenece antes de permitirle ver u operar cualquier dato.
            </li>
            <li>
              Roles dentro de un mismo Consultorio: el acceso a ciertas secciones (por ejemplo, historia clínica u
              odontograma) también está limitado según el rol del usuario, de modo que ni siquiera dentro del propio
              Consultorio todo el personal ve necesariamente todo.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-1">4. Datos de salud como datos sensibles</h2>
          <p>
            La información clínica de los pacientes constituye datos sensibles relativos a la salud. El Consultorio
            es responsable de contar con la base legal correspondiente para registrarla (por ejemplo, el
            consentimiento informado del paciente, que la Plataforma permite capturar digitalmente) y de cumplir con
            la normativa boliviana de protección de datos personales y de salud aplicable.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">5. Dónde y cómo se almacenan los datos</h2>
          <p>
            Los datos se almacenan en infraestructura de nube provista por un tercero especializado, con controles
            de acceso a nivel de base de datos, conexión cifrada entre el navegador y los servidores, y separación
            lógica de la información por Consultorio como se describe en la Sección 3.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">6. Acceso del equipo de MayaOS</h2>
          <p>
            El equipo de MayaOS solo accede a datos de un Consultorio cuando es estrictamente necesario para brindar
            soporte técnico solicitado por ese Consultorio o corregir errores del sistema, y en ningún caso para
            fines comerciales propios ni para compartirlos con otro Consultorio o con terceros ajenos a la
            Plataforma.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">7. Con quién se comparte información</h2>
          <p>
            MayaOS no vende ni comparte los datos de los consultorios ni de sus pacientes con terceros para fines
            comerciales o publicitarios. Los datos pueden ser accedidos por proveedores de infraestructura
            tecnológica estrictamente necesarios para operar la Plataforma, o cuando la ley exija su entrega a una
            autoridad competente.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">7.1 A qué países se transfieren los datos</h2>
          <p>
            Los datos se procesan principalmente en la infraestructura de nube del proveedor de base de datos
            utilizado por la Plataforma. [Pendiente de confirmar con el abogado revisor: en qué país o países está
            alojada esa infraestructura, para informarlo aquí con la misma transparencia que exige la normativa de
            protección de datos.]
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">8. Derechos del Consultorio y de los pacientes</h2>
          <p>
            El Consultorio puede acceder, corregir o eliminar la información de sus pacientes directamente desde la
            Plataforma. El paciente puede ejercer sus derechos de acceso, rectificación o eliminación de sus datos
            dirigiéndose directamente al Consultorio donde fue atendido.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">9. Conservación y eliminación de datos</h2>
          <p>Los datos del Consultorio se conservan mientras la cuenta permanezca activa.</p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">10. Cambios a esta Política</h2>
          <p>
            Esta Política puede actualizarse para reflejar cambios en la Plataforma o en la normativa aplicable,
            notificando al Consultorio ante cambios significativos con antelación razonable.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">11. Ley aplicable y jurisdicción</h2>
          <p>
            Esta Política se rige por las leyes del Estado Plurinacional de Bolivia, cuyos tribunales tendrán
            jurisdicción exclusiva sobre cualquier controversia relacionada con ella.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">12. Contacto</h2>
          <p>Para consultas sobre esta Política de Privacidad, comunicate con tu consultorio o con el equipo de MayaOS.</p>
        </section>
      </div>
    </div>
  )
}
