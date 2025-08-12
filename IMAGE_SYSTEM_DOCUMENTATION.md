# 📸 Automatisk Bildelagring System

## 🎯 Oversikt
Systemet laster nå automatisk ned og lagrer **alle produktbilder** fra nettsiden når du importerer garn fra URL. Bildene optimaliseres og lagres sikkert i høy kvalitet.

## ✨ Nye funksjoner

### 🔄 Automatisk bildehenting
- **Finner alle produktbilder** på siden
- **Identifiserer hovedbilde** automatisk
- **Laster ned opptil 10 bilder** per produkt
- **Optimaliserer bildene** (WebP format, maks 1200x1200px)
- **Lagrer i Vercel Blob** for rask tilgang

### 🖼 Bildebehandling
- **Automatisk komprimering** (85% kvalitet)
- **Format konvertering** til WebP for mindre filstørrelse
- **Størrelses-optimalisering** uten kvalitetstap
- **Duplikat-fjerning** av identiske bilder

### 📱 UI forbedringer
- **Bildeforhåndsvisning** i import-dialogen
- **Bildeteller** viser antall bilder funnet
- **Hovedbilde markering** for identifikasjon
- **Grid-visning** av alle produktbilder

## 🛠 Teknisk implementering

### 1. Image Service (`src/lib/image/image-service.ts`)
```typescript
// Hovedklassen for bildebehandling
class ImageService {
  - downloadAndStoreImage() // Laster ned ett bilde
  - downloadAndStoreImages() // Laster ned flere bilder
  - extractImagesFromHtml() // Finner bilder på nettsiden
  - processImage() // Optimaliserer bilder
}
```

### 2. Oppdatert Scraper (`src/lib/scraping/yarn-url-scraper.ts`)
```typescript
// Utvidet til å inkludere bilder
interface YarnProductData {
  images?: Array<{
    url: string
    alt?: string
    isPrimary?: boolean
  }>
  // ... andre felt
}
```

### 3. API Integration (`src/app/api/scrape-yarn-url/route.ts`)
- Scraper produktinformasjon **først**
- Laster ned alle bilder **automatisk**
- Returnerer både data og nedlastede bilder

### 4. UI Komponenter
- **YarnUrlImporter**: Viser bildegalleri i forhåndsvisning
- **YarnWizard**: Håndterer bilder i import-flyten

## 🎯 Supported bildetyper

### ✅ Automatisk gjenkjenning
- **Hovedproduktbilde** (primær)
- **Galleribilder** (sekundære)
- **Thumbnail-bilder**
- **Alternative vinkler**

### 🔍 Smart bildedeteksjon
Systemet søker etter bilder med disse selektorene:
```css
.product-image img        /* Hovedproduktbilde */
.product-gallery img      /* Galleribilder */
.thumbnail img           /* Miniatyrbilder */
img[alt*="product"]      /* Alt-tekst søk */
img[src*="garn"]         /* URL-basert søk */
```

## 📊 Bildeoptimalisering

### Før optimalisering:
- **Forskjellige formater** (JPG, PNG, GIF)
- **Store filstørrelser** (opptil 5MB+)
- **Varierende kvalitet**

### Etter optimalisering:
- **WebP format** (opptil 30% mindre)
- **Maksimum 1200x1200px**
- **85% kvalitet** (optimal balanse)
- **Gjennomsnittlig 50-200KB** per bilde

## 🚀 Brukseksempel

### 1. Importer garn fra Adlibris
```
URL: https://www.adlibris.com/nb/produkt/melody-uni-colour-garn...
```

### 2. Systemet finder automatisk:
- ✅ **Hovedproduktbilde** (Melody garn i Hot Pink)
- ✅ **Fargeguide** (hvis tilgjengelig)
- ✅ **Tekstur-detaljer** (nærbilde av garn)
- ✅ **Pakningsbilder** (etiketter, nøstestørrelse)

### 3. Resultatet:
- **4-6 optimaliserte bilder** automatisk lagret
- **Hovedbilde** satt som primær
- **Alle bilder tilgjengelige** i garn-databasen

## 💾 Lagring og tilgang

### Database lagring
Bilder lagres som `Attachment` med type `PHOTO`:
```sql
- url: "https://xyz.vercel-storage.com/yarn-product-primary-123.webp"
- filename: "yarn-product-primary-1699123456-a1b2c3d4.webp"
- filetype: "image/webp"
- filesize: 156789 (bytes)
- type: "PHOTO"
```

### Automatisk filnavn
```
Format: [prefix]-[type]-[timestamp]-[hash].webp
Eksempel: yarn-product-primary-1699123456-a1b2c3d4.webp
```

## 🔒 Sikkerhet og begrensninger

### ✅ Sikkerhetstiltak
- **Filstørrelse begrenset** til 5MB
- **Kun bildeformater** tillatt
- **URL validering** før nedlasting
- **Rate limiting** (3 bilder parallelt)

### ⚡ Ytelse
- **Progressiv nedlasting** (3 bilder om gangen)
- **Asynkron behandling** (blokkerer ikke UI)
- **Graceful fallback** (fortsetter uten bilder ved feil)

## 🎉 Resultater

### Før bildesystem:
- ❌ Manuell bildebehandling
- ❌ Ett bilde per garn
- ❌ Tap av bildekvalitet ved opplasting

### Etter bildesystem:
- ✅ **Automatisk** bildelagring
- ✅ **Opptil 10 bilder** per garn
- ✅ **Optimalisert kvalitet** og størrelse
- ✅ **Rask tilgang** via CDN
- ✅ **Komplett bildegalleri** for hvert garn

## 🔮 Fremtidige utvidelser

### Planlagte forbedringer:
1. **AI-basert bildeklassifisering** (farge vs. tekstur vs. etikett)
2. **Automatisk fargekalibrering** fra produktbilder
3. **Bulk bildeimport** for flere produkter
4. **Bildekomprimering** med AI-basert oppskaling

Systemet er nå klar til å automatisk håndtere alle produktbilder! 🎨✨
