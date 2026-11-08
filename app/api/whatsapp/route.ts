import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { isValidWhatsAppSignature } from '@/lib/whatsapp-signature';

export const runtime = 'nodejs';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

export async function GET(request: NextRequest) {
  if (!VERIFY_TOKEN) {
    return NextResponse.json({ error: 'WhatsApp webhook is not configured' }, { status: 503 });
  }
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token && token === VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * Incoming STOP requests remain supported so an existing subscriber can
 * unsubscribe. All outbound WhatsApp Business API messages are disabled:
 * Meta's API can charge per delivered message, which violates Apex's
 * zero-spend operating rule. Use the website's ordinary WhatsApp contact link
 * for human-initiated chats instead.
 */
export async function POST(request: NextRequest) {
  if (!APP_SECRET) {
    return NextResponse.json({ error: 'WhatsApp webhook is not configured' }, { status: 503 });
  }
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    if (!isValidWhatsAppSignature(rawBody, signature, APP_SECRET)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    let body: {
      object?: string;
      entry?: Array<{ changes?: Array<{ value?: { messages?: Array<{ from?: string; text?: { body?: string } }> } }> }>;
    };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' });
    }
    const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!messages?.length) return NextResponse.json({ status: 'ok' });

    const message = messages[0];
    const from = message.from;
    const text = message.text?.body?.toLowerCase().trim() || '';
    if (!from) return NextResponse.json({ status: 'ignored' });

    if (text === 'stop' || text === 'unsubscribe' || text === 'cancel') {
      await handleOptOut(from);
      return NextResponse.json({ status: 'unsubscribed' });
    }

    // Do not create new subscriptions for a bot that cannot send free replies.
    if (text === 'start' || text === 'join' || text === 'subscribe') {
      return NextResponse.json({
        status: 'disabled',
        reason: 'Automated WhatsApp messaging is disabled to prevent charges.',
      });
    }

    return NextResponse.json({ status: 'ok', outboundMessagesDisabled: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

async function handleOptOut(phone: string) {
  const service = createServiceClient();
  await service.from('whatsapp_subscribers').update({ is_active: false }).eq('phone_number', phone);
}
