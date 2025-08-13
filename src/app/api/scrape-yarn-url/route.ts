/**
 * API endpoint for scraping yarn product information from URLs
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { yarnUrlScraper } from '@/lib/scraping/yarn-url-scraper'
import { imageService } from '@/lib/image/image-service'
import { z } from 'zod'

const scrapeRequestSchema = z.object({
  url: z.string().url('Ugyldig URL'),
  downloadImages: z.boolean().default(false), // Default til false så brukeren kan velge
  selectedImageIndex: z.number().optional() // Index for hvilket bilde som skal lastes ned
})

export async function POST(request: NextRequest) {
  try {
    // Sjekk autentisering
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    console.log('Scraping request body:', { url: body.url, downloadImages: body.downloadImages })
    
    const validatedData = scrapeRequestSchema.parse(body)
    console.log('Validated URL:', validatedData.url)

    // Sjekk at URL-en ser ut som en produktside
    const url = validatedData.url.toLowerCase()
    const supportedSites = ['adlibris', 'hobbii', 'garnstudio', 'drops']
    const isSupportedSite = supportedSites.some(site => url.includes(site))
    
    if (!isSupportedSite) {
      console.log(`Prøver generisk scraping for: ${validatedData.url}`)
    }

    // Scrape produktinformasjon
    const productData = await yarnUrlScraper.scrapeUrl(validatedData.url)

    // Håndter bilder basert på brukervalg
    let downloadedImages = null
    if (validatedData.downloadImages && productData.images && productData.images.length > 0) {
      try {
        // Hvis et spesifikt bilde er valgt, last kun det ned
        if (validatedData.selectedImageIndex !== undefined) {
          const selectedImage = productData.images[validatedData.selectedImageIndex]
          if (selectedImage) {
            console.log(`Downloading selected image ${validatedData.selectedImageIndex}: ${selectedImage.url}`)
            const downloadedImage = await imageService.downloadAndStoreImage(
              selectedImage.url,
              'yarn-product',
              selectedImage.alt
            )
            downloadedImages = [downloadedImage]
            console.log(`Successfully downloaded selected image`)
          }
        } else {
          // Last ned alle bilder (gammel oppførsel for bakoverkompatibilitet)
          console.log(`Downloading ${productData.images.length} images for product: ${productData.name}`)
          downloadedImages = await imageService.downloadAndStoreImages(
            productData.images,
            'yarn-product'
          )
          console.log(`Successfully downloaded ${downloadedImages.length} images`)
        }
      } catch (imageError) {
        console.error('Failed to download images:', imageError)
        // Continue without images rather than failing entirely
        // Bruk original bilder som fallback
        if (validatedData.selectedImageIndex !== undefined) {
          const selectedImage = productData.images[validatedData.selectedImageIndex]
          downloadedImages = selectedImage ? [{
            url: selectedImage.url,
            filename: selectedImage.url.split('/').pop() || 'unknown.jpg',
            filesize: 0,
            filetype: 'image/jpeg'
          }] : null
        } else {
          downloadedImages = productData.images.map(img => ({
            url: img.url,
            filename: img.url.split('/').pop() || 'unknown.jpg',
            filesize: 0,
            filetype: 'image/jpeg'
          }))
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...productData,
        downloadedImages
      }
    })

  } catch (error) {
    console.error('Scraping API feil:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ugyldig forespørsel', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Ukjent feil ved scraping',
        suggestion: 'Sjekk at URL-en er riktig og at siden er tilgjengelig'
      },
      { status: 500 }
    )
  }
}

// GET endpoint for testing URL support
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
  }

  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'URL parameter mangler' }, { status: 400 })
  }

  try {
    const isSupported = await yarnUrlScraper.testUrl(url)
    return NextResponse.json({ supported: isSupported })
  } catch (error) {
    return NextResponse.json({ supported: false, error: error instanceof Error ? error.message : 'Test feilet' })
  }
}
