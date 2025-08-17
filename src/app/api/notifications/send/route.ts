import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import webpush from 'web-push'

// Configure web-push with VAPID keys
// In production, these should be environment variables
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
}

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:admin@hjemmeinventar.no',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { 
      title, 
      body, 
      type = 'GENERAL',
      url,
      requireInteraction = false,
      userId
    } = await request.json()

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    const targetUserId = userId || session.user.id

    // Get user's push subscriptions from database
    // In a real implementation:
    // const subscriptions = await db.pushSubscription.findMany({
    //   where: { userId: targetUserId }
    // })

    // For demonstration, we'll simulate having subscriptions
    const subscriptions: any[] = []

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No push subscriptions found for user' },
        { status: 404 }
      )
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: `hms-${type}`,
      requireInteraction,
      data: {
        type,
        url,
        timestamp: Date.now()
      }
    })

    const options = {
      TTL: 60 * 60 * 24, // 24 hours
      urgency: 'normal' as const,
      topic: type
    }

    // Send to all user's subscriptions
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        }

        await webpush.sendNotification(pushSubscription, payload, options)
        console.log('Push notification sent successfully to:', subscription.endpoint)
        return { success: true, endpoint: subscription.endpoint }
      } catch (error) {
        console.error('Failed to send push notification to:', subscription.endpoint, error)
        
        // If subscription is invalid, remove it from database
        if (error instanceof Error && error.message.includes('410')) {
          console.log('Removing invalid subscription:', subscription.endpoint)
          // await db.pushSubscription.delete({
          //   where: { id: subscription.id }
          // })
        }
        
        return { success: false, endpoint: subscription.endpoint, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    })

    const results = await Promise.all(sendPromises)
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Push notifications sent: ${successful} successful, ${failed} failed`,
      results: {
        total: subscriptions.length,
        successful,
        failed,
        details: results
      }
    })

  } catch (error) {
    console.error('Error sending push notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to test the notification system
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Send test notification
    const testNotification = {
      title: 'Test Notifikasjon',
      body: 'Dette er en test av push notification systemet!',
      type: 'GENERAL',
      url: '/dashboard',
      requireInteraction: false,
      userId: session.user.id
    }

    // In a real implementation, this would send to actual subscriptions
    console.log('Test notification would be sent:', testNotification)

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      notification: testNotification
    })

  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
