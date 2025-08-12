/**
 * Yarn URL Scraper Service
 * Automatisk henting av garninformasjon fra produktsider
 */

import { load } from 'cheerio'
import { imageService } from '@/lib/image/image-service'

export interface YarnProductData {
  name: string
  producer?: string
  composition?: string
  weight?: string
  yardage?: string
  needleSize?: string
  price?: number
  imageUrl?: string
  images?: Array<{
    url: string
    alt?: string
    isPrimary?: boolean
  }>
  colors?: Array<{
    name: string
    colorCode?: string
    available?: boolean
  }>
  description?: string
  careInstructions?: string
  source: {
    url: string
    siteName: string
    scrapedAt: Date
  }
}

interface Scraper {
  canHandle(url: string): boolean
  scrape(html: string, url: string): Promise<YarnProductData>
}

// Adlibris scraper
class AdlibrsScraper implements Scraper {
  canHandle(url: string): boolean {
    return url.includes('adlibris.com') || url.includes('adlibris.no')
  }

  async scrape(html: string, url: string): Promise<YarnProductData> {
    const $ = load(html)
    
    // Adlibris garn produktsider har typisk denne strukturen
    const name = $('h1').first().text().trim() ||
                 $('.product-title h1').text().trim() || 
                 $('h1[data-testid="product-title"]').text().trim()
    
    const price = this.extractPrice($)
    
    // Hent beskrivelse fra spesifikk produktinformasjon seksjon - mye mer fokusert
    const description = this.extractCleanDescription($)
    
    // Hent produsent fra varemerke eller produktnavn
    const producer = this.extractProducer($, name)
    
    // Hent tekniske detaljer fra produktbeskrivelse
    const technicalInfo = this.extractTechnicalInfo(description)
    
    // Hent farger hvis tilgjengelig
    const colors = this.extractColors($)
    
    // Hent alle produktbilder
    const images = imageService.extractImagesFromHtml($, url)
    
    // Legacy imageUrl for bakoverkompatibilitet
    const imageUrl = images.length > 0 ? images[0].url : undefined
    
    return {
      name,
      producer,
      price,
      description: description,
      imageUrl,
      images: images.length > 0 ? images : undefined,
      colors: colors.length > 0 ? colors : undefined,
      ...technicalInfo,
      source: {
        url,
        siteName: 'Adlibris',
        scrapedAt: new Date()
      }
    }
  }

  private extractPrice($: any): number | undefined {
    const priceSelectors = [
      '.price',
      '[data-testid="price"]',
      '.product-price',
      '.current-price'
    ]
    
    for (const selector of priceSelectors) {
      const priceText = $(selector).text()
      const match = priceText.match(/(\d+[\.,]?\d*)/)?.[1]
      if (match) {
        return parseFloat(match.replace(',', '.'))
      }
    }
    return undefined
  }

  private extractProducer($: any, name: string): string | undefined {
    // Forbedret produsent ekstraktering for Adlibris
    
    // Prøv å finne varemerke fra tekst som inneholder "Varemerke:"
    $('*').each((i, elem) => {
      const text = $(elem).text()
      const brandMatch = text.match(/varemerke[:\s]*([^\\n]+)/i)
      if (brandMatch) {
        const brand = brandMatch[1].trim().replace(/[:\-].*/, '').trim()
        if (brand && brand.length > 1 && brand !== 'Varemerke') {
          return brand
        }
      }
    })
    
    // Søk i strukturerte elementer
    const brandSelectors = [
      '[data-testid="brand"]',
      '.brand',
      '.manufacturer',
      '.producer'
    ]
    
    for (const selector of brandSelectors) {
      const brand = $(selector).text().trim()
      if (brand && brand.length > 1) {
        return brand
      }
    }
    
    // Fallback: utled fra produktnavn
    const nameUpper = name.toLowerCase()
    if (nameUpper.includes('drops')) return 'Drops Design'
    if (nameUpper.includes('hobbii')) return 'Hobbii'
    if (nameUpper.includes('sandnes')) return 'Sandnes Garn'
    if (nameUpper.includes('caron')) return 'Caron'
    if (nameUpper.includes('patons')) return 'Patons'
    
    return undefined
  }

  private extractColors($: any): Array<{name: string, colorCode?: string, available?: boolean}> {
    const colors: Array<{name: string, colorCode?: string, available?: boolean}> = []
    
    // Forbedret farge ekstraktering for Adlibris
    // Søk først etter den aktuelle fargen fra produktnavn eller siden
    const currentColorElement = $('[class*="farge"], [class*="color"], *:contains("Farge:")').first()
    if (currentColorElement.length > 0) {
      const currentColorText = currentColorElement.text()
      const currentColorMatch = currentColorText.match(/farge[:\s]*([A-Za-zøæåØÆÅ\s]+)/i)
      if (currentColorMatch) {
        const currentColor = currentColorMatch[1].trim()
        if (currentColor && currentColor.length > 1) {
          colors.push({
            name: currentColor,
            available: true
          })
        }
      }
    }
    
    // Søk etter andre fargevalg i linker som refererer til samme produkt
    $('a').each((i, elem) => {
      const href = $(elem).attr('href') || ''
      const linkText = $(elem).text().trim()
      
      // Kun produktlinker som ser ut til å være fargevarianter
      if (href.includes('/produkt/') && linkText.length > 5) {
        // Forsøk å ekstraktere fargenavn fra linktekst
        // Format kan være: "Hot Pink", "Melody Uni Colour Garn Alpakkamiks 50 g Grå 04 Drops"
        
        let colorName = ''
        let colorCode = ''
        
        // Søk etter mønster: "produktnavn fargenavn nummer Drops"
        const fullMatch = linkText.match(/\b([A-Za-zøæåØÆÅ\s]+?)\s+(\d{1,3})\s+Drops/i)
        if (fullMatch) {
          colorName = fullMatch[1].trim()
          colorCode = fullMatch[2]
        } else {
          // Enklere mønster: bare fargenavn i starten av link
          const simpleMatch = linkText.match(/^([A-Za-zøæåØÆÅ\s]{2,20})(?:\s|$)/)
          if (simpleMatch) {
            colorName = simpleMatch[1].trim()
          }
        }
        
        // Sjekk at fargenavnet er rimelig
        const validColorName = colorName && 
          colorName.length >= 2 && 
          colorName.length <= 30 &&
          !/gå til|produktside|drops|melody|garn/i.test(colorName)
        
        if (validColorName) {
          const isAvailable = !linkText.toLowerCase().includes('utsolgt') && 
                             !linkText.toLowerCase().includes('ikke tilgjengelig')
          
          colors.push({
            name: colorName,
            colorCode: colorCode || undefined,
            available: isAvailable
          })
        }
      }
    })
    
    // Fallback: Standard fargevalg selektorer
    if (colors.length === 0) {
      $('.color-option, .colour-option, [class*="color"]').each((i, elem) => {
        const colorName = $(elem).text().trim() || $(elem).attr('title') || $(elem).attr('alt')
        if (colorName && colorName.length > 1 && colorName.length < 30) {
          colors.push({
            name: colorName,
            available: !$(elem).hasClass('disabled') && !$(elem).hasClass('unavailable')
          })
        }
      })
    }
    
    // Fjern duplikater og filtrer ut ugyldige farger
    const uniqueColors = colors
      .filter(color => 
        color.name && 
        color.name.length >= 2 && 
        color.name.length <= 30 &&
        !/^(garn|yarn|drops|melody|uni|colour|color)$/i.test(color.name)
      )
      .filter((color, index, self) => 
        index === self.findIndex(c => c.name.toLowerCase() === color.name.toLowerCase())
      )
    
    return uniqueColors.slice(0, 25) // Max 25 farger
  }

  private extractCleanDescription($: any): string {
    // Fokusert ekstraktering av beskrivelse fra Adlibris produktsider
    let description = ''
    
    // Prøv spesifikke Adlibris selektorer først
    const descriptionSelectors = [
      // Spesifikk produktbeskrivelse seksjon
      '.product-details .description',
      '[data-testid="product-description"]',
      '.product-info .description',
      // Generelle beskrivelse selektorer
      '.description p',
      '.product-description p'
    ]
    
    for (const selector of descriptionSelectors) {
      const element = $(selector)
      if (element.length > 0) {
        description = element.text().trim()
        if (description.length > 50) break // Stopp når vi finner god beskrivelse
      }
    }
    
    // Fallback: Søk etter tekst som inneholder produktdetaljer
    if (!description || description.length < 50) {
      // Finn tekst blokker som ser ut som produktbeskrivelser
      $('p, div').each((i, elem) => {
        const text = $(elem).text().trim()
        
        // Sjekk om teksten inneholder garnrelaterte nøkkelord
        const hasYarnKeywords = /(?:alpakka|wool|ull|garn|yarn|drops|strikk|knit|sammensetning|composition|løpelengde|meter|gram)/i.test(text)
        const isGoodLength = text.length > 100 && text.length < 800
        const notNavigational = !/(?:gå til|handlekurv|ønskeliste|levering|kundeservice|tilbud)/i.test(text)
        
        if (hasYarnKeywords && isGoodLength && notNavigational && !description) {
          description = text
        }
      })
    }
    
    // Rens beskrivelsen
    if (description) {
      // Fjern navigasjonstekst og duplisert innhold
      description = description
        .replace(/gå til.*?produktside/gi, '')
        .replace(/legg i handlekurv.*?ønskeliste/gi, '')
        .replace(/velg blant \d+ stk\. farger/gi, '')
        .replace(/snart tilbake på lager/gi, '')
        .replace(/\s+/g, ' ') // Normaliser mellomrom
        .trim()
      
      // Begrens lengde til 600 tegn for å unngå for lang tekst
      if (description.length > 600) {
        description = description.substring(0, 600) + '...'
      }
    }
    
    return description || ''
  }

  private extractTechnicalInfo(description: string) {
    const info: Partial<YarnProductData> = {}
    
    // Løpelengde/meter
    const yardageMatch = description.match(/(\d+)\s*m(?![a-z])/i)
    if (yardageMatch) {
      info.yardage = `${yardageMatch[1]}m`
    }
    
    // Vekt
    const weightMatch = description.match(/(\d+)\s*g(?![a-z])/i)
    if (weightMatch) {
      info.weight = `${weightMatch[1]}g`
    }
    
    // Pinnestørrelse
    const needleMatch = description.match(/(?:pinne[r]?|needle)[:\s]*(\d+[\.,]?\d*)\s*mm/i) ||
                       description.match(/(\d+[\.,]?\d*)\s*mm\s*(?:pinne|needle)/i)
    if (needleMatch) {
      info.needleSize = `${needleMatch[1].replace(',', '.')}mm`
    }
    
    // Sammensetning - forbedret regex
    const compositionMatch = description.match(/sammensetning[:\s]*([^\\n]*%[^\\n]*)/i) ||
                            description.match(/(\d+%[\s\w,]+\d+%[\s\w]*)/i)
    if (compositionMatch) {
      info.composition = compositionMatch[1].trim().replace(/\\s+/g, ' ')
    }
    
    // Strikkefasthet (gauge)
    const gaugeMatch = description.match(/strikkefasthet[:\s]*([^\\n]*10cm[^\\n]*)/i) ||
                      description.match(/(\d+\s*m\s*x\s*\d+\s*v\s*=\s*10cm)/i)
    if (gaugeMatch) {
      info.gauge = gaugeMatch[1].trim()
    }
    
    // Vaskeråd
    const careMatch = description.match(/vaskeråd[:\s]*([^\\n]*)/i) ||
                     description.match(/(håndvask[^\\n]*)/i)
    if (careMatch) {
      info.careInstructions = careMatch[1].trim()
    }
    
    return info
  }


}

// Hobbii scraper
class HobbiiScraper implements Scraper {
  canHandle(url: string): boolean {
    return url.includes('hobbii.com') || url.includes('hobbii.no')
  }

  async scrape(html: string, url: string): Promise<YarnProductData> {
    const $ = load(html)
    
    const name = $('.product-name').text().trim() ||
                 $('h1.title').text().trim() ||
                 $('h1').first().text().trim()
    
    const producer = $('.brand-name').text().trim() ||
                    $('.manufacturer').text().trim()
    
    const price = this.extractPrice($)
    
    // Hobbii har ofte strukturerte produktdetaljer
    const specs = this.extractSpecs($)
    
    // Hent alle produktbilder
    const images = imageService.extractImagesFromHtml($, url)
    const imageUrl = images.length > 0 ? images[0].url : undefined
    
    return {
      name,
      producer,
      price,
      imageUrl,
      images: images.length > 0 ? images : undefined,
      ...specs,
      source: {
        url,
        siteName: 'Hobbii',
        scrapedAt: new Date()
      }
    }
  }

  private extractPrice($: any): number | undefined {
    const priceText = $('.price-current').text() || $('.price').text()
    const match = priceText.match(/(\d+[\.,]?\d*)/)?.[1]
    return match ? parseFloat(match.replace(',', '.')) : undefined
  }

  private extractSpecs($: any) {
    const specs: Partial<YarnProductData> = {}
    
    // Hobbii bruker ofte dl/dt struktur for specs
    $('dl dt').each((i, elem) => {
      const label = $(elem).text().toLowerCase()
      const value = $(elem).next('dd').text().trim()
      
      if (label.includes('weight') || label.includes('vekt')) {
        specs.weight = value
      } else if (label.includes('length') || label.includes('lengde')) {
        specs.yardage = value
      } else if (label.includes('needle') || label.includes('pinne')) {
        specs.needleSize = value
      } else if (label.includes('composition') || label.includes('sammensetning')) {
        specs.composition = value
      }
    })
    
    return specs
  }
}

// Generisk scraper for ukjente nettsider
class GenericScraper implements Scraper {
  canHandle(url: string): boolean {
    return true // Fallback for alle URLs
  }

  async scrape(html: string, url: string): Promise<YarnProductData> {
    const $ = load(html)
    
    // Prøv å finne standard elementer
    const name = $('h1').first().text().trim() ||
                 $('title').text().trim()
    
    const description = $('meta[name="description"]').attr('content') ||
                       $('.description').text().trim()
    
    // Prøv å finne pris
    const priceElements = $('[class*="price"], [id*="price"]')
    let price: number | undefined
    priceElements.each((i, elem) => {
      const text = $(elem).text()
      const match = text.match(/(\d+[\.,]?\d*)/)?.[1]
      if (match && !price) {
        price = parseFloat(match.replace(',', '.'))
      }
    })
    
    // Hent alle produktbilder
    const images = imageService.extractImagesFromHtml($, url)
    const imageUrl = images.length > 0 ? images[0].url : undefined

    return {
      name,
      description,
      price,
      imageUrl,
      images: images.length > 0 ? images : undefined,
      source: {
        url,
        siteName: new URL(url).hostname,
        scrapedAt: new Date()
      }
    }
  }
}

export class YarnUrlScraper {
  private scrapers: Scraper[] = [
    new AdlibrsScraper(),
    new HobbiiScraper(),
    new GenericScraper() // Må være sist (fallback)
  ]

  async scrapeUrl(url: string): Promise<YarnProductData> {
    try {
      // Valider URL først
      if (!url || typeof url !== 'string') {
        throw new Error('Ugyldig URL: URL mangler eller er ikke en tekststreng')
      }

      // Sjekk at URL har riktig format
      try {
        const urlObj = new URL(url)
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          throw new Error(`Ugyldig URL-protokoll: ${urlObj.protocol}. Kun HTTP og HTTPS er støttet.`)
        }
      } catch (urlError) {
        throw new Error(`Ugyldig URL-format: ${url}`)
      }

      console.log(`Scraping URL: ${url}`)

      // Hent HTML
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const html = await response.text()
      
      // Finn riktig scraper
      const scraper = this.scrapers.find(s => s.canHandle(url))
      if (!scraper) {
        throw new Error('Ingen scraper funnet for denne URL-en')
      }
      
      // Scrape data
      const data = await scraper.scrape(html, url)
      
      // Valider at vi fikk minst et navn
      if (!data.name || data.name.length < 2) {
        throw new Error('Kunne ikke finne produktnavn på siden')
      }
      
      return data
    } catch (error) {
      console.error('Scraping feilet:', error)
      throw new Error(`Kunne ikke hente produktinformasjon: ${error instanceof Error ? error.message : 'Ukjent feil'}`)
    }
  }

  // Test metode for å sjekke om URL kan scraes
  async testUrl(url: string): Promise<boolean> {
    try {
      await this.scrapeUrl(url)
      return true
    } catch {
      return false
    }
  }
}

// Singleton instans
export const yarnUrlScraper = new YarnUrlScraper()
