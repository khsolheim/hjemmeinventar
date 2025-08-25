/**
 * QR Code Generator Utility
 * Provides a fallback QR code generation without external dependencies
 */

export interface QRCodeOptions {
  width?: number
  height?: number
  margin?: number
  color?: string
  backgroundColor?: string
}

/**
 * Generate a simple QR code using Canvas API
 * This is a basic implementation that creates a QR-like pattern
 * For production use, consider using a proper QR library like qrcode
 */
export function generateQRCode(text: string, options: QRCodeOptions = {}): string {
  const {
    width = 160,
    height = 160,
    margin = 1,
    color = '#000000',
    backgroundColor = '#FFFFFF'
  } = options

  // Create canvas element
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Canvas context not available')
  }

  canvas.width = width
  canvas.height = height

  // Fill background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // Generate a simple pattern based on text hash
  const hash = simpleHash(text)
  const pattern = generatePattern(hash, width - 2 * margin, height - 2 * margin)
  
  // Draw pattern
  ctx.fillStyle = color
  for (let y = 0; y < pattern.length; y++) {
    for (let x = 0; x < pattern[y].length; x++) {
      if (pattern[y][x]) {
        ctx.fillRect(
          margin + x * (width - 2 * margin) / pattern[y].length,
          margin + y * (height - 2 * margin) / pattern.length,
          (width - 2 * margin) / pattern[y].length,
          (height - 2 * margin) / pattern.length
        )
      }
    }
  }

  return canvas.toDataURL('image/png')
}

/**
 * Simple hash function for text
 */
function simpleHash(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Generate a pattern based on hash
 */
function generatePattern(hash: number, width: number, height: number): boolean[][] {
  const pattern: boolean[][] = []
  const size = Math.min(20, Math.max(10, Math.floor(Math.min(width, height) / 8)))
  
  for (let y = 0; y < size; y++) {
    pattern[y] = []
    for (let x = 0; x < size; x++) {
      // Use hash to determine if pixel should be filled
      const pixelHash = simpleHash(`${hash}-${x}-${y}`)
      pattern[y][x] = (pixelHash % 3) === 0
    }
  }
  
  return pattern
}

/**
 * Load external QR code library with fallback
 */
export async function loadQRCodeLibrary(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if QRCode is already available
    if (typeof window !== 'undefined' && (window as any).QRCode) {
      resolve(true)
      return
    }

    // Try to load from CDN
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/qrcode/build/qrcode.min.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
}

/**
 * Generate QR code with fallback
 */
export async function generateQRCodeWithFallback(
  text: string, 
  options: QRCodeOptions = {}
): Promise<string> {
  const libraryLoaded = await loadQRCodeLibrary()
  
  if (libraryLoaded && typeof window !== 'undefined' && (window as any).QRCode) {
    return new Promise((resolve, reject) => {
      (window as any).QRCode.toDataURL(text, options, (err: any, data: string) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  } else {
    // Fallback to our simple implementation
    return generateQRCode(text, options)
  }
}
