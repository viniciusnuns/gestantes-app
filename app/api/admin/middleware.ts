import { NextRequest, NextResponse } from 'next/server'

export function requireAdminKey(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  const expectedKey = process.env.ADMIN_API_KEY

  if (!expectedKey) {
    console.error('[Admin Auth] ADMIN_API_KEY not configured')
    return NextResponse.json(
      { error: 'Admin API not configured' },
      { status: 500 }
    )
  }

  if (!adminKey || adminKey !== expectedKey) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing admin key' },
      { status: 401 }
    )
  }

  return null
}
