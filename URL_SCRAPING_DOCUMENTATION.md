# URL Scraping System for Garn Import

## 📁 Oversikt
Denne løsningen lar deg enkelt importere garninformasjon ved å lime inn URL-er fra forskjellige nettsider som Adlibris, Hobbii, og andre.

## 🛠 Implementerte komponenter

### 1. Core Scraping Service
**Fil:** `src/lib/scraping/yarn-url-scraper.ts`
- **YarnUrlScraper** - Hovedklasse som koordinerer scraping
- **Scraper interface** - Modulær design for å støtte flere nettsider
- **Støttede nettsider:**
  - Adlibris (spesialisert scraper)
  - Hobbii (spesialisert scraper)
  - Generisk scraper (fallback for andre sider)

### 2. API Endpoint
**Fil:** `src/app/api/scrape-yarn-url/route.ts`
- POST endpoint som mottar URL og returnerer strukturert garn-data
- GET endpoint for å teste om en URL kan scraes
- Autentisering og feilhåndtering

### 3. UI Komponenter
**Fil:** `src/components/yarn/YarnUrlImporter.tsx`
- URL input felt med validering
- Live forhåndsvisning av scraped data
- Import knapp for å bruke dataene
- Støttet nettsider oversikt

### 4. Integrering
**Fil:** `src/components/yarn/YarnWizard.tsx` (modifisert)
- Ny "Importer fra URL" valg i wizard
- Automatisk pre-filling av master form med importerte data
- Sømløs integrering med eksisterende arbeidsflyt

## 🚀 Hvordan bruke systemet

### 1. Start garn registrering
- Gå til garn-sektionen og klikk "Legg til garn"
- Velg "Importer fra URL" fra valgene

### 2. Lim inn produktlink
- Lim inn URL fra Adlibris, Hobbii eller andre nettsider
- Klikk "Hent info" for å scrape produktinformasjon
- Se forhåndsvisning av informasjonen som ble funnet

### 3. Juster og importer
- Sjekk at informasjonen er riktig
- Klikk "Importer produktdata"
- Systemet fyller automatisk ut garn-type skjemaet
- Juster eventuelle feil og fortsett til batch-opprettelse

## 🎯 Støttede data felter

Systemet kan automatisk hente:
- **Produktnavn** - Hovedtittel på produktet
- **Produsent** - Garnmerke (f.eks. Drops, Hobbii)
- **Sammensetning** - Materialsammensetning (f.eks. "100% Merino Wool")
- **Vekt** - Nøstevekt (f.eks. "50g")
- **Løpelengde** - Meter per nøste (f.eks. "175m")
- **Pinnestørrelse** - Anbefalte pinne størrelser
- **Pris** - Pris per nøste
- **Produktbilde** - Henter automatisk hovedbilde
- **Beskrivelse** - Produktbeskrivelse
- **Farger** - Tilgjengelige farger (hvis oppgitt)

## 🌐 Legge til støtte for nye nettsider

For å legge til støtte for en ny nettside, opprett en ny scraper klasse:

```typescript
class NewSiteScraper implements Scraper {
  canHandle(url: string): boolean {
    return url.includes('newsite.com')
  }

  async scrape(html: string, url: string): Promise<YarnProductData> {
    const $ = load(html)
    
    return {
      name: $('.product-name').text(),
      // ... mer scraping logikk
      source: {
        url,
        siteName: 'New Site',
        scrapedAt: new Date()
      }
    }
  }
}
```

Legg til den nye scraperen i `YarnUrlScraper` konstruktøren.

## 🛡 Sikkerhet og feilhåndtering

- **Rate limiting** - Ingen innebygd rate limiting (vurder å legge til)
- **User-Agent** - Bruker standard browser user-agent
- **Feilhåndtering** - Omfattende error handling med brukervennlige meldinger
- **Validering** - URL validering og resultat validering
- **Autentisering** - Krever innlogging for å bruke API

## 🔧 Vedlikehold

### Vanlige problemer:
1. **Nettsider endrer struktur** - Oppdater relevante CSS selektorer i scraper
2. **Anti-bot beskyttelse** - Kan trenge mer sofistikerte løsninger (Puppeteer)
3. **CORS issues** - Server-side scraping løser dette

### Utvidelsesmuligheter:
- **Caching** - Cache scraped data for å redusere forespørsler
- **Bulk import** - Støtte for import av flere produkter samtidig
- **Automatisk oppdatering** - Overvåke prisendringer på produkter
- **Bilde behandling** - Automatisk nedlasting og lagring av produktbilder

## 📊 Testing

Test systemet med disse URL-ene:
- Adlibris: Finn en garn-produktside på adlibris.com
- Hobbii: Test med produktsider fra hobbii.com
- Andre nettsider: Test generisk scraper med andre garn-nettsider

Systemet vil gi tilbakemelding om hvor godt scrapingen fungerte for hver side.
