import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { isValidWhatsAppSignature } from '@/lib/whatsapp-signature';

export const runtime = 'nodejs';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

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

export async function POST(request: NextRequest) {
  if (!APP_SECRET || !ACCESS_TOKEN || !PHONE_NUMBER_ID) {
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

    if (text === 'start' || text === 'join' || text === 'subscribe') {
      await handleOptIn(from);
      await sendWhatsAppMessage(from, 'You\'re subscribed!\n\nYou\'ll receive 3 daily MCQs for your exam prep.\n\nReply STOP to unsubscribe.');
    } else if (text === 'stop' || text === 'unsubscribe' || text === 'cancel') {
      await handleOptOut(from);
      await sendWhatsAppMessage(from, 'Unsubscribed.\n\nReply START to resume daily MCQs.');
    } else if (text === 'help') {
      await sendWhatsAppMessage(from, 'MED Prep Bot\n\nCommands:\n• START - Subscribe to daily MCQs\n• STOP - Unsubscribe\n• HELP - Show this message\n\nReply with A, B, C, or D to answer MCQs.');
    } else if (['a', 'b', 'c', 'd'].includes(text)) {
      await handleAnswer(from, text.toUpperCase());
    } else if (text) {
      await sendWhatsAppMessage(from, 'Reply with A, B, C, or D to answer.\n\nType HELP for commands.');
    }
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

async function handleOptIn(phone: string) {
  const service = createServiceClient();
  await service.from('whatsapp_subscribers').upsert({
    phone_number: phone, is_active: true, subscribed_at: new Date().toISOString(),
  }, { onConflict: 'phone_number' });
}

async function handleOptOut(phone: string) {
  const service = createServiceClient();
  await service.from('whatsapp_subscribers').update({ is_active: false }).eq('phone_number', phone);
}

async function handleAnswer(phone: string, answer: string) {
  await sendWhatsAppMessage(phone, `Got it: ${answer}\n\nStay tuned for more MCQs tomorrow!`);
}

async function sendWhatsAppMessage(to: string, text: string) {
  const response = await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    body: JSON.stringify({
      messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { body: text },
    }),
  });
  if (!response.ok) console.error('WhatsApp message send failed:', response.status);
}
