import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Vercel injeta automaticamente o país pelo IP
  const country = request.headers.get('x-vercel-ip-country') || 'BR'
  return NextResponse.json({ country, isInternational: country !== 'BR' })
}
