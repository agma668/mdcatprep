// Server-side EmailJS integration.
//
// Private credentials (EMAILJS_PRIVATE_KEY / accessToken) are read from env
// vars on the server and are never exposed to client code. Emails are sent
// through EmailJS's REST API, so no extra dependency is required.

type EmailJSResult = { ok: boolean; error?: string }

async function sendEmailJS(
  template_id: string,
  template_params: Record<string, string>
): Promise<EmailJSResult> {
  const service_id = process.env.EMAILJS_SERVICE_ID
  const user_id = process.env.EMAILJS_PUBLIC_KEY
  const accessToken = process.env.EMAILJS_PRIVATE_KEY

  if (!service_id || !user_id || !accessToken) {
    console.warn(
      '[emailjs] not configured (EMAILJS_SERVICE_ID / EMAILJS_PUBLIC_KEY / EMAILJS_PRIVATE_KEY) — email skipped'
    )
    return { ok: false, error: 'EmailJS not configured' }
  }

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id,
        template_id,
        user_id,
        accessToken,
        template_params,
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[emailjs] send failed (${res.status}):`, body)
      return { ok: false, error: `EmailJS error ${res.status}` }
    }

    return { ok: true }
  } catch (err) {
    console.error('[emailjs] send threw:', err)
    return { ok: false, error: err instanceof Error ? err.message : 'unknown error' }
  }
}

export type EnrollmentDetails = {
  student_name: string
  phone?: string | null
  exam_target?: string | null
  email?: string | null
}

// "New student enrollment received" → admin (template_n3nmool).
// Template placeholders that are not collected by the app are passed as empty
// strings so the template renders without breaking.
export async function sendEnrollmentEmail(
  details: EnrollmentDetails
): Promise<EmailJSResult> {
  const template_id = process.env.EMAILJS_TEMPLATE_ID_ENROLLMENT
  if (!template_id) {
    console.warn('[emailjs] EMAILJS_TEMPLATE_ID_ENROLLMENT not set — enrollment email skipped')
    return { ok: false, error: 'template not configured' }
  }

  return sendEmailJS(template_id, {
    student_name: details.student_name || '',
    parent_name: '',
    phone: details.phone || '',
    city: '',
    target_college: details.exam_target || '',
    package: '',
    package_price: '',
    payment_method: '',
    email: details.email || '',
  })
}

export async function sendStudentStatusEmail(details: {
  student_name: string
  email?: string | null
  status: 'approved' | 'rejected'
}): Promise<EmailJSResult> {
  const template_id =
    details.status === 'approved'
      ? process.env.EMAILJS_TEMPLATE_ID_APPROVAL
      : process.env.EMAILJS_TEMPLATE_ID_REJECTION

  if (!template_id) {
    console.warn(
      `[emailjs] status template for "${details.status}" not set — email skipped`
    )
    return { ok: false, error: 'template not configured' }
  }

  return sendEmailJS(template_id, {
    student_name: details.student_name || '',
    email: details.email || '',
    status: details.status,
  })
}
