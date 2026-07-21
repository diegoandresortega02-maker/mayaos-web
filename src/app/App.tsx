import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import PatientsList from './pages/PatientsList'
import PatientDetail from './pages/PatientDetail'
import AgendaPage from './pages/AgendaPage'
import TreatmentsPage from './pages/TreatmentsPage'
import CashRegisterPage from './pages/CashRegisterPage'
import StaffPage from './pages/StaffPage'
import ClinicalRecordDetail from './pages/ClinicalRecordDetail'
import PrintPatientView from './pages/PrintPatientView'
import PrintProformaView from './pages/PrintProformaView'
import StartClinicalHistory from './pages/StartClinicalHistory'
import ConsentSign from './pages/ConsentSign'
import PrintConsentView from './pages/PrintConsentView'
import TerminosPage from './pages/TerminosPage'
import PrivacidadPage from './pages/PrivacidadPage'
import BillingPage from './pages/BillingPage'
import AdminLayout from './components/AdminLayout'
import AdminSolicitudes from './pages/AdminSolicitudes'
import AdminConsultorios from './pages/AdminConsultorios'

function postAuthRedirect(clinicUser: unknown, isPlatformAdmin: boolean) {
  if (clinicUser) return '/dashboard'
  if (isPlatformAdmin) return '/admin'
  return '/onboarding'
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, clinicUser, isPlatformAdmin, loading } = useAuth()
  if (loading) return <FullscreenLoader />
  if (!session) return <Navigate to="/login" replace />
  if (!clinicUser) return <Navigate to={postAuthRedirect(clinicUser, isPlatformAdmin)} replace />
  return <>{children}</>
}

function RequireSessionOnly({ children }: { children: React.ReactNode }) {
  const { session, clinicUser, isPlatformAdmin, loading } = useAuth()
  if (loading) return <FullscreenLoader />
  if (!session) return <Navigate to="/login" replace />
  if (clinicUser || isPlatformAdmin) return <Navigate to={postAuthRedirect(clinicUser, isPlatformAdmin)} replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { session, isPlatformAdmin, loading } = useAuth()
  if (loading) return <FullscreenLoader />
  if (!session) return <Navigate to="/login" replace />
  if (!isPlatformAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { session, clinicUser, isPlatformAdmin, loading } = useAuth()
  if (loading) return <FullscreenLoader />
  if (session) return <Navigate to={postAuthRedirect(clinicUser, isPlatformAdmin)} replace />
  return <>{children}</>
}

function FullscreenLoader() {
  return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Cargando…</div>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/terminos" element={<TerminosPage />} />
      <Route path="/privacidad" element={<PrivacidadPage />} />
      <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
      <Route path="/registro" element={<RedirectIfAuthed><Register /></RedirectIfAuthed>} />
      <Route path="/onboarding" element={<RequireSessionOnly><Onboarding /></RequireSessionOnly>} />

      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pacientes" element={<PatientsList />} />
        <Route path="/pacientes/:id" element={<PatientDetail />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/tratamientos" element={<TreatmentsPage />} />
        <Route path="/caja" element={<CashRegisterPage />} />
        <Route path="/equipo" element={<StaffPage />} />
        <Route path="/facturacion" element={<BillingPage />} />
        <Route path="/pacientes/:patientId/historia/:recordId" element={<ClinicalRecordDetail />} />
        <Route path="/pacientes/:id/historia/iniciar" element={<StartClinicalHistory />} />
        <Route path="/pacientes/:patientId/consentimiento/nuevo" element={<ConsentSign />} />
      </Route>

      <Route
        path="/pacientes/:patientId/imprimir/:recordId"
        element={
          <RequireAuth>
            <PrintPatientView />
          </RequireAuth>
        }
      />

      <Route
        path="/pacientes/:patientId/proformas/:proformaId/imprimir"
        element={
          <RequireAuth>
            <PrintProformaView />
          </RequireAuth>
        }
      />

      <Route
        path="/pacientes/:patientId/consentimiento/:consentId/imprimir"
        element={
          <RequireAuth>
            <PrintConsentView />
          </RequireAuth>
        }
      />

      <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route path="/admin" element={<Navigate to="/admin/solicitudes" replace />} />
        <Route path="/admin/solicitudes" element={<AdminSolicitudes />} />
        <Route path="/admin/consultorios" element={<AdminConsultorios />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
