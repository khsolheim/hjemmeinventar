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

    // Common image selectors for product pages
    const imageSelectors = [
      // Primary product image
      '.product-image img',
      '[data-testid="product-image"]',
      '.main-image img',
      '.hero-image img',
      
      // Gallery images
      '.product-gallery img',
      '.image-gallery img',
      '.thumbnail img',
      '.product-images img',
      
      // Generic images in product area
      '.product img',
      '.item img',
      
      // Fallback: any img with product-related attributes
      'img[alt*="product"], img[alt*="garn"], img[alt*="yarn"]',
      'img[src*="product"], img[src*="garn"], img[src*="yarn"]'
    ]

    imageSelectors.forEach(selector => {
      $(selector).each((index: number, element: any) => {
        const $img = $(element)
        const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy')
        const alt = $img.attr('alt') || ''
        
        if (src) {
          const fullUrl = this.resolveImageUrl(src, baseUrl)
          
          // Skip duplicates and invalid URLs
          if (!seenUrls.has(fullUrl) && this.isValidImageUrl(fullUrl)) {
            seenUrls.add(fullUrl)
            
            // Determine if this is likely the primary image
            const isPrimary = selector.includes('product-image') || 
                             selector.includes('main-image') || 
                             selector.includes('hero-image') ||
                             index === 0

            images.push({
              url: fullUrl,
              alt: alt.trim(),
              isPrimary
            })
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

    return images.slice(0, 10) // Limit to max 10 images
  }

  /**
   * Resolve relative image URLs to absolute URLs
   */
  private resolveImageUrl(imageUrl: string, baseUrl: string): string {
    try {
      if (imageUrl.startsWith('http')) return imageUrl
      if (imageUrl.startsWith('//')) return `https:${imageUrl}`
      if (imageUrl.startsWith('/')) {
        const url = new URL(baseUrl)
        return `${url.protocol}//${url.host}${imageUrl}`
      }
      
      // Relative URL
      const url = new URL(baseUrl)
      return new URL(imageUrl, url.href).href
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
      const urlObj = new URL(url)
      const pathname = urlObj.pathname.toLowerCase()
      
      // Check file extension
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
      const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext))
      
      // Check if URL contains image-related keywords
      const hasImageKeywords = pathname.includes('image') || 
                              pathname.includes('photo') || 
                              pathname.includes('product') ||
                              pathname.includes('thumb')

      // Exclude obvious non-images
      const isNotImage = pathname.includes('.css') || 
                        pathname.includes('.js') || 
                        pathname.includes('.json') ||
                        url.includes('data:')

      return !isNotImage && (hasImageExtension || hasImageKeywords)
    } catch {
      return false
    }
  }
}

// Singleton instance
export const imageService = new ImageService()
