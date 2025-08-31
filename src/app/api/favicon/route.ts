// Handle favicon requests by redirecting to SVG icon
import { NextResponse } from 'next/server'

export async function GET() {
  // Redirect favicon.ico requests to the SVG icon
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return NextResponse.redirect(new URL('/icon.svg', baseUrl))
}
