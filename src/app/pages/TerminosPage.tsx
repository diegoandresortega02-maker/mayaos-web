import { Link } from 'react-router-dom'
import logoWordmark from '../../assets/brand/logo-wordmark.png'

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
        ← Volver al inicio
      </Link>
      <img src={logoWordmark} alt="MayaOS" className="h-6 w-auto mt-4 mb-2" />
      <h1 className="text-xl font-semibold text-ink mb-1">Términos y Condiciones de Uso</h1>
      <p className="text-xs text-slate-400 mb-8">Versión preliminar — sujeta a revisión y actualización.</p>

      <div className="space-y-5 text-sm text-ink leading-relaxed">
        <section>
          <h2 className="font-semibold mb-1">1. Objeto</h2>
          <p>
            MayaOS ("la Plataforma") es un software de gestión para consultorios odontológicos que permite
            administrar pacientes, agenda, historia clínica, odontograma, tratamientos, cobros, caja diaria,
            proformas y consentimientos informados. Estos Términos regulan el acceso y uso de la Plataforma por
            parte de los consultorios odontológicos que se registran ("el Consultorio") y de las personas que estos
            autoricen a usarla (odontólogos, asistentes u otro personal). El desconocimiento del contenido de estos
            Términos no exime de su cumplimiento.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">2. Definiciones</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Plataforma / MayaOS:</strong> el software y el sitio web a través de los cuales se prestan los Servicios.</li>
            <li><strong>Consultorio:</strong> la persona natural o jurídica que registra una cuenta de consultorio odontológico en la Plataforma.</li>
            <li><strong>Usuario / Personal:</strong> toda persona que accede a la Plataforma bajo una cuenta autorizada por el Consultorio (dueño/a, odontólogo/a, asistente).</li>
            <li><strong>Paciente:</strong> la persona atendida por el Consultorio, cuyos datos son ingresados en la Plataforma por el Consultorio.</li>
            <li><strong>Servicios:</strong> las funcionalidades de gestión ofrecidas por la Plataforma bajo un Plan contratado.</li>
            <li><strong>Plan:</strong> la modalidad de suscripción (mensual, semestral o anual) contratada por el Consultorio.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-1">3. Aceptación</h2>
          <p>
            Al crear una cuenta o registrar un consultorio en MayaOS, el Consultorio declara haber leído, entendido
            y aceptado estos Términos y Condiciones, así como la{' '}
            <Link to="/privacidad" className="text-brand-primary hover:underline">
              Política de Privacidad y Confidencialidad de Datos
            </Link>
            , que forma parte integral de este acuerdo.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">4. Capacidad para contratar</h2>
          <p>
            Los Servicios solo están disponibles para personas con capacidad legal para contratar. Cuando el
            Consultorio se registre como persona jurídica, quien realiza el registro declara contar con facultades
            suficientes para obligar a dicha entidad en los términos aquí previstos.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">5. Registro de cuenta y responsabilidad del Consultorio</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>El Consultorio es responsable de la veracidad y actualización de los datos que registra, propios y del personal que invita a la Plataforma.</li>
            <li>El Consultorio es responsable del uso que su personal haga de la Plataforma bajo las credenciales que ese personal recibe.</li>
            <li>El Consultorio se compromete a mantener la confidencialidad de sus credenciales de acceso.</li>
            <li>
              MayaOS es una herramienta de gestión de apoyo. No reemplaza el criterio profesional ni las obligaciones
              legales del odontólogo tratante frente a sus pacientes, ni sustituye la normativa sanitaria vigente en
              Bolivia.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-1">6. Planes, precios y forma de pago</h2>
          <p>
            MayaOS ofrece un período de prueba gratuito de 14 días y planes de suscripción mensual, semestral o
            anual. El pago se realiza por transferencia/QR y la carga del comprobante correspondiente, sujeto a
            verificación y aprobación manual. Si el período vence sin un pago aprobado, la cuenta pasa a modo de
            solo lectura: los datos existentes permanecen visibles, pero no se pueden crear, editar ni eliminar
            registros hasta que se apruebe un nuevo pago.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">7. Propiedad y confidencialidad de la información de cada Consultorio</h2>
          <p>
            Toda la información que el Consultorio ingresa en la Plataforma es propiedad exclusiva de ese
            Consultorio, es estrictamente confidencial y de su uso exclusivo. MayaOS implementa aislamiento técnico
            entre consultorios de modo que ningún otro consultorio registrado en la Plataforma puede acceder,
            visualizar, editar ni exportar la información de un Consultorio distinto. El detalle de este compromiso
            se desarrolla en la Política de Privacidad y Confidencialidad de Datos.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">8. Propiedad intelectual</h2>
          <p>
            El software, la marca MayaOS, su diseño y demás elementos de la Plataforma son propiedad de MayaOS o de
            sus licenciantes. Estos Términos no transfieren al Consultorio ningún derecho de propiedad intelectual
            sobre la Plataforma, salvo el derecho de uso mientras su suscripción esté vigente. Queda prohibido
            copiar, modificar, distribuir o realizar ingeniería inversa sobre el software de la Plataforma.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">9. Disponibilidad y cambios al servicio</h2>
          <p>
            MayaOS procura mantener la Plataforma disponible de forma continua, sin garantizar disponibilidad
            ininterrumpida, y podrá agregar, modificar o discontinuar funcionalidades con aviso razonable cuando el
            cambio sea significativo.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">10. Limitación de responsabilidad</h2>
          <p className="font-medium">
            MayaOS no es responsable por las decisiones clínicas, diagnósticos o tratamientos realizados por el
            personal del Consultorio.
          </p>
          <p>
            En la medida permitida por la ley, MayaOS no será responsable por daños indirectos, lucro cesante, ni
            pérdida de datos derivada de causas de fuerza mayor o fallas de terceros proveedores de infraestructura.
            La Plataforma se ofrece "tal cual" (as-is), sin garantías de disponibilidad absoluta más allá de lo
            indicado en estos Términos.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">11. Terminación</h2>
          <p>
            El Consultorio puede dejar de usar la Plataforma en cualquier momento. MayaOS podrá suspender o dar de
            baja una cuenta ante falta de pago prolongada o incumplimiento grave de estos Términos.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">12. Modificaciones a estos Términos</h2>
          <p>
            MayaOS podrá actualizar estos Términos para reflejar cambios en la Plataforma o en la normativa
            aplicable, notificando al Consultorio ante cambios significativos con antelación razonable.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">13. Divisibilidad</h2>
          <p>
            Si alguna cláusula de estos Términos fuera declarada inválida o inaplicable, dicha cláusula se
            considerará separable del resto, sin afectar la validez de las demás disposiciones.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">14. Ley aplicable</h2>
          <p>Estos Términos se rigen por las leyes del Estado Plurinacional de Bolivia.</p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">15. Contacto</h2>
          <p>Para consultas sobre estos Términos y Condiciones, comunicate con tu consultorio o con el equipo de MayaOS.</p>
        </section>
      </div>
    </div>
  )
}
