import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { triggerNotificationCheck } from '@/lib/automation/notification-jobs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { type = 'all' } = await request.json()

    if (!['expiry', 'loans', 'stock', 'all'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid job type' },
        { status: 400 }
      )
    }

    console.log(`Triggering notification check: ${type}`)
    await triggerNotificationCheck(type)

    return NextResponse.json({
      success: true,
      message: `Notification check '${type}' completed successfully`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error running notification jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for checking job status or running scheduled jobs
export async function GET(request: NextRequest) {
  try {
    // Check if this is a cron job request (for Vercel Cron)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Allow access for authenticated users or valid cron requests
    const session = await getServerSession(authOptions)
    const isValidCron = cronSecret && authHeader === `Bearer ${cronSecret}`

    if (!session?.user?.id && !isValidCron) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get job type from query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    if (!['expiry', 'loans', 'stock', 'all'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid job type' },
        { status: 400 }
      )
    }

    console.log(`Running scheduled notification check: ${type}`)
    await triggerNotificationCheck(type as any)

    return NextResponse.json({
      success: true,
      message: `Scheduled notification check '${type}' completed`,
      timestamp: new Date().toISOString(),
      source: isValidCron ? 'cron' : 'manual'
    })

  } catch (error) {
    console.error('Error running scheduled notification jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
