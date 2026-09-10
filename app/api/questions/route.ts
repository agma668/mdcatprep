import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'published'
  const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 500)

  const service = createServiceClient()
  const { data, error } = await service
    .from('questions')
    .select('id, subject, topic, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
