# Aktive Sider Funksjonalitet

## Oversikt

Denne funksjonaliteten lar brukere kontrollere hvilke sider som vises i sidemenyen i HMS (Home Management System). Brukere kan aktivere eller deaktivere sider basert på deres behov og preferanser.

## Funksjoner

### 1. Aktive Sider Innstillinger
- **Lokasjon**: `/settings/active-pages`
- **Tilgang**: Via hovedinnstillinger under "Organisering" seksjonen
- **Funksjonalitet**: 
  - Viser alle tilgjengelige sider organisert i kategorier
  - Lar brukere aktivere/deaktivere sider med enkle switches
  - Kjerne-sider (Dashboard, Gjenstander, Lokasjoner, Innstillinger) kan ikke deaktiveres
  - Lagrer konfigurasjon lokalt i nettleseren

### 2. Sidemeny Filtrering
- **Automatisk filtrering**: Sidemenyen viser kun aktive sider
- **Backward compatibility**: Hvis ingen konfigurasjon finnes, vises alle sider
- **Real-time oppdatering**: Endringer i innstillinger reflekteres umiddelbart i sidemenyen

## Teknisk Implementering

### Komponenter

#### 1. `useActivePages` Hook (`src/hooks/useActivePages.ts`)
```typescript
interface PageConfig {
  id: string
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  description: string
  isActive: boolean
  isCore?: boolean
}

export function useActivePages() {
  // Hook for å håndtere aktive sider konfigurasjon
  // Inkluderer funksjoner for å lagre, laste og oppdatere konfigurasjon
}
```

#### 2. ActivePagesSettings Side (`src/app/(dashboard)/settings/active-pages/page.tsx`)
- Komponent for å administrere aktive sider
- Viser sider organisert i kategorier
- Lar brukere aktivere/deaktivere sider
- Inkluderer lagre og tilbakestill funksjonalitet

#### 3. Oppdatert Sidebar (`src/components/layout/Sidebar.tsx`)
- Bruker `useActivePages` hook
- Filtrerer navigasjonsmeny basert på aktive sider
- Støtter nested navigation (children)

### Data Lagring

- **Lokasjon**: `localStorage`
- **Nøkkel**: `active-pages-config`
- **Format**: JSON objekt med page ID som nøkkel og boolean som verdi
- **Eksempel**:
```json
{
  "dashboard": true,
  "items": true,
  "locations": true,
  "settings": true,
  "ai": false,
  "blockchain": false
}
```

### Sidetyper

#### Kjerne-sider (Kan ikke deaktiveres)
- Dashboard (`/dashboard`)
- Gjenstander (`/items`)
- Lokasjoner (`/locations`)
- Innstillinger (`/settings`)

#### Funksjoner
- Quick Add (`/quick-add`)
- Smart Search (`/search`)
- Skann QR (`/scan`)
- Utlån (`/loans`)

#### Spesialfunksjoner
- Garn (`/garn`)
- Mønstre (`/patterns`)
- Printing (`/printing`)

#### Analyse
- Analytics (`/analytics`)
- Advanced Analytics (`/advanced-analytics`)
- Reporting (`/reporting`)

#### AI & Automatisering
- AI Assistant (`/ai`)
- Automation (`/automation`)
- Machine Learning (`/ml`)

#### Samarbeid
- Collaboration (`/collaboration`)
- Husholdninger (`/households`)
- Social (`/social`)

#### Avanserte funksjoner
- Smart Inventory (`/smart-inventory`)
- Gamification (`/gamification`)
- Personalization (`/personalization`)

#### Integrasjoner
- Integrations (`/integrations`)
- IoT Devices (`/iot`)
- Blockchain (`/blockchain`)

#### Verktøy
- Camera (`/camera`)
- Voice (`/voice`)
- Mobile (`/mobile`)

#### Administrasjon
- Admin (`/admin`)
- Security (`/security`)
- Notifications (`/notifications`)

#### Spesialfunksjoner
- Emergency (`/emergency`)
- Sustainability (`/sustainability`)
- Test Features (`/test-features`)

#### Data
- Import/Export (`/import-export`)
- Kategorier (`/categories`)
- Location (`/location`)

## Brukergrensesnitt

### Innstillinger Side
- **Header**: "Aktive Sider" med beskrivelse
- **Handlinger**: Lagre endringer, Tilbakestill til standard
- **Kategorier**: Sider organisert i logiske grupper
- **Indikatorer**: Viser antall aktive sider per kategori
- **Switches**: Enkel aktivering/deaktivering av sider
- **Informasjon**: Hjelpetekst om funksjonaliteten

### Sidemeny
- **Automatisk filtrering**: Viser kun aktive sider
- **Nested navigation**: Støtter undermenyer
- **Real-time oppdatering**: Endringer reflekteres umiddelbart

## Sikkerhet og Kompatibilitet

### Sikkerhet
- Konfigurasjon lagres kun lokalt i nettleseren
- Ingen server-side lagring av brukerpreferanser
- Kjerne-sider kan ikke deaktiveres for å sikre grunnleggende funksjonalitet

### Kompatibilitet
- **Backward compatibility**: Hvis ingen konfigurasjon finnes, vises alle sider
- **Graceful degradation**: Hvis localStorage ikke er tilgjengelig, fungerer systemet som før
- **Cross-tab synkronisering**: Endringer synkroniseres mellom åpne faner

## Fremtidige Forbedringer

### Mulige Utvidelser
1. **Server-side lagring**: Lagre konfigurasjon på server for synkronisering mellom enheter
2. **Rollebasert tilgang**: Forskjellige konfigurasjoner basert på brukerroller
3. **Eksport/Import**: Mulighet for å eksportere og importere konfigurasjoner
4. **Presets**: Forhåndsdefinerte konfigurasjoner for ulike bruksområder
5. **Analytics**: Spore hvilke sider som brukes mest for å foreslå optimaliseringer

### Tekniske Forbedringer
1. **Performance**: Caching av konfigurasjon for raskere lasting
2. **Offline support**: Fungerer uten internettforbindelse
3. **A/B testing**: Teste ulike konfigurasjoner med brukere
4. **Accessibility**: Forbedret tilgjengelighet for skjermlesere

## Feilsøking

### Vanlige Problemer

#### Sider vises ikke i sidemenyen
1. Sjekk at siden er aktivert i `/settings/active-pages`
2. Tøm nettleserens cache og localStorage
3. Sjekk at localStorage er tilgjengelig i nettleseren

#### Konfigurasjon lagres ikke
1. Sjekk at localStorage ikke er full
2. Sjekk at nettleseren støtter localStorage
3. Sjekk for JavaScript-feil i konsollen

#### Endringer vises ikke umiddelbart
1. Oppdater siden (F5)
2. Sjekk at du er på riktig fane
3. Sjekk at localStorage-synkronisering fungerer

### Debugging
```javascript
// Sjekk konfigurasjon i konsollen
console.log(JSON.parse(localStorage.getItem('active-pages-config')))

// Tøm konfigurasjon
localStorage.removeItem('active-pages-config')

// Test hook
import { useActivePages } from '@/hooks/useActivePages'
const { activePagesConfig, isPageActive } = useActivePages()
console.log(activePagesConfig)
console.log(isPageActive('dashboard'))
```

## Konklusjon

Aktive Sider funksjonaliteten gir brukere full kontroll over deres brukeropplevelse i HMS. Den lar dem tilpasse systemet til deres spesifikke behov og arbeidsflyter, samtidig som den bevarer grunnleggende funksjonalitet og sikkerhet.
