declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

const META_EVENT_MAP: Record<string, { name: string; standard: boolean }> = {
  sign_up: { name: 'CompleteRegistration', standard: true },
  clinic_created: { name: 'StartTrial', standard: true },
  staff_joined: { name: 'StaffJoined', standard: false },
  appointment_created: { name: 'Schedule', standard: true },
  proforma_created: { name: 'ProformaCreated', standard: false },
  payment_submitted: { name: 'Purchase', standard: true },
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    const meta = META_EVENT_MAP[name]
    if (meta) {
      window.fbq(meta.standard ? 'track' : 'trackCustom', meta.name, params)
    }
  }
}
