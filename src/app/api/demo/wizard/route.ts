import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createDemoLocations, clearDemoLocations } from '@/lib/demo/wizard-demo-data'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action } = await request.json()

    if (action === 'create') {
      await createDemoLocations(session.user.id)
      return NextResponse.json({ 
        success: true, 
        message: 'Demo lokasjoner opprettet' 
      })
    } else if (action === 'clear') {
      await clearDemoLocations(session.user.id)
      return NextResponse.json({ 
        success: true, 
        message: 'Demo lokasjoner slettet' 
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Demo API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}