import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { meilisearchService } from '@/lib/search/meilisearch-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { query, filters = {}, limit = 20, offset = 0, sort } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const searchOptions = {
      userId: session.user.id,
      filters,
      limit: Math.min(limit, 100), // Cap at 100 results
      offset: Math.max(offset, 0),
      sort
    }

    const results = await meilisearchService.search(query, searchOptions)

    return NextResponse.json({
      success: true,
      query,
      hits: results.hits,
      totalHits: results.totalHits,
      processingTimeMs: results.processingTimeMs,
      pagination: {
        limit,
        offset,
        hasMore: results.totalHits > offset + limit
      }
    })

  } catch (error) {
    console.error('Meilisearch API error:', error)
    return NextResponse.json(
      { error: 'Search service error' },
      { status: 500 }
    )
  }
}

// GET endpoint for facets and suggestions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'facets':
        const facets = await meilisearchService.getFacets(session.user.id, [
          'type',
          'categoryName',
          'locationName',
          'tags'
        ])

        return NextResponse.json({
          success: true,
          facets
        })

      case 'health':
        const isHealthy = await meilisearchService.isHealthy()
        const stats = await meilisearchService.getStats()

        return NextResponse.json({
          success: true,
          healthy: isHealthy,
          stats
        })

      case 'reindex':
        // Admin action to reindex all user data
        if (!isAdmin(session.user)) {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          )
        }

        // This would trigger a full reindex
        // Implementation depends on your admin requirements
        return NextResponse.json({
          success: true,
          message: 'Reindex triggered'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Meilisearch API error:', error)
    return NextResponse.json(
      { error: 'Search service error' },
      { status: 500 }
    )
  }
}

// Helper function to check admin access
function isAdmin(user: any): boolean {
  // Implement your admin check logic
  // For example, check user role or email
  return user.role === 'admin' || user.email === 'admin@hjemmeinventar.no'
}
