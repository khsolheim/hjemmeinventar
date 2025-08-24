/**
 * Yarn URL Scraper Service
 * Automatisk henting av garninformasjon fra produktsider
 */

import { load } from 'cheerio'
import { imageService } from '@/lib/image/image-service'
import OpenAI from 'openai'

export interface YarnProductData {
  name: string
  producer?: string
  composition?: string
  weight?: string
  weightCategory?: string
  yardage?: string
  needleSize?: string
  gauge?: string
  price?: number
  originalPrice?: number // Hvis det er tilbud
  currency?: string
  sku?: string // Produktkode/artikkelkode
  availability?: string // Lagerstatus
  countryOfOrigin?: string // Produksjonsland
  certifications?: string[] // Sertifiseringer som OEKO-TEX
  rating?: number // Kundevurdering
  reviewCount?: number // Antall anmeldelser
  relatedPatterns?: string[] // Lenker til oppskrifter
  deliveryInfo?: string // Leveringsinformasjon
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
    sku?: string
  }>
  description?: string
  careInstructions?: string
  specifications?: Record<string, string> // Ekstra tekniske detaljer
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
    
    // Hent tekniske detaljer fra både beskrivelse og hele siden
    const technicalInfo = this.extractTechnicalInfo(description, $)
    
    // Hent utvidet produktinformasjon
    const extendedInfo = this.extractExtendedInfo($, url)
    
    // Hent farger hvis tilgjengelig
    const colors = this.extractColors($)
    
    // Hent alle produktbilder
    const images = imageService.extractImagesFromHtml($, url)
    
    // Legacy imageUrl for bakoverkompatibilitet
    const imageUrl = images.length > 0 && images[0] ? images[0].url : undefined
    
    return {
      name,
      producer,
      price,
      description: description,
      imageUrl,
      images: images.length > 0 ? images : undefined,
      colors: colors.length > 0 ? colors : undefined,
      ...technicalInfo,
      ...extendedInfo,
      source: {
        url,
        siteName: 'Adlibris',
        scrapedAt: new Date()
      }
    }
  }

  private extractPrice($: any): number | undefined {
    // Forbedret pris-ekstraktering spesielt for Adlibris
    
    // Først, sjekk om elementet har data-price attributt (høyeste prioritet)
    const priceAttribute = $('[data-price]').attr('data-price')
    if (priceAttribute) {
      const price = parseFloat(priceAttribute)
      if (price >= 1 && price <= 1000) { // Justert tilbake til 1 siden 5,6 kr er faktisk produktpris
        console.log(`Found price from data-price attribute: ${price}`)
        return price
      }
    }
    
    // Søk etter spesifikke Adlibris pris-selektorer
    const adlibrisSelectors = [
      '.text-content-sale', // Den faktiske pris-klassen for Adlibris
      '.price-display',
      '.current-price',
      '.price-current',
      '.price-final',
      '.sale-price',
      '.price-value',
      '.price',
      '[class*="price"]:not([class*="original"]):not([class*="was"]):not([class*="shipping"]):not([class*="freight"])',
      '[class*="sale"]:not([class*="original"]):not([class*="was"])'
    ]
    
    const validPrices: number[] = []
    
    for (const selector of adlibrisSelectors) {
      const elements = $(selector)
      elements.each((i: any, elem: any) => {
        const priceText = $(elem).text().trim()
        const parentText = $(elem).parent().text().trim().toLowerCase()
        
        console.log(`Checking selector ${selector}: "${priceText}"`)
        
        // Skip hvis dette er frakt/levering
        const shippingTerms = [
          'frakt', 'levering', 'shipping', 'delivery', 
          'fri frakt', 'gratis frakt', 'free shipping',
          'over 299', 'under 299', 'fra 299', 'til 299',
          'minimum', 'terskel', 'threshold'
        ]
        
        const isShippingRelated = shippingTerms.some(term => 
          parentText.includes(term) || priceText.toLowerCase().includes(term)
        )
        
        if (isShippingRelated) {
          console.log(`Skipping shipping-related price: ${priceText}`)
          console.log(`Parent context: "${parentText}"`)
          return
        }
        
        // Søk etter norske kroner og spesielt Adlibris-format
        const pricePatterns = [
          /(\d+[\.,]?\d*)\s*kr(?![a-z])/i, // Standard "5,6 kr" format
          /(\d+[\.,]?\d*)\s*,-/i, // Adlibris "5,6,-" format
          /(\d+[\.,]?\d*)\s*$/i // Bare tall "5.6" hvis det er i price-element
        ]
        
        for (const pattern of pricePatterns) {
          const match = priceText.match(pattern)
          if (match) {
            const price = parseFloat(match[1].replace(',', '.'))
            if (price >= 1 && price <= 1000) {
              console.log(`Found valid price from selector ${selector}: ${price} (pattern: ${pattern})`)
              validPrices.push(price)
              break // Stop ved første match
            }
          }
        }
      })
    }
    
    // Returner høyeste pris (produktpris er vanligvis høyere enn frakt)
    if (validPrices.length > 0) {
      const highestPrice = Math.max(...validPrices)
      console.log(`Selected highest price: ${highestPrice} from ${validPrices}`)
      return highestPrice
    }
    
    // Søk i strukturert JSON-LD data
    let foundJsonPrice: number | null = null
    $('script[type="application/ld+json"]').each((i: any, script: any) => {
      try {
        const jsonData = JSON.parse($(script).html() || '{}')
        if (jsonData.offers && jsonData.offers.price) {
          const price = parseFloat(jsonData.offers.price)
          if (price >= 1 && price <= 1000) { // Justert tilbake til 1
            console.log(`Found price from JSON-LD: ${price}`)
            foundJsonPrice = price
            return false // Stop iterating
          }
        }
      } catch (e) {
        // Ignorer JSON parsing feil
      }
      return true // Continue iterating
    })
    
    if (foundJsonPrice) {
      return foundJsonPrice
    }
    
    // Søk etter spesifikke norske pris-mønstre i hele dokumentet
    const allText = $('body').text()
    console.log('Searching in full text for price patterns...')
    
    // Prøv flere norske pris-mønstre - forbedret for Adlibris
    const pricePatterns = [
      /(?:pris|koster|kr\.?)[:\s]*(\d+[\.,]?\d*)\s*kr/gi,
      /(\d+[\.,]?\d*)\s*kr(?!\w)/gi,
      /(\d+[\.,]?\d*)\s*kroner/gi,
      /(\d+[\.,]?\d*)\s*NOK/gi,
      // Nye mønstre spesifikt for Adlibris
      /(\d+[\.,]?\d*)\s*kr\s*(?:inkl\.?\s*mva)?/gi,
      /(\d+[\.,]?\d*)\s*kr\s*(?:eks\.?\s*mva)?/gi,
      /(\d+[\.,]?\d*)\s*kr\s*(?:fratrekk)?/gi,
      /(\d+[\.,]?\d*)\s*kr\s*(?:rabatt)?/gi,
      /(\d+[\.,]?\d*)\s*kr\s*(?:pris)?/gi,
      // Spesifikt Adlibris ",-" format
      /(\d+[\.,]?\d*)\s*,-/gi
    ]
    
    const foundPrices: number[] = []
    
    for (const pattern of pricePatterns) {
      const matches = allText.match(pattern)
      if (matches) {
        matches.forEach((match: any) => {
          const priceMatch = match.match(/(\d+[\.,]?\d*)/)
          if (priceMatch) {
            const price = parseFloat(priceMatch[1].replace(',', '.'))
            
            // Skip hvis dette ser ut som frakt (kontekst-sjekk)
            const context = allText.substring(
              Math.max(0, allText.indexOf(match) - 50), 
              Math.min(allText.length, allText.indexOf(match) + match.length + 50)
            ).toLowerCase()
            
            // Utvidet liste over frakt/leveringsrelaterte termer
            const shippingTerms = [
              'frakt', 'levering', 'shipping', 'delivery', 
              'fri frakt', 'gratis frakt', 'free shipping',
              'over 299', 'under 299', 'fra 299', 'til 299',
              'minimum', 'terskel', 'threshold'
            ]
            
            const isShippingRelated = shippingTerms.some(term => context.includes(term))
            
            if (isShippingRelated) {
              console.log(`Skipping shipping-related price pattern "${match}": ${price}`)
              console.log(`Context: "${context}"`)
              return
            }
            
            if (price >= 1 && price <= 1000) { // Justert tilbake til 1
              foundPrices.push(price)
              console.log(`Found price pattern "${match}": ${price}`)
            }
          }
        })
      }
    }
    
    if (foundPrices.length > 0) {
      // Gruppe priser etter hvor ofte de forekommer
      const priceFrequency = foundPrices.reduce((acc, price) => {
        acc[price] = (acc[price] || 0) + 1
        return acc
      }, {} as Record<number, number>)
      
      // Prioriter priser som forekommer flere ganger (mer sannsynlig produktpris)
      // eller velg høyeste pris hvis alle forekommer like ofte
      const sortedPrices = Object.entries(priceFrequency)
        .sort(([priceA, freqA], [priceB, freqB]) => {
          // Først sorter etter frekvens (høyest først)
          if (freqB !== freqA) return freqB - freqA
          // Så etter pris (høyest først) hvis frekvens er lik
          return parseFloat(priceB) - parseFloat(priceA)
        })
      
      const selectedPrice = parseFloat(sortedPrices[0]?.[0] || '0')
      console.log(`Selected price: ${selectedPrice} (frequency: ${sortedPrices[0]?.[1]}) from prices:`, foundPrices)
      return selectedPrice
    }
    
    console.log('No price found in text patterns')
    return undefined
  }

  private extractProducer($: any, name: string): string | undefined {
    // Forbedret produsent ekstraktering for Adlibris
    console.log('Extracting producer from:', name)
    
    // Først, sjekk JSON-LD strukturert data
    $('script[type="application/ld+json"]').each((i: any, script: any) => {
      try {
        const jsonData = JSON.parse($(script).html() || '{}')
        if (jsonData.brand) {
          const brand = typeof jsonData.brand === 'string' ? jsonData.brand : jsonData.brand.name
          if (brand && brand.length > 1 && brand.length < 50) {
            console.log(`Found brand from JSON-LD: ${brand}`)
            return brand
          }
        }
      } catch (e) {
        // Ignorer JSON parsing feil
      }
    })
    
    // Søk etter spesifikke Adlibris varemerke-mønstre
    const brandPatterns = [
      /varemerke[:\s]*([A-Za-zøæåØÆÅ\s&\-]+?)(?:[,.]|$|\n|Farge|Hot|Pink)/i,
      /brand[:\s]*([A-Za-z\s&\-]+?)(?:[,.]|$|\n)/i,
      /av\s+([A-Za-zøæåØÆÅ\s&\-]+?)(?:\s|$)/i, // "av Drops Design"
      /fra\s+([A-Za-zøæåØÆÅ\s&\-]+?)(?:\s|$)/i // "fra Drops Design"
    ]
    
    const allText = $('body').text()
    console.log('Searching for brand patterns in text...')
    
    for (const pattern of brandPatterns) {
      const match = allText.match(pattern)
      if (match && match[1]) {
        let brand = match[1].trim()
        
        // Rens varemerke-navnet
        brand = brand
          .replace(/^(av|fra|by)\s+/i, '')
          .replace(/\s*(design|yarn|garn)s?$/i, ' Design')
          .trim()
        
        // Valider varemerke
        if (brand && 
            brand.length > 1 && 
            brand.length < 50 && 
            brand !== 'Varemerke' &&
            !/^(hot|pink|rosa|blå|rød|grønn|gul|sort|hvit|beige)$/i.test(brand)) {
          console.log(`Found brand from pattern: ${brand}`)
          return brand
        }
      }
    }
    
    // Søk i spesifikke DOM-elementer
    const brandSelectors = [
      '[data-testid="brand"]',
      '.brand',
      '.manufacturer',
      '.producer',
      '.brand-name',
      'meta[property="product:brand"]',
      'meta[name="brand"]'
    ]
    
    for (const selector of brandSelectors) {
      const element = $(selector)
      if (element.length > 0) {
        let brand = element.attr('content') || element.text().trim()
        
        // Fjern "Varemerke:" prefix hvis det finnes
        brand = brand.replace(/^varemerke[:\s]*/i, '').trim()
        
        if (brand && brand.length > 1 && brand.length < 50) {
          console.log(`Found brand from selector ${selector}: ${brand}`)
          return brand
        }
      }
    }
    
    // Avansert søk - se etter tekst som ser ut som varemerke i produktnavn
    const productNameWords = name.split(/\s+/)
    const knownBrands = [
      'Drops', 'Hobbii', 'Sandnes', 'Caron', 'Patons', 'Garnstudio', 
      'Phildar', 'Rowan', 'Katia', 'Schachenmayr', 'Debbie Bliss',
      'King Cole', 'Stylecraft', 'Red Heart', 'Bernat', 'Lion Brand'
    ]
    
    for (const word of productNameWords) {
      for (const knownBrand of knownBrands) {
        if (word.toLowerCase().includes(knownBrand.toLowerCase())) {
          const brand = knownBrand === 'Drops' ? 'Drops Design' : 
                      knownBrand === 'Sandnes' ? 'Sandnes Garn' : knownBrand
          console.log(`Found brand from product name: ${brand}`)
          return brand
        }
      }
    }
    
    // Fallback: utled fra produktnavn med flere varianter
    const nameLower = name.toLowerCase()
    if (nameLower.includes('drops')) return 'Drops Design'
    if (nameLower.includes('hobbii')) return 'Hobbii'
    if (nameLower.includes('sandnes')) return 'Sandnes Garn'
    if (nameLower.includes('caron')) return 'Caron'
    if (nameLower.includes('patons')) return 'Patons'
    if (nameLower.includes('garnstudio')) return 'Garnstudio'
    if (nameLower.includes('phildar')) return 'Phildar'
    if (nameLower.includes('rowan')) return 'Rowan'
    if (nameLower.includes('katia')) return 'Katia'
    if (nameLower.includes('melody')) return 'Drops Design' // Melody er en Drops serie
    
    console.log('No producer found')
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
    $('a').each((i: any, elem: any) => {
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
          
          // Forsøk å finne SKU/produktkode for denne fargen
          let colorSku: string | undefined
          const skuMatch = href.match(/\/([A-Z0-9\-]+)$/) || href.match(/product\/([A-Z0-9\-]+)/)
          if (skuMatch && skuMatch[1].length >= 5) {
            colorSku = skuMatch[1]
          }
          
          colors.push({
            name: colorName,
            colorCode: colorCode || undefined,
            available: isAvailable,
            // sku: colorSku // Removed - not in type definition
          })
        }
      }
    })
    
    // Fallback: Standard fargevalg selektorer
    if (colors.length === 0) {
      $('.color-option, .colour-option, [class*="color"]').each((i: any, elem: any) => {
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
      $('p, div').each((i: any, elem: any) => {
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

  private extractTechnicalInfo(description: string, $?: any) {
    const info: Partial<YarnProductData> = {}
    
    // Søk både i beskrivelse og hele siden hvis $ er tilgjengelig
    const textSources = [description]
    if ($) {
      // Legg til tekst fra hele produktsiden
      const pageText = $('body').text()
      textSources.push(pageText)
      
      // Legg til spesifikke produktdetalj-seksjoner
      const productDetails = $('.product-details, .specifications, .tech-specs, .product-info').text()
      if (productDetails) textSources.push(productDetails)
    }
    
    console.log('Searching in text sources for technical info...')
    console.log('Description length:', description.length)
    if ($) {
      console.log('Page text length:', $('body').text().length)
    }
    
    // Løpelengde/meter - forbedret søk for Adlibris
    const yardagePatterns = [
      /løpelengde[\/\s]*nøste[:\s]*.*?(\d+)\s*m(?![a-z])/i,
      /(\d+)\s*m(?![a-z]).*?(?:nøste|skein)/i,
      /ca\.?\s*(\d+)\s*gr?\s*=\s*(\d+)\s*m/i,
      /(\d+)\s*meter/i,
      /(\d+)\s*m\s*(?:per|\/)/i,
      // Nye mønstre spesifikt for Adlibris
      /(\d+)\s*m\s*(?:løpelengde|lengde)/i,
      /løpelengde[:\s]*(\d+)\s*m/i,
      /(\d+)\s*m\s*(?:garn|nøste)/i,
      /(\d+)\s*m\s*(?:i\s*nøste|per\s*nøste)/i,
      // Spesifikt mønster for "ca 50 gr = 140 m"
      /ca\.?\s*(\d+)\s*gr?\s*=\s*(\d+)\s*m/i,
      /(\d+)\s*gr?\s*=\s*(\d+)\s*m/i
    ]
    
    for (const textSource of textSources) {
      if (info.yardage) break
      for (const pattern of yardagePatterns) {
        const match = textSource.match(pattern)
        if (match) {
          const meters = match[2] || match[1] // Ta andre gruppe hvis tilgjengelig
          info.yardage = `${meters}m`
          console.log(`Found yardage: ${info.yardage} using pattern: ${pattern}`)
          break
        }
      }
    }
    
    // Vekt - søk i alle tekstkilder
    const weightPatterns = [
      /(\d+)\s*g(?![a-z]).*?(?:nøste|skein)/i,
      /ca\.?\s*(\d+)\s*gr/i,
      /(\d+)\s*gram/i,
      /(\d+)\s*g\s*(?:per|\/)/i
    ]
    
    for (const textSource of textSources) {
      if (info.weight) break
      for (const pattern of weightPatterns) {
        const match = textSource.match(pattern)
        if (match) {
          info.weight = `${match[1]}g`
          console.log(`Found weight: ${info.weight} using pattern: ${pattern}`)
          break
        }
      }
    }
    
    // Pinnestørrelse - søk i alle tekstkilder
    const needlePatterns = [
      /anbefalte?\s*pinner?[:\s]*(\d+[\.,]?\d*)\s*mm/i,
      /pinne[r]?[:\s]*(\d+[\.,]?\d*)\s*mm/i,
      /(\d+[\.,]?\d*)\s*mm\s*(?:pinne|needle)/i,
      /needle\s*size[:\s]*(\d+[\.,]?\d*)\s*mm/i,
      /(\d+[\.,]?\d*)\s*mm(?!\s*x)/i, // Ikke del av dimensjoner
      // Spesifikt mønster for "Anbefalte pinner: 7 mm"
      /anbefalte?\s*pinner?[:\s]*(\d+[\.,]?\d*)\s*mm/i,
      /(\d+[\.,]?\d*)\s*mm\s*(?:anbefalte?\s*pinner?)/i
    ]
    
    for (const textSource of textSources) {
      if (info.needleSize) break
      for (const pattern of needlePatterns) {
        const match = textSource.match(pattern)
        if (match) {
          info.needleSize = `${(match[1] || '').replace(',', '.')}mm`
          console.log(`Found needle size: ${info.needleSize} using pattern: ${pattern}`)
          break
        }
      }
    }
    
    // Sammensetning - søk i alle tekstkilder
    const compositionPatterns = [
      /sammensetning[:\s]*([^\n]*%[^\n]*)/i,
      /(\d+%[^\n]*\d+%[^\n]*)/i,
      /material[:\s]*([^\n]*%[^\n]*)/i,
      /fiber[:\s]*([^\n]*%[^\n]*)/i,
      /(\d+%\s*[A-Za-zøæåØÆÅ]+(?:[,\s]+\d+%\s*[A-Za-zøæåØÆÅ]+)*)/i,
      // Spesifikt mønster for "71% Alpakka, 25% Ull, 4% Polyamid"
      /(\d+%\s*[A-Za-zøæåØÆÅ]+(?:[,\s]+\d+%\s*[A-Za-zøæåØÆÅ]+)*)/i,
      /sammensetning[:\s]*([^\n]*)/i
    ]
    
    for (const textSource of textSources) {
      if (info.composition) break
      for (const pattern of compositionPatterns) {
        const match = textSource.match(pattern)
        if (match) {
          info.composition = (match[1] || '').trim()
            .replace(/\s+/g, ' ')
            .replace(/,\s*/g, ', ')
            .replace(/\n.*/, '') // Fjern alt etter første linjeskift
          console.log(`Found composition: ${info.composition} using pattern: ${pattern}`)
          break
        }
      }
    }
    
    // Strikkefasthet (gauge) - meget spesifikk søk
    const gaugePatterns = [
      // Kun meget spesifikke mønstre for strikkefasthet
      /(\d+\s*m\s*x\s*\d+\s*v\s*=\s*10cm²?)/i,
      /(\d+\s*m\s*x\s*\d+\s*r\s*=\s*10cm²?)/i,
      /(\d+\s*masker?\s*x\s*\d+\s*rader?\s*=\s*10cm²?)/i,
      /(\d+\s*(?:st|m)\s*x\s*\d+\s*(?:r|v)\s*=\s*10\s*x?\s*10\s*cm)/i,
      /(\d+\s*x\s*\d+\s*=\s*10cm²?)/i,
      // Kun strikkefasthet med spesifikk kontekst
      /strikkefasthet[:\s]*(\d+\s*m\s*x\s*\d+\s*v[^\\n]*10cm[^\\n]*)/i
    ]
    
    for (const textSource of textSources) {
      if (info.gauge) break
      for (const pattern of gaugePatterns) {
        const match = textSource.match(pattern)
        if (match) {
          let gauge = (match[1] || match[0]).trim()
          
          // Rens bort alt som ikke er relevant for strikkefasthet
          gauge = gauge
            .replace(/strikkefasthet[:\s]*/i, '') // Fjern "strikkefasthet:"
            .replace(/\s+/g, ' ') // Normalisér mellomrom
            .replace(/[^\d\s=mxvr²cm]/g, '') // Behold kun relevante tegn
            .trim()
          
          // Valider at det ser ut som en riktig strikkefasthet
          if (/\d+\s*[mx]\s*\d+.*10cm/i.test(gauge)) {
            info.gauge = gauge
            console.log(`Found gauge: ${info.gauge} using pattern: ${pattern}`)
            break
          }
        }
      }
    }
    
    // Vaskeråd - meget spesifikke mønstre for korte vaskeråd
    const carePatterns = [
      // Spesifikt mønster for "Håndvask maks 30°C. Plantørking."
      /(håndvask\s*maks\s*\d+°C\.[^\.]*plantørking[^\.]*)/i,
      /(håndvask[^\.]*\d+°C[^\.]*\.?\s*plantørking[^\.]*)/i,
      /vaskeråd[:\s]*(håndvask[^\.]*\d+°[^\.]*\.?\s*plantørking[^\.]*)/i,
      /(maskinvask\s*\d+°[^\.]*)/i,
      // Kortere mønstre som stopper tidlig
      /(håndvask\s*maks\s*\d+°C)/i,
      /(maskinvask\s*\d+°C)/i,
      /(plantørking)/i
    ]
    
    for (const textSource of textSources) {
      if (info.careInstructions) break
      for (const pattern of carePatterns) {
        const match = textSource.match(pattern)
        if (match) {
          let care = (match[1] || match[0]).trim()
          
          // Stopp ved første punktum hvis det ikke er del av temperatur
          if (care.includes('.')) {
            const sentences = care.split('.')
            care = sentences[0] || ''
            // Legg til andre setning kun hvis det er relatert til tørking
            if (sentences[1] && sentences[1].trim().match(/^\s*(plantørking|tørking|ikke|aldri)/i)) {
              care += '. ' + sentences[1].trim()
            }
            care += '.'
          }
          
          // Rens bort alt som ikke hører til vaskeråd
          care = care
            .replace(/produsert\s+i.*/i, '')
            .replace(/produktinformasjon.*/i, '')
            .replace(/beskrivelse.*/i, '')
            .replace(/drops\s+melody.*/i, '')
            .replace(/\s+/g, ' ')
            .trim()
          
          // Valider at det faktisk er vaskeråd og ikke for langt
          if (care.match(/(vask|tørk|°c|plantørking|maskin|hånd)/i) && care.length <= 100) {
            info.careInstructions = care
          }
          console.log(`Found care instructions: ${info.careInstructions} using pattern: ${pattern}`)
          break
        }
      }
    }
    
    // Garntykkelse/kategori - søk i alle tekstkilder
    const weightCategoryPatterns = [
      /gauge\s*vekt[:\s]*([^\n]*)/i,
      /(bulky|aran|dk|light|lace|worsted|fingering)/i,
      /garngruppe\s*([A-F])/i,
      // Spesifikt mønster for "Bulky/Aran"
      /(bulky\/aran|aran\/bulky)/i,
      /gauge\s*vekt[:\s]*([^\n]*)/i
    ]
    
    for (const textSource of textSources) {
      if (info.weightCategory) break
      for (const pattern of weightCategoryPatterns) {
        const match = textSource.match(pattern)
        if (match) {
          info.weightCategory = (match[1] || '').trim()
          console.log(`Found weight category: ${info.weightCategory} using pattern: ${pattern}`)
          break
        }
      }
    }
    
    return info
  }

  private extractExtendedInfo($: any, url: string): Partial<YarnProductData> {
    const info: Partial<YarnProductData> = {}
    
    // Hent produktkode/SKU
    const skuPatterns = [
      /(?:artikkel|produkt|item|sku)[:\s#]*([A-Z0-9\-]+)/i,
      /(?:art\.?\s*nr\.?|artikel\s*nr\.?)[:\s]*([A-Z0-9\-]+)/i,
      /(?:product\s*code|item\s*code)[:\s]*([A-Z0-9\-]+)/i
    ]
    
    const pageText = $('body').text()
    for (const pattern of skuPatterns) {
      const match = pageText.match(pattern)
      if (match && match[1].length >= 3 && match[1].length <= 20) {
        info.sku = match[1].trim()
        break
      }
    }
    
    // Hent lagerstatus/tilgjengelighet
    const availabilityPatterns = [
      /(ikke\s+tilgjengelig|utsolgt|out\s+of\s+stock)/i,
      /(på\s+lager|in\s+stock|tilgjengelig)/i,
      /(snart\s+tilbake|back\s+soon|kommer\s+snart)/i,
      /(bestillingsvare|special\s+order)/i
    ]
    
    for (const pattern of availabilityPatterns) {
      const match = pageText.match(pattern)
      if (match) {
        info.availability = match[1].trim()
        break
      }
    }
    
    // Hent produksjonsland
    const countryPatterns = [
      /produsert\s+i\s+([A-Za-zøæåØÆÅ\s]+)/i,
      /made\s+in\s+([A-Za-z\s]+)/i,
      /origin[:\s]*([A-Za-z\s]+)/i,
      /fra\s+([A-Za-zøæåØÆÅ\s]+)(?:\s*$|\s*[,.])/i
    ]
    
    for (const pattern of countryPatterns) {
      const match = pageText.match(pattern)
      if (match && match[1].length < 30) {
        info.countryOfOrigin = match[1].trim()
        break
      }
    }
    
    // Hent sertifiseringer
    const certificationPatterns = [
      /(OEKO[-\s]TEX[^\s,]*)/gi,
      /(GOTS[^\s,]*)/gi,
      /(Økologisk|Organic)/gi,
      /(Fair\s+Trade)/gi,
      /(Mulesing\s+free)/gi
    ]
    
    const certifications: string[] = []
    for (const pattern of certificationPatterns) {
      const matches = pageText.match(pattern)
      if (matches) {
        certifications.push(...matches.map((m: any) => m.trim()))
      }
    }
    
    if (certifications.length > 0) {
      info.certifications = [...new Set(certifications)] // Fjern duplikater
    }
    
    // Hent originalspris (ved tilbud)
    const originalPriceMatch = pageText.match(/(?:før|was|original)[:\s]*(\d+[\.,]?\d*)\s*kr/i)
    if (originalPriceMatch) {
      info.originalPrice = parseFloat(originalPriceMatch[1].replace(',', '.'))
    }
    
    // Hent valuta
    if (pageText.includes('kr') || pageText.includes('NOK')) {
      info.currency = 'NOK'
    }
    
    // Hent kundevurdering og antall anmeldelser
    const ratingMatch = pageText.match(/(\d+[\.,]?\d*)\s*av\s*5\s*stjerner?/i) ||
                       pageText.match(/(\d+[\.,]?\d*)\s*\/\s*5/i)
    if (ratingMatch) {
      info.rating = parseFloat(ratingMatch[1].replace(',', '.'))
    }
    
    const reviewMatch = pageText.match(/(\d+)\s*(?:anmeldelser?|reviews?|vurderinger?)/i)
    if (reviewMatch) {
      info.reviewCount = parseInt(reviewMatch[1])
    }
    
    // Hent leveringsinformasjon
    const deliveryPatterns = [
      /(levering[^.]*\d+[^.]*dager?[^.]*)/i,
      /(fri\s+frakt[^.]*)/i,
      /(delivery[^.]*\d+[^.]*days?[^.]*)/i
    ]
    
    for (const pattern of deliveryPatterns) {
      const match = pageText.match(pattern)
      if (match) {
        info.deliveryInfo = match[1].trim().substring(0, 100)
        break
      }
    }
    
    // Hent lenker til oppskrifter/mønstre
    const patternLinks: string[] = []
    $('a[href*="oppskrift"], a[href*="pattern"], a[href*="drops"], a:contains("oppskrift"), a:contains("pattern")').each((i: any, elem: any) => {
      const href = $(elem).attr('href')
      const text = $(elem).text().toLowerCase()
      
      if (href && (text.includes('oppskrift') || text.includes('pattern'))) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, url).toString()
        patternLinks.push(fullUrl)
      }
    })
    
    if (patternLinks.length > 0) {
      info.relatedPatterns = [...new Set(patternLinks)].slice(0, 10) // Max 10 lenker
    }
    
    // Hent ekstra spesifikasjoner
    const specifications: Record<string, string> = {}
    
    // Søk etter strukturerte produktdetaljer
    $('.product-details dl dt, .specifications dt, .tech-specs dt').each((i: any, elem: any) => {
      const key = $(elem).text().trim().replace(':', '')
      const value = $(elem).next('dd').text().trim()
      
      if (key && value && key.length < 50 && value.length < 200) {
        specifications[key] = value
      }
    })
    
    // Søk etter andre strukturerte data
    $('*:contains(":")').each((i: any, elem: any) => {
      const text = $(elem).text().trim()
      const colonMatch = text.match(/^([^:]+):\s*([^:]+)$/)
      
      if (colonMatch && colonMatch[1].length < 30 && colonMatch[2].length < 100) {
        const key = colonMatch[1].trim()
        const value = colonMatch[2].trim()
        
        // Unngå å ta med navigasjon og generisk tekst
        const isUseful = /(?:størrelse|size|lengde|length|tykkelse|thickness|tekstur|texture|finish|behandling|treatment)/i.test(key)
        
        if (isUseful && !specifications[key]) {
          specifications[key] = value
        }
      }
    })
    
    if (Object.keys(specifications).length > 0) {
      info.specifications = specifications
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
    const imageUrl = images.length > 0 && images[0] ? images[0].url : undefined
    
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
    $('dl dt').each((i: any, elem: any) => {
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
    priceElements.each((i: any, elem: any) => {
      const text = $(elem).text()
      const match = text.match(/(\d+[\.,]?\d*)/)?.[1]
      if (match && !price) {
        price = parseFloat(match.replace(',', '.'))
      }
    })
    
    // Hent alle produktbilder
    const images = imageService.extractImagesFromHtml($, url)
    const imageUrl = images.length > 0 && images[0] ? images[0].url : undefined

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
  private openai: OpenAI | null = null

  constructor() {
    // Initialiser OpenAI hvis API-nøkkel finnes
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    }
  }

  private scrapers: Scraper[] = [
    new AdlibrsScraper(),
    new HobbiiScraper(),
    new GenericScraper() // Må være sist (fallback)
  ]

  /**
   * Bruk AI til å velge beste produktbilde fra tilgjengelige bilder
   */
  private async selectBestImageWithAI(images: Array<{url: string, alt?: string}>, productName: string): Promise<number | null> {
    if (!this.openai || images.length === 0) {
      return null
    }

    try {
      const imageDescriptions = images.map((img, index) => 
        `${index}: URL: ${img.url}, Alt: "${img.alt || 'Ingen alt-tekst'}"`
      ).join('\n')

      const prompt = `
Du er en ekspert på produktbilder og skal velge det beste hovedbildet for et garnprodukt.

Produktnavn: ${productName}

Tilgjengelige bilder:
${imageDescriptions}

Analyser URL-ene og alt-tekstene for å identifisere hvilket bilde som mest sannsynlig er det beste produktbildet. Se etter:
- Bilder som har produktnavnet i URL-en
- Hovedfarger vs andre farger (prioriter hovedproduktet)
- "primary", "main", "hero" indikatorer
- Unngå thumbnails eller små bilder
- Prioriter bilder som matcher produktnavnet

Returner BARE tallet (index) for det beste bildet, eller null hvis ingen er gode produktbilder.
Eksempel: 0 (for første bilde), 2 (for tredje bilde), eller null

Svar kun med tallet eller null:
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 10
      })

      const content = response.choices[0]?.message?.content?.trim()
      if (!content) {
        return null
      }

      if (content.toLowerCase() === 'null') {
        return null
      }

      const selectedIndex = parseInt(content)
      if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= images.length) {
        console.log('AI returnerte ugyldig bildeindex:', content)
        return null
      }

      console.log(`AI valgte bilde ${selectedIndex}: ${images[selectedIndex]?.url}`)
      return selectedIndex

    } catch (error) {
      console.error('Feil ved AI bildevalg:', error)
      return null
    }
  }

  /**
   * Ekstraktér garninformasjon ved hjelp av AI
   * Fallback hvis tradisjonelle metoder feiler eller gir dårlige resultater
   */
  private async extractWithAI(html: string, url: string): Promise<Partial<YarnProductData>> {
    if (!this.openai) {
      console.log('OpenAI ikke tilgjengelig, hopper over AI-ekstraksjon')
      return {}
    }

    try {
      // Rens HTML for kun å beholde relevant innhold
      const $ = load(html)
      
      // Fjern script, style, header, footer, nav, ads
      $('script, style, header, footer, nav, .advertisement, .ad, .cookie-banner').remove()
      
      // Ta kun hovedinnholdet
      const mainContent = $('main, .product, .content, body').first().text()
      
      // Begrens tekst til 4000 tegn for å unngå for store requests
      const cleanText = mainContent.substring(0, 4000)

      const prompt = `
Du er en ekspert på garninformasjon. Analyser følgende produktside og trekk ut kun de spesifikke garn-detaljene som er nevnt.

URL: ${url}

Produktsideinnhold:
${cleanText}

Returner BARE informasjon som er eksplisitt nevnt på siden. Ikke gjet eller lag data.

Trekk ut følgende informasjon hvis tilgjengelig (returner null hvis ikke funnet):
- name: Produktnavn
- price: Pris (kun tall, f.eks. 5.6 for "5,6 kr")
- producer: Produsent/merke
- composition: Sammensetning (f.eks. "71% Alpakka, 25% Ull, 4% Polyamid")
- yardage: Løpelengde i meter (kun tall)
- weight: Vekt i gram (kun tall)
- needleSize: Anbefalte pinner i mm (kun tall)
- gauge: Strikkefasthet (f.eks. "14 m x 19 v = 10cm²")
- careInstructions: Vaskeråd (f.eks. "Håndvask maks 30°C. Plantørking.")
- weightCategory: Garntykkelse (f.eks. "Bulky/Aran")

Returner svaret som gyldig JSON uten ekstra tekst.
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1, // Lav temperatur for konsistente resultater
        max_tokens: 800
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        console.log('Ingen respons fra AI')
        return {}
      }

      // Parse JSON-respons - fjern markdown formatting først
      try {
        let cleanContent = content.trim()
        
        // Fjern markdown kodeblokker hvis de finnes
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        const aiData = JSON.parse(cleanContent)
        console.log('AI-ekstrakterte data:', aiData)
        
        // Rens AI-data og konverter til riktig format
        const cleaned: Partial<YarnProductData> = {}
        
        if (aiData.name && typeof aiData.name === 'string') {
          cleaned.name = aiData.name.trim()
        }
        
        if (aiData.price !== null && !isNaN(parseFloat(aiData.price))) {
          cleaned.price = parseFloat(aiData.price)
        }
        
        if (aiData.producer && typeof aiData.producer === 'string') {
          cleaned.producer = aiData.producer.trim()
        }
        
        if (aiData.composition && typeof aiData.composition === 'string') {
          cleaned.composition = aiData.composition.trim()
        }
        
        if (aiData.yardage !== null && !isNaN(parseFloat(aiData.yardage))) {
          cleaned.yardage = aiData.yardage
        }
        
        if (aiData.weight !== null && !isNaN(parseFloat(aiData.weight))) {
          cleaned.weight = aiData.weight
        }
        
        if (aiData.needleSize !== null && !isNaN(parseFloat(aiData.needleSize))) {
          cleaned.needleSize = aiData.needleSize
        }
        
        if (aiData.gauge && typeof aiData.gauge === 'string') {
          cleaned.gauge = aiData.gauge.trim()
        }
        
        if (aiData.careInstructions && typeof aiData.careInstructions === 'string') {
          cleaned.careInstructions = aiData.careInstructions.trim()
        }
        
        if (aiData.weightCategory && typeof aiData.weightCategory === 'string') {
          cleaned.weightCategory = aiData.weightCategory.trim()
        }

        return cleaned
      } catch (parseError) {
        console.error('Feil ved parsing av AI-respons:', parseError)
        console.log('AI-respons:', content)
        return {}
      }

    } catch (error) {
      console.error('Feil ved AI-ekstraksjon:', error)
      return {}
    }
  }

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
      
      // Scrape data med tradisjonelle metoder
      const data = await scraper.scrape(html, url)
      
      // Prøv AI-forbedring/fallback
      console.log('Prøver AI-forbedring av ekstrakterte data...')
      const aiData = await this.extractWithAI(html, url)
      
      // La AI velge beste produktbilde hvis flere bilder finnes
      let selectedImageIndex: number | null = null
      if (data.images && data.images.length > 1) {
        console.log('Lar AI velge beste produktbilde...')
        selectedImageIndex = await this.selectBestImageWithAI(data.images, aiData.name || data.name || '')
        if (selectedImageIndex !== null) {
          // Marker det AI-valgte bildet som primary
          data.images = data.images.map((img, index) => ({
            ...img,
            isPrimary: index === selectedImageIndex
          }))
          console.log(`AI valgte bilde ${selectedImageIndex} som hovedbilde`)
        }
      }
      
      // Kombiner AI og tradisjonelle data - AI får prioritet for problematiske felt
      const combinedData: YarnProductData = {
        name: aiData.name || data.name || '',
        price: aiData.price !== undefined ? aiData.price : data.price,
        producer: aiData.producer || data.producer,
        composition: aiData.composition || data.composition,
        yardage: aiData.yardage !== undefined ? aiData.yardage : data.yardage,
        weight: aiData.weight !== undefined ? aiData.weight : data.weight,
        needleSize: aiData.needleSize !== undefined ? aiData.needleSize : data.needleSize,
        gauge: aiData.gauge || data.gauge, // AI prioriteres for gauge (strikkefasthet)
        careInstructions: aiData.careInstructions || data.careInstructions, // AI prioriteres for vaskeråd
        weightCategory: aiData.weightCategory || data.weightCategory,
        description: data.description, // Behold original beskrivelse
        images: data.images, // Behold bilder fra tradisjonell scraping
        // extendedInfo: data.extendedInfo, // Removed - not in type definition
        source: data.source // Behold source-informasjon fra original data
      }
      
      console.log('Kombinerte data (AI + tradisjonell):', {
        name: combinedData.name,
        price: combinedData.price,
        composition: combinedData.composition,
        gauge: combinedData.gauge,
        careInstructions: combinedData.careInstructions
      })
      
      // Valider at vi fikk minst et navn
      if (!combinedData.name || combinedData.name.length < 2) {
        throw new Error('Kunne ikke finne produktnavn på siden')
      }
      
      return combinedData
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

