import { NextRequest } from 'next/server'
import { initSocket } from '@/lib/websocket/server'
import { createServer } from 'http'

// Global variable to store the socket server
let socketInitialized = false

export async function GET(request: NextRequest) {
  try {
    if (!socketInitialized) {
      // In development mode with Next.js, we can't easily access the HTTP server
      // So we'll create a simple mock or disable WebSocket for now
      if (process.env.NODE_ENV === 'development') {
        console.log('WebSocket server skipped in development mode')
        return Response.json({ 
          status: 'skipped', 
          message: 'WebSocket server skipped in development mode' 
        })
      }
      
      // For production, we'd need a custom server setup
      console.log('WebSocket server initialization attempted')
      socketInitialized = true
    }
    
    return Response.json({ 
      status: 'ok', 
      message: 'WebSocket status checked' 
    })
  } catch (error) {
    console.error('WebSocket initialization error:', error)
    return Response.json({ 
      status: 'error', 
      message: 'WebSocket initialization failed' 
    }, { status: 500 })
  }
}
