import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { subscription } = await request.json()

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    // Store subscription in database
    // Note: This would require adding a PushSubscription model to your Prisma schema
    // For now, we'll simulate storing it
    
    console.log('Storing push subscription for user:', session.user.id)
    console.log('Subscription:', subscription)

    // In a real implementation, you would:
    // await db.pushSubscription.upsert({
    //   where: {
    //     userId_endpoint: {
    //       userId: session.user.id,
    //       endpoint: subscription.endpoint
    //     }
    //   },
    //   update: {
    //     p256dh: subscription.keys.p256dh,
    //     auth: subscription.keys.auth,
    //     updatedAt: new Date()
    //   },
    //   create: {
    //     userId: session.user.id,
    //     endpoint: subscription.endpoint,
    //     p256dh: subscription.keys.p256dh,
    //     auth: subscription.keys.auth
    //   }
    // })

    return NextResponse.json({ 
      success: true,
      message: 'Push notification subscription saved'
    })

  } catch (error) {
    console.error('Error saving push subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's push subscriptions
    // const subscriptions = await db.pushSubscription.findMany({
    //   where: { userId: session.user.id }
    // })

    return NextResponse.json({ 
      subscriptions: [], // Replace with actual subscriptions
      count: 0
    })

  } catch (error) {
    console.error('Error getting push subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
