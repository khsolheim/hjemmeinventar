/**
 * Image Service for downloading and storing product images
 * Supports multiple storage backends and automatic optimization
 */

import { put } from '@vercel/blob'
import sharp from 'sharp'
import path from 'path'
import crypto from 'crypto'

export interface ImageUploadResult {
  url: string
  filename: string
  filesize: number
  filetype: string
  width?: number
  height?: number
}

export interface DownloadedImage {
  url: string
  alt?: string
  caption?: string
  isPrimary?: boolean
}

export class ImageService {
  private readonly MAX_WIDTH = 1200
  private readonly MAX_HEIGHT = 1200
  private readonly QUALITY = 85
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  /**
   * Download and process a single image from URL
   */
  async downloadAndStoreImage(
    imageUrl: string, 
    prefix: string = 'yarn-product',
    alt?: string
  ): Promise<ImageUploadResult> {
    try {
      // Download image
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Validate file size
      if (buffer.length > this.MAX_FILE_SIZE) {
        throw new Error(`Image too large: ${buffer.length} bytes (max ${this.MAX_FILE_SIZE})`)
      }

      // Process and optimize image
      const processedImage = await this.processImage(buffer)
      
      // Generate unique filename
      const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8)
      const timestamp = Date.now()
      const filename = `${prefix}-${timestamp}-${hash}.webp`

      // Upload to Vercel Blob
      try {
        const blob = await put(filename, processedImage.buffer, {
          access: 'public',
          contentType: 'image/webp'
        })

        return {
          url: blob.url,
          filename: filename,
          filesize: processedImage.buffer.length,
          filetype: 'image/webp',
          width: processedImage.width,
          height: processedImage.height
        }
      } catch (blobError) {
        // Hvis Vercel Blob feiler, returner original URL som fallback
        console.warn('Vercel Blob upload failed, using original URL as fallback:', blobError)
        return {
          url: imageUrl, // Bruk original URL som fallback
          filename: filename,
          filesize: processedImage.buffer.length,
          filetype: 'image/webp',
          width: processedImage.width,
          height: processedImage.height
        }
      }

    } catch (error) {
      console.error('Failed to download and store image:', error)
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Download and store multiple images from URLs
   */
  async downloadAndStoreImages(
    images: DownloadedImage[],
    prefix: string = 'yarn-product'
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = []
    
    // Process images in parallel (with limit to avoid overwhelming the server)
    const BATCH_SIZE = 3
    for (let i = 0; i < images.length; i += BATCH_SIZE) {
      const batch = images.slice(i, i + BATCH_SIZE)
      
      const batchPromises = batch.map(async (image, index) => {
        try {
          const actualIndex = i + index
          const isPrimary = image.isPrimary || actualIndex === 0
          const imagePrefix = isPrimary ? `${prefix}-primary` : `${prefix}-${actualIndex + 1}`
          
          return await this.downloadAndStoreImage(image.url, imagePrefix, image.alt)
        } catch (error) {
          console.error(`Failed to process image ${image.url}:`, error)
          return null
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults.filter((result): result is ImageUploadResult => result !== null))
    }

    return results
  }

  /**
   * Process and optimize an image buffer
   */
  private async processImage(buffer: Buffer): Promise<{buffer: Buffer, width: number, height: number}> {
    const image = sharp(buffer)
    const metadata = await image.metadata()

    // Calculate new dimensions while maintaining aspect ratio
    let { width = this.MAX_WIDTH, height = this.MAX_HEIGHT } = metadata
    
    if (width > this.MAX_WIDTH || height > this.MAX_HEIGHT) {
      const ratio = Math.min(this.MAX_WIDTH / width, this.MAX_HEIGHT / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }

    // Process image: resize, optimize, convert to WebP
    const processedBuffer = await image
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ 
        quality: this.QUALITY,
        effort: 4 // Balance between compression and speed
      })
      .toBuffer()

    return {
      buffer: processedBuffer,
      width,
      height
    }
  }

  /**
   * Extract images from HTML content
   */
  extractImagesFromHtml($: any, baseUrl: string): DownloadedImage[] {
    const images: DownloadedImage[] = []
    const seenUrls = new Set<string>()

    console.log('Extracting images from HTML for URL:', baseUrl)

    // Fokus kun på faktiske produktbilder
    const imageSelectors = [
      // Spesifikke produktbilde-selectorer
      'img[alt*="melody"], img[alt*="drops"]',
      'img[src*="melody"], img[src*="drops"]', 
      'img[src*="garn"], img[src*="yarn"]',
      'img[alt*="garn"], img[alt*="yarn"]',
      'img[src*="alpakkamiks"]',
      'img[alt*="alpakkamiks"]',
      
      // Primære produktbilder
      '.product-image img',
      '.main-image img',
      '.hero-image img',
      '.primary-image img',
      
      // Produktgalleri
      '.product-gallery img',
      '.image-gallery img',
      '.gallery img',
      
      // Adlibris produktområde
      '.product img',
      'main img',
      'article img'
    ]

    imageSelectors.forEach((selector, selectorIndex) => {
      const elements = $(selector)
      console.log(`Checking selector "${selector}": found ${elements.length} elements`)
      
      elements.each((index: number, element: any) => {
        const $img = $(element)
        const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src') || $img.attr('data-original')
        const alt = $img.attr('alt') || ''
        
        if (src) {
          console.log(`Found image source: ${src}`)
          const fullUrl = this.resolveImageUrl(src, baseUrl)
          console.log(`Resolved to: ${fullUrl}`)
          
          // Skip duplicates and invalid URLs
          if (!seenUrls.has(fullUrl) && this.isValidImageUrl(fullUrl)) {
            seenUrls.add(fullUrl)
            
            // Determine if this is likely the primary image
            const isPrimary = selector.includes('product-image') || 
                             selector.includes('main-image') || 
                             selector.includes('hero-image') ||
                             selector.includes('primary-image') ||
                             (selectorIndex < 5 && index === 0) // First image from high-priority selectors

            console.log(`Adding image: ${fullUrl} (primary: ${isPrimary})`)

            images.push({
              url: fullUrl,
              alt: alt.trim(),
              isPrimary
            })
          } else {
            console.log(`Skipping image: ${fullUrl} (duplicate: ${seenUrls.has(fullUrl)}, valid: ${this.isValidImageUrl(fullUrl)})`)
          }
        }
      })
    })

    // Sort images: primary first, then by likely importance
    images.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1
      if (!a.isPrimary && b.isPrimary) return 1
      
      // Prefer images with descriptive alt text
      if (a.alt && !b.alt) return -1
      if (!a.alt && b.alt) return 1
      
      return 0
    })

    return images.slice(0, 5) // Tillat opptil 5 produktbilder
  }

  /**
   * Resolve relative image URLs to absolute URLs and optimize size
   */
  private resolveImageUrl(imageUrl: string, baseUrl: string): string {
    try {
      let resolvedUrl = imageUrl
      
      if (imageUrl.startsWith('http')) {
        resolvedUrl = imageUrl
      } else if (imageUrl.startsWith('//')) {
        resolvedUrl = `https:${imageUrl}`
      } else if (imageUrl.startsWith('/')) {
        const url = new URL(baseUrl)
        resolvedUrl = `${url.protocol}//${url.host}${imageUrl}`
      } else {
        // Relative URL
        const url = new URL(baseUrl)
        resolvedUrl = new URL(imageUrl, url.href).href
      }
      
      // Optimaliser Adlibris bilder - øk størrelsen
      if (resolvedUrl.includes('adlibris.com') && resolvedUrl.includes('?w=')) {
        resolvedUrl = resolvedUrl.replace(/\?w=\d+/, '?w=500')
        console.log(`Optimized Adlibris image size: ${resolvedUrl}`)
      }
      
      return resolvedUrl
    } catch (error) {
      console.error('Failed to resolve image URL:', imageUrl, error)
      return imageUrl
    }
  }

  /**
   * Validate if URL points to an image
   */
  private isValidImageUrl(url: string): boolean {
    try {
      if (!url || url.length < 10) return false
      
      const urlObj = new URL(url)
      const pathname = urlObj.pathname.toLowerCase()
      const search = urlObj.search.toLowerCase()
      
      // Check file extension
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp', '.tiff']
      const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext))
      
      // Check if URL contains image-related keywords
      const hasImageKeywords = pathname.includes('image') || 
                              pathname.includes('photo') || 
                              pathname.includes('product') ||
                              pathname.includes('thumb') ||
                              pathname.includes('cover') ||
                              pathname.includes('media') ||
                              search.includes('image') ||
                              search.includes('photo')

      // Spesifikke produktbilde-indikatorer
      const isProductImage = pathname.includes('product') ||
                            pathname.includes('item') ||
                            pathname.includes('cover') ||
                            // Garn-spesifikke termer
                            pathname.includes('garn') ||
                            pathname.includes('yarn') ||
                            pathname.includes('melody') ||
                            pathname.includes('drops') ||
                            // Alt-tekst indikatorer
                            url.includes('garn') ||
                            url.includes('yarn') ||
                            // Adlibris spesifikke mønstre
                            pathname.includes('melody-uni-colour') ||
                            pathname.includes('alpakkamiks')

      // Check for CDN patterns
      const isCdnImage = urlObj.hostname.includes('cloudfront') ||
                        urlObj.hostname.includes('cloudinary') ||
                        urlObj.hostname.includes('imgix') ||
                        urlObj.hostname.includes('amazonaws') ||
                        urlObj.hostname.includes('blob.core') ||
                        urlObj.hostname.includes('images.') ||
                        urlObj.hostname.includes('img.') ||
                        urlObj.hostname.includes('cdn.')

      // Ekskluder kun åpenbare ikke-bilder - vær liberal for produktbilder
      const isNotImage = pathname.includes('.css') || 
                        pathname.includes('.js') || 
                        pathname.includes('.json') ||
                        pathname.includes('.xml') ||
                        pathname.includes('.txt') ||
                        url.includes('data:text') ||
                        url.includes('favicon') ||
                        pathname.endsWith('.html') ||
                        pathname.endsWith('.php') ||
                        // Ekskluder betalings- og leveringsikoner
                        pathname.includes('visa') ||
                        pathname.includes('mastercard') ||
                        pathname.includes('klarna') ||
                        pathname.includes('posten') ||
                        pathname.includes('helthjem') ||
                        pathname.includes('instabox') ||
                        pathname.includes('payment') ||
                        pathname.includes('shipping') ||
                        pathname.includes('delivery')

      // Accept if it has image extension, or keywords, or is from CDN
      // Prioriter produktbilder høyere
      const isLikelyImage = hasImageExtension || hasImageKeywords || isCdnImage || isProductImage
      
      // Liberal størrelsesvalidering - kun ekskluder helt små ikoner
      const hasGoodDimensions = !search.includes('w=1') && 
                               !search.includes('width=1') &&
                               !pathname.includes('1x1') &&
                               !pathname.includes('spacer')

      console.log(`Validating image URL: ${url}`)
      console.log(`  - Extension: ${hasImageExtension}`)
      console.log(`  - Keywords: ${hasImageKeywords}`)
      console.log(`  - Product image: ${isProductImage}`)
      console.log(`  - CDN: ${isCdnImage}`)
      console.log(`  - Not image: ${isNotImage}`)
      console.log(`  - Good dimensions: ${hasGoodDimensions}`)
      console.log(`  - Result: ${!isNotImage && isLikelyImage && hasGoodDimensions}`)

      return !isNotImage && isLikelyImage && hasGoodDimensions
    } catch (error) {
      console.error('Error validating image URL:', url, error)
      return false
    }
  }

  /**
   * Extract size parameter from URL query string
   */
  private extractSizeFromUrl(search: string, param: string): number {
    const regex = new RegExp(`[?&]${param}=(\\d+)`, 'i')
    const match = search.match(regex)
    return match ? parseInt(match[1], 10) : 0
  }
}

// Singleton instance
export const imageService = new ImageService()
