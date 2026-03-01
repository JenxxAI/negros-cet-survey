import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { password } = await request.json()
    const correct = process.env.RESULTS_PASSWORD

    // If no password is configured, allow access
    if (!correct || password === correct) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
