import { NextResponse } from 'next/server';

/**
 * Automated WhatsApp delivery is intentionally disabled.
 *
 * Meta's WhatsApp Business Platform can charge per delivered message, so this
 * endpoint must not send messages or query the subscriber list under Apex's
 * zero-spend policy. The ordinary WhatsApp contact link remains available.
 */
export async function POST() {
  return NextResponse.json(
    {
      status: 'disabled',
      reason: 'Automated WhatsApp messaging is disabled to prevent any metered charges.',
    },
    { status: 410 }
  );
}
