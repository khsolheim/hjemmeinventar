// Handle favicon requests
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return a simple response that won't cause errors
    return new NextResponse('', {
      status: 200,
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=31536000',
      }
    })
  } catch (error) {
    console.error('Favicon error:', error)
    return new NextResponse('', { status: 500 })
  }
}
