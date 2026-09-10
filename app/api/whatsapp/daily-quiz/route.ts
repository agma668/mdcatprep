import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const CRON_SECRET = process.env.CRON_SECRET;

// Called by cron job to send daily MCQs
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const service = createServiceClient();

  // Get today's questions (deterministic based on date)
  const today = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < today.length; i++) hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;

  const { data: questions } = await service
    .from('questions')
    .select('id, subject, question_text, option_a, option_b, option_c, option_d, correct_answer')
    .eq('status', 'published');

  if (!questions || questions.length === 0) {
    return NextResponse.json({ status: 'no questions' });
  }

  // Pick 3 random questions for today
  const shuffled = [...questions].sort((a, b) => {
    const ha = ((hash + a.id.charCodeAt(0)) | 0) % 1000;
    const hb = ((hash + b.id.charCodeAt(0)) | 0) % 1000;
    return ha - hb;
  });
  const todayQuestions = shuffled.slice(0, 3);

  // Get all active subscribers
  const { data: subscribers } = await service
    .from('whatsapp_subscribers')
    .select('phone_number')
    .eq('is_active', true);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ status: 'no subscribers' });
  }

  // Send MCQs to each subscriber
  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    try {
      const q = todayQuestions[Math.floor(Math.random() * todayQuestions.length)];
      const options = [
        `A) ${q.option_a}`,
        `B) ${q.option_b}`,
        q.option_c ? `C) ${q.option_c}` : null,
        q.option_d ? `D) ${q.option_d}` : null,
      ].filter(Boolean).join('\n');

      const message = `📚 *Daily MCQ*\n\n${q.question_text}\n\n${options}\n\nReply with A, B, C, or D!\n\n— MED Prep`;

      await sendWhatsAppMessage(sub.phone_number, message);
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: subscribers.length });
}

async function sendWhatsAppMessage(to: string, text: string) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    throw new Error('WhatsApp credentials not configured');
  }

  const response = await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
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

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error: ${error}`);
  }
}
