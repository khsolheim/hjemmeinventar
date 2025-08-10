import { NextRequest, NextResponse } from 'next/server'

// Simple ping endpoint for connection quality testing
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  // Add small delay to simulate processing
  await new Promise(resolve => setTimeout(resolve, 10))
  
  const endTime = Date.now()
  const processingTime = endTime - startTime
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    processingTime,
    message: 'pong'
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

// Also support HEAD requests for faster connectivity checks
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}
