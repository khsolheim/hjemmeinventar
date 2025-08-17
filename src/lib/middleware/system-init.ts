import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { SystemHealthService } from '@/lib/services/system-health'

// Routes that require system initialization check
const PROTECTED_YARN_ROUTES = [
  '/garn',
  '/api/trpc/yarn',
  '/api/scrape-yarn-url'
]

export async function systemInitMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if this is a yarn-related route
  const isYarnRoute = PROTECTED_YARN_ROUTES.some(route => 
    pathname.startsWith(route)
  )

  if (!isYarnRoute) {
    return NextResponse.next()
  }

  try {
    // Get session
    const session = await auth()
    if (!session?.user?.id) {
      // Not authenticated - let the auth middleware handle it
      return NextResponse.next()
    }

    // Check system health for yarn functionality
    const healthService = new SystemHealthService(db)
    const health = await healthService.checkYarnSystemRequirements(session.user.id)

    if (!health.ready) {
      console.warn('🔧 System not ready for yarn operations, initializing...', {
        userId: session.user.id,
        issues: health.issues,
        route: pathname
      })

      // Auto-initialize system requirements
      try {
        await healthService.initializeUserDefaults(session.user.id)
        console.log('✅ System initialized successfully for user:', session.user.id)
      } catch (initError) {
        console.error('❌ Failed to initialize system:', initError)
        
        // For API routes, return error
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { 
              error: 'System initialization failed',
              details: health.issues 
            },
            { status: 500 }
          )
        }
        
        // For pages, add warning header
        const response = NextResponse.next()
        response.headers.set('X-System-Warning', 'Initialization required')
        return response
      }
    }

    return NextResponse.next()

  } catch (error) {
    console.error('❌ System init middleware error:', error)
    return NextResponse.next() // Don't block on middleware errors
  }
}

export function shouldRunSystemInit(pathname: string): boolean {
  return PROTECTED_YARN_ROUTES.some(route => pathname.startsWith(route))
}
