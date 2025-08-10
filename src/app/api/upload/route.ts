import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      )
    }

    // Get the file data from the request
    const body = await request.blob()
    
    if (!body || body.size === 0) {
      return NextResponse.json(
        { error: 'No file data provided' },
        { status: 400 }
      )
    }

    // Validate file type (images only)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (body.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename with timestamp and user ID
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const extension = filename.split('.').pop()
    const uniqueFilename = `items/${session.user.id}/${timestamp}-${filename.replace(/[^a-zA-Z0-9.-]/g, '')}`

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, body, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      size: body.size,
      contentType: body.type,
      uploadedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
