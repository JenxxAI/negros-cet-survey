import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    const body = await request.json()

    const { data, error } = await supabase
      .from('survey_responses')
      .insert([{
        school: body.school,
        school_other: body.school_other || null,
        year_taken: body.year_taken,
        course: body.course,
        course_other: body.course_other || null,
        num_questions: body.num_questions,
        exam_duration: body.exam_duration,
        exam_type: body.exam_type,
        exam_structure: body.exam_structure,
        passing_score: body.passing_score,
        subjects: body.subjects,
        math_topics: body.math_topics,
        english_topics: body.english_topics,
        science_topics: body.science_topics,
        logic_topics: body.logic_topics,
        genknowledge_topics: body.genknowledge_topics,
        hardest_part: body.hardest_part,
        easiest_part: body.easiest_part,
        time_enough: body.time_enough,
        review_method: body.review_method,
        reviewer_available: body.reviewer_available,
        wanted_features: body.wanted_features,
        would_use: body.would_use,
        suggestions: body.suggestions || null,
        created_at: new Date().toISOString(),
      }])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
