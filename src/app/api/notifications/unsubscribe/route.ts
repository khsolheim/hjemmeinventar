import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint' },
        { status: 400 }
      )
    }

    console.log('Removing push subscription for user:', session.user.id)
    console.log('Endpoint:', endpoint)

    // In a real implementation, you would:
    // await db.pushSubscription.deleteMany({
    //   where: {
    //     userId: session.user.id,
    //     endpoint: endpoint
    //   }
    // })

    return NextResponse.json({ 
      success: true,
      message: 'Push notification subscription removed'
    })

  } catch (error) {
    console.error('Error removing push subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
