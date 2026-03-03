import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    const { count, error } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    const BASE_OFFSET = 400
    const total = (count ?? 0) + BASE_OFFSET

    return NextResponse.json({ success: true, count: total })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
