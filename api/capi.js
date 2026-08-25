/**
 * API de Conversiones de Meta (CAPI) para MayaOS.
 *
 * El píxel del navegador pierde eventos por bloqueadores, Safari y iOS. Esta
 * función recibe el mismo evento desde el sitio y lo reenvía a Meta desde el
 * servidor, donde nada lo bloquea.
 *
 * La duplicación se evita con `event_id`: el navegador y el servidor mandan el
 * mismo identificador y Meta descarta la copia. Por eso hay que enviar SIEMPRE
 * por los dos caminos, nunca por uno solo.
 *
 * Variables de entorno (se cargan en Vercel, nunca en el repo):
 *   META_PIXEL_ID    el mismo ID del píxel del sitio
 *   META_CAPI_TOKEN  token generado en el Administrador de eventos
 *
 * Si falta cualquiera, responde 204 y no hace nada: el sitio sigue funcionando
 * con el píxel del navegador, sin errores.
 *
 * IMPORTANTE: acá sólo viajan datos del ODONTÓLOGO que se registra (es el
 * cliente). Nunca datos de los pacientes de las clínicas.
 */

import { createHash } from 'node:crypto'

const VERSION_API = 'v21.0'

// Solo se aceptan estos nombres, que son los del mapa de src/lib/analytics.ts.
// Sin la lista, cualquiera podría inyectar eventos falsos en la cuenta
// publicitaria llamando al endpoint.
const EVENTOS_PERMITIDOS = new Set([
  'CompleteRegistration',
  'StartTrial',
  'Purchase',
  'Schedule',
  'StaffJoined',
  'ProformaCreated',
  'PageView',
])

const DOMINIOS_PERMITIDOS = [
  'https://maya-os.app',
  'https://www.maya-os.app',
  'http://localhost:5174',
]

// Meta exige los datos personales normalizados y hasheados con SHA-256.
// Nunca viajan en claro.
const hash = (valor) =>
  createHash('sha256').update(String(valor).trim().toLowerCase()).digest('hex')

const hashTelefono = (valor) => {
  const soloDigitos = String(valor).replace(/\D/g, '')
  if (soloDigitos.length < 7) return null
  // Bolivia: si viene sin código de país, se antepone 591
  const conPais = soloDigitos.length <= 8 ? `591${soloDigitos}` : soloDigitos
  return createHash('sha256').update(conPais).digest('hex')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Solo POST' })
  }

  const pixelId = process.env.META_PIXEL_ID
  const token = process.env.META_CAPI_TOKEN
  if (!pixelId || !token) {
    // Todavía no configurado. No es un error: el sitio funciona igual.
    return res.status(204).end()
  }

  const origen = req.headers.origin || ''
  if (origen && !DOMINIOS_PERMITIDOS.includes(origen)) {
    return res.status(403).json({ error: 'Origen no permitido' })
  }

  try {
    // sendBeacon manda el cuerpo como Blob: según el runtime puede llegar
    // ya parseado o como texto crudo.
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const { evento, event_id, event_source_url, datos = {}, usuario = {} } = body

    if (!evento || !EVENTOS_PERMITIDOS.has(evento)) {
      return res.status(400).json({ error: 'Evento no reconocido' })
    }
    if (!event_id) {
      // Sin event_id Meta contaría el evento dos veces
      return res.status(400).json({ error: 'Falta event_id' })
    }

    const user_data = {
      client_ip_address:
        (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || undefined,
      client_user_agent: req.headers['user-agent'] || undefined,
    }
    if (usuario.email) user_data.em = [hash(usuario.email)]
    if (usuario.telefono) {
      const tel = hashTelefono(usuario.telefono)
      if (tel) user_data.ph = [tel]
    }
    if (usuario.nombre) user_data.fn = [hash(usuario.nombre)]
    if (usuario.apellido) user_data.ln = [hash(usuario.apellido)]
    if (usuario.fbp) user_data.fbp = usuario.fbp
    if (usuario.fbc) user_data.fbc = usuario.fbc

    const custom_data = { ...datos }
    delete custom_data.email
    delete custom_data.telefono

    const cuerpo = {
      data: [
        {
          event_name: evento,
          event_time: Math.floor(Date.now() / 1000),
          event_id,
          event_source_url,
          action_source: 'website',
          user_data,
          custom_data,
        },
      ],
    }

    const url = `https://graph.facebook.com/${VERSION_API}/${pixelId}/events?access_token=${token}`
    const meta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    })

    const resultado = await meta.json()

    if (!meta.ok) {
      console.error('CAPI rechazado por Meta:', JSON.stringify(resultado))
      return res.status(502).json({ error: 'Meta rechazó el evento' })
    }

    return res.status(200).json({ ok: true, recibidos: resultado.events_received })
  } catch (e) {
    console.error('CAPI error:', e.message)
    // Nunca romper la experiencia del visitante por un fallo de medición
    return res.status(500).json({ error: 'Error interno' })
  }
}
