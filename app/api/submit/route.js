import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// In-memory rate limiter: max 3 submissions per IP per hour
const rateMap = new Map()
const RATE_LIMIT = 3
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ success: false, error: 'Too many submissions. Please try again later.' }, { status: 429 })
    }

    const body = await request.json()

    // Honeypot — bots fill this, humans don't
    if (body.website && body.website.trim() !== '') {
      return NextResponse.json({ success: true }) // silent reject
    }

    // Required field validation
    if (
      !Array.isArray(body.school) || body.school.length === 0 ||
      !body.year_taken || typeof body.year_taken !== 'string' ||
      !Array.isArray(body.course) || body.course.length === 0
    ) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 })
    }

    // Array fields must be arrays
    const arrayFields = ['school','course','subjects','math_topics','english_topics','science_topics','logic_topics','genknowledge_topics','review_method','wanted_features']
    for (const field of arrayFields) {
      if (body[field] !== undefined && !Array.isArray(body[field])) {
        return NextResponse.json({ success: false, error: `Invalid field: ${field}` }, { status: 400 })
      }
    }

    // Sanitize string fields — strip anything over 500 chars
    const sanitize = (v) => typeof v === 'string' ? v.slice(0, 500) : v

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    const { data, error } = await supabase
      .from('survey_responses')
      .insert([{
        name: sanitize(body.name) || null,
        school: body.school,
        school_other: sanitize(body.school_other) || null,
        year_taken: sanitize(body.year_taken),
        course: body.course,
        course_other: sanitize(body.course_other) || null,
        num_questions: sanitize(body.num_questions),
        exam_duration: sanitize(body.exam_duration),
        exam_type: sanitize(body.exam_type),
        exam_structure: sanitize(body.exam_structure),
        passing_score: sanitize(body.passing_score),
        subjects: body.subjects,
        math_topics: body.math_topics,
        english_topics: body.english_topics,
        science_topics: body.science_topics,
        logic_topics: body.logic_topics,
        genknowledge_topics: body.genknowledge_topics,
        hardest_part: sanitize(body.hardest_part),
        easiest_part: sanitize(body.easiest_part),
        time_enough: sanitize(body.time_enough),
        review_method: body.review_method,
        reviewer_available: sanitize(body.reviewer_available),
        wanted_features: body.wanted_features,
        would_use: sanitize(body.would_use),
        suggestions: sanitize(body.suggestions) || null,
        created_at: new Date().toISOString(),
      }])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
