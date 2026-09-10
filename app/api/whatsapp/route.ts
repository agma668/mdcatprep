import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'cadet-prep-bot-2026';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// GET: Webhook verification
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// POST: Receive messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' });
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: 'ok' });
    }

    const message = messages[0];
    const from = message.from; // Phone number
    const text = message.text?.body?.toLowerCase().trim() || '';

    // Handle opt-in/opt-out commands
    if (text === 'start' || text === 'join' || text === 'subscribe') {
      await handleOptIn(from);
      await sendWhatsAppMessage(from, '✅ You\'re subscribed!\n\nYou\'ll receive 3 daily MCQs for your exam prep.\n\nReply STOP to unsubscribe.');
    } else if (text === 'stop' || text === 'unsubscribe' || text === 'cancel') {
      await handleOptOut(from);
      await sendWhatsAppMessage(from, '❌ Unsubscribed.\n\nReply START to resume daily MCQs.');
    } else if (text === 'help') {
      await sendWhatsAppMessage(from, '📚 MED Prep Bot\n\nCommands:\n• START - Subscribe to daily MCQs\n• STOP - Unsubscribe\n• HELP - Show this message\n\nReply with A, B, C, or D to answer MCQs.');
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
    phone_number: phone,
    is_active: true,
    subscribed_at: new Date().toISOString(),
  }, { onConflict: 'phone_number' });
}

async function handleOptOut(phone: string) {
  const service = createServiceClient();
  await service.from('whatsapp_subscribers')
    .update({ is_active: false })
    .eq('phone_number', phone);
}

async function handleAnswer(phone: string, answer: string) {
  // Store answer and send next MCQ
  await sendWhatsAppMessage(phone, `✅ Got it: ${answer}\n\nStay tuned for more MCQs tomorrow! 🎯`);
}

async function sendWhatsAppMessage(to: string, text: string) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials not configured');
    return;
  }

  await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
}
