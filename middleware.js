import { NextResponse } from 'next/server'

export function middleware(request) {
  const user = process.env.RESULTS_USER || 'admin'
  const password = process.env.RESULTS_PASSWORD

  // If no password is set, allow through
  if (!password) return NextResponse.next()

  const authHeader = request.headers.get('authorization')

  if (authHeader) {
    const base64 = authHeader.replace('Basic ', '')
    const decoded = Buffer.from(base64, 'base64').toString('utf-8')
    const [inputUser, inputPassword] = decoded.split(':')
    if (inputUser === user && inputPassword === password) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Results Dashboard"',
    },
  })
}

export const config = {
  matcher: ['/results', '/api/responses'],
}
