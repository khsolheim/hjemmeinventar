# Location Wizard - Planleggingsdokument

## Oversikt av Krav

### Hovedfunksjoner
1. **Wizard-basert lokasjonshåndtering** med første-gangs forklaring
2. **Hierarkisk struktur** for rom → skap → hyller → bokser → poser
3. **Automatisk navngiving** med logisk alfanumerisk system (A1, B1, B2, etc.)
4. **Unik ID** for hver lokasjon som aldri gjenbrukes
5. **Enkel å bruke interface** for å legge til nye elementer
6. **Flytting av gjenstander** mellom lokasjoner på tvers av hierarkiet

### Brukerflyt
1. **Første gang**: Vis forklaring med "Ikke vis igjen" valg
2. **Hovedvalg**: Velg mellom Rom, Skap, Hylle, Boks, Pose
3. **Hierarkisk bygging**: +Boks, +Pose, +Hylle, +Skap knapper
4. **Automatisk navngiving**: System genererer logiske navn
5. **Visuell oversikt**: Se hele strukturen på en oversiktelig måte

## Detaljert Spesifikasjon

### 1. Navngivingssystem

#### Automatisk navngiving-regler:
- **Rom**: Bruker-oppgitt navn (f.eks. "Gjesterom", "Soverom")
- **Skap i rom**: Skap A, Skap B, Skap C...
- **Hyller i skap**: A1, A2, A3... (for Skap A), B1, B2, B3... (for Skap B)
- **Bokser på hylle**: A1-1, A1-2, A1-3... (for Hylle A1)
- **Poser i boks**: A1-1-a, A1-1-b, A1-1-c... (for Boks A1-1)

#### Eksempel hierarki:
```
Gjesterom
├── Skap A
│   ├── Hylle A1
│   │   ├── Boks A1-1
│   │   │   ├── Pose A1-1-a
│   │   │   └── Pose A1-1-b
│   │   └── Boks A1-2
│   └── Hylle A2
└── Skap B
    ├── Hylle B1
    └── Hylle B2
        └── Boks B2-1

Soverom
├── Reol A
│   ├── Hylle A1
│   ├── Hylle A2
│   └── Hylle A3
└── Vegghengt hylle
    ├── Boks A-1
    ├── Boks A-2
    └── Boks A-3
```

### 2. Database Struktur

#### Location Model Utvidelser:
```prisma
model Location {
  id          String   @id @default(cuid())
  name        String   // Generert eller bruker-oppgitt
  displayName String?  // Valgfritt brukerdefinert navn
  type        LocationType
  autoNumber  String?  // A, B, C eller A1, B2, etc.
  level       Int      // 0=Rom, 1=Skap, 2=Hylle, 3=Boks, 4=Pose
  parentId    String?
  parent      Location? @relation("LocationHierarchy", fields: [parentId], references: [id])
  children    Location[] @relation("LocationHierarchy")
  
  // QR & Image System
  qrCode      String   @unique // Unik QR-kode som aldri gjenbrukes
  images      String[] // Array av image URLs 
  primaryImage String? // Hovedbilde for lokasjon
  
  // Privacy & Sharing
  isPrivate   Boolean  @default(false) // Privat kasse kun for eier
  allowedUsers String[] // Brukere som har tilgang (kun for delte)
  
  // Wizard metadata
  isWizardCreated Boolean @default(false)
  wizardOrder    Int?    // Ordre for automatisk navngiving
  colorCode      String? // Hex farge for farge-koding
  tags           String[] // Etiketter som "Vinterklaer", "Elektronikk"
  
  // Eksisterende felt...
  userId      String
  householdId String? // Referanse til husholdning
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([parentId, autoNumber, userId])
  @@unique([qrCode]) // QR-kode må være globalt unik
}

enum LocationType {
  ROOM
  CABINET    // Skap
  SHELF      // Hylle  
  BOX        // Boks
  BAG        // Pose
  DRAWER     // Skuff
  RACK       // Reol
  WALL_SHELF // Vegghengt hylle
}
```

### 3. Wizard Interface

#### Første-gangs forklaring:
```
"Velkommen til Lokasjonswizard! 🏠

Her kan du enkelt bygge opp hvordan hjemmet ditt er organisert:
• Start med rom (f.eks. Soverom, Kjøkken)
• Legg til møbler som skap og reoler
• Organiser med hyller, skuffer og bokser
• Navngivning skjer automatisk (A1, B2, etc.)

Trykk på + for å legge til nye elementer.
Du kan alltid endre navn senere!

□ Ikke vis denne forklaringen igjen"
```

#### Hovedvisning - Steg 1: Velg type
```
Hva vil du opprette?

[🏠 Rom]     [📦 Skap]    [📏 Hylle]    
[📦 Boks]    [👜 Pose]    [🗄️ Skuff]
[📚 Reol]    [📐 Vegghengt hylle]
```

#### Hovedvisning - Steg 2: Hierarkisk bygging
```
📍 Du er i: Gjesterom

Eksisterende:
└── Skap A
    └── Hylle A1
        └── Boks A1-1

[+ Skap] [+ Hylle] [+ Boks] [+ Pose]

Eller gå til:
• Skap A → [+ Hylle] [+ Rediger]
  • Hylle A1 → [+ Boks] [+ Rediger]
    • Boks A1-1 → [+ Pose] [+ Rediger]
```

### 4. Teknisk Implementasjon

#### Wizard Komponenter:
1. **LocationWizardProvider** - Context for wizard state
2. **WizardWelcome** - Første-gangs forklaring
3. **LocationTypeSelector** - Velg type lokasjon
4. **HierarchyBuilder** - Bygg hierarki med + knapper
5. **LocationTreeView** - Visuell oversikt
6. **AutoNamingService** - Generer automatiske navn

#### Auto-navngiving Algoritme:
```typescript
class AutoNamingService {
  generateName(parentId: string, type: LocationType): string {
    const siblings = getSiblingLocations(parentId, type)
    const nextLetter = getNextAvailableLetter(siblings)
    const parentAutoNumber = getParentAutoNumber(parentId)
    
    switch(type) {
      case CABINET:
        return `Skap ${nextLetter}`
      case SHELF:
        return `Hylle ${parentAutoNumber}${getNextNumber(siblings)}`
      case BOX:
        return `Boks ${parentAutoNumber}-${getNextNumber(siblings)}`
      case BAG:
        return `Pose ${parentAutoNumber}-${nextLetter.toLowerCase()}`
    }
  }
}
```

#### URL Struktur:
- `/locations/wizard` - Hovedwizard
- `/locations/wizard/create?type=CABINET&parent=xyz` - Opprett spesifikk type
- `/locations/wizard/tree` - Oversikt/tree view
- `/locations/wizard/move` - Flytt gjenstander

## Min Forståelse

Du ønsker:
✅ **Wizard-drevet lokasjonshåndtering** som er intuitiv for nye brukere
✅ **Automatisk navngiving** som følger logisk alfanumerisk system  
✅ **Hierarkisk struktur** med ubegrenset dybde (rom → skap → hylle → boks → pose)
✅ **Unik ID system** som aldri gjenbrukes
✅ **Enkel + knapp interface** for å legge til nye elementer
✅ **Første-gangs tutorial** med "ikke vis igjen" funksjon
✅ **Flytting av gjenstander** på tvers av hele hierarkiet
✅ **Visuell oversikt** over hele strukturen

## 20 Forbedringsforslag

### Brukeropplevelse (INKLUDERT)
1. ✅ **Drag & Drop**: Dra gjenstander mellom lokasjoner visuelt
2. ✅ **Hurtigtaster**: Ctrl+A for å legge til skap, Ctrl+S for hylle, etc.
3. ✅ **Søk i hierarki**: Finn raskt spesifikke lokasjoner
4. ✅ **Favoritt-lokasjoner**: Marker ofte brukte lokasjoner
5. ✅ **Nylig brukte**: Vis sist redigerte lokasjoner øverst

### Navngiving & Organisering (INKLUDERT)
6. ✅ **Egendefinerte prefixer**: Velg egen navngivingsstandard (SKP-A1, HYL-B2)
7. ✅ **Farge-koding**: Ulike farger for forskjellige romtyper/formål
8. ✅ **Etiketter/Tags**: Legg til beskrivende etiketter (Vinterklaer, Elektronikk)
9. ✅ **Bulk rename**: Endre flere lokasjoner samtidig
10. ✅ **Template system**: Lagre og gjenbruk hierarkier (Standard-soverom setup)

### Visualisering & QR System
11. ❌ **3D/Isometrisk visning**: Se hierarkiet i 3D perspektiv *(ikke inkludert)*
12. ❌ **Gulvplan-integrasjon**: Tegn rommet og plasser møbler *(ikke inkludert)*
13. ✅ **Kontekst-sensitiv foto-dokumentasjon**: 
    - Scanner QR på garn → bilde lagres på garnet
    - Scanner QR på pose → bilde lagres på posen  
    - Scanner QR på rom → bilde lagres på rommet
    - Hvert nivå kan ha flere bilder tilknyttet
14. ✅ **Unik QR-kode system**: 
    - Hver lokasjon har sin unike QR-kode
    - Hver gjenstand har sin unike QR-kode
    - QR-koder er permanente og aldri gjenbrukes
15. ✅ **TODO-liste integrasjon**: Kapasitet og organisering kan spores via TODO-system

### Avanserte Funksjoner  
16. ✅ **Bulk-operasjoner**: Flytt alle gjenstander fra en lokasjon
17. ❌ **Lokasjon-historikk**: Se endringer over tid *(ikke inkludert)*
18. ✅ **Import/Export**: Importer hierarki fra Excel/CSV
19. ✅ **Delingslokasjoner med privathet**: 
    - Felles lokasjoner mellom husstandsmedlemmer
    - **PRIVAT-markering**: Bruker kan markere kasse som "privat"
    - Private kasser: Kun eier kan se/redigere (full CRUD-lås)
    - Andre husstandsmedlemmer ser ikke private lokasjoner
20. ❌ **AI-forslag**: Foreslå optimale plasseringer *(ikke inkludert)*

### Tekniske Forbedringer (INKLUDERT)
21. ✅ **Offline support**: Fungerer uten internett
22. ✅ **Backup/Restore**: Automatisk sikkerhetskopi av hierarki
23. ✅ **Version control**: Rulletilbake endringer
24. ✅ **Bulk QR printing**: Print QR-koder for mange lokasjoner samtidig
25. ✅ **Mobile-optimized**: Touch-vennlig interface for mobil/tablet

## Implementeringsrekkefølge

### Fase 1: Grunnleggende Wizard & QR System
- [ ] Database schema utvidelser (QR, privacy, images)
- [ ] QR-kode generering og unik ID system
- [ ] Grunnleggende wizard komponenter  
- [ ] Automatisk navngiving service
- [ ] Første-gangs tutorial med "ikke vis igjen"

### Fase 2: Hierarki Building & Privacy
- [ ] + knapp interface for alle lokasjon-typer
- [ ] Tree view komponenter med farge-koding
- [ ] Privacy markering (privat/delt lokasjoner)
- [ ] Husstandsmedlem tilgangskontroll
- [ ] Flytting av gjenstander

### Fase 3: QR & Image Integration
- [ ] Kontekst-sensitiv foto-lagring (scan QR → lagre på riktig nivå)
- [ ] QR-scanner integrasjon 
- [ ] Bulk QR printing funksjon
- [ ] Rediger lokasjon navn og egenskaper

### Fase 4: Avanserte Funksjoner
- [ ] Drag & drop flytting
- [ ] Søk og filtrering med tags
- [ ] Hurtigtaster (Ctrl+A, etc.)
- [ ] Favoritt og nylig brukte lokasjoner
- [ ] Bulk operasjoner

### Fase 5: Template & Import/Export
- [ ] Template system for standard-oppsetup
- [ ] Import/Export til Excel/CSV
- [ ] Bulk rename funksjoner
- [ ] TODO-liste integrasjon

### Fase 6: Tekniske Forbedringer
- [ ] Offline support
- [ ] Backup/Restore system
- [ ] Version control for endringer
- [ ] Mobile-optimalisering
- [ ] Performance optimalisering

---

## Nye Forslag Basert på Oppdaterte Krav

### QR & Image System Forbedringer
26. **QR-kode design customization**: Velg logo/farge på QR-koder for estetikk
27. **Smart image tagging**: Auto-tag bilder basert på lokasjon (f.eks. "Soverom", "Elektronikk")
28. **Image compression**: Automatisk optimalisering av bilder for raskere lasting
29. **QR-kode backup**: Fysisk backup av QR-koder som kan skrives ut på nytt
30. **Batch image upload**: Last opp flere bilder samtidig til forskjellige lokasjoner

### Privacy & Sharing Utvidelser
31. **Granular permissions**: Ikke bare privat/offentlig, men også "kun lesing" for enkelte brukere
32. **Temporary access**: Gi midlertidig tilgang til private lokasjoner (f.eks. 24 timer)
33. **Family zones**: Definer familieområder som alle kan se, men kun foreldre kan redigere
34. **Guest access**: Vis utvalgte lokasjoner til gjester uten full husholdningstilgang
35. **Access logging**: Se hvem som har sett på private lokasjoner når

### Template & Automation
36. **Smart templates**: Templates som tilpasser seg romstørrelse og formål
37. **Auto-kategorisering**: Foreslå lokasjon-type basert på plassering i hierarki
38. **Seasonal templates**: Oppsetup som endres med årstid (vinterklaer, jul-dekorasjoner)
39. **Move suggestions**: Foreslå optimale lokasjoner når man legger til nye gjenstander
40. **Space optimization**: Analyser og foreslå hvordan man kan optimalisere plass bedre

### Mobile & Scanning Forbedringer  
41. **Voice commands**: "Legg til boks i Skap A" via stemmekommandoer
42. **Offline QR scanning**: Scanner QR-koder og synkroniserer når online igjen
43. **AR labels**: Augmented Reality overlay som viser lokasjon-informasjon via kamera
44. **NFC support**: Støtte for NFC-tags som alternativ til QR-koder
45. **Barcode integration**: Scan produktstrekkoder for automatisk kategorisering

## Prioriterte Nye Funksjoner (Oppdatert)

**Høy prioritet (implementer først):**
- 26. ✅ **QR-kode & etikett-mal system** (integrasjon med `/printing` side)
  - Hierarchisk etikett-mal arv (rom → hylle → boks → pose)
  - "Standard for alle nedover" funksjon
  - QR-kode forhåndsvisning på item-nivå
- 27. ✅ **Smart image tagging** basert på lokasjon
- 28. ✅ **Image compression** automatisk optimalisering  
- 29. ✅ **QR-kode backup** lagret på item/lokasjon nivå
- 30. ✅ **Batch image upload** (flere til en lokasjon)
- 31. ✅ **Granular permissions** (mer enn privat/offentlig)
- 32. ✅ **Temporary access** til private lokasjoner
- 33. ✅ **Family zones** (alle ser, kun foreldre redigerer)
- 34. ✅ **Guest access** til utvalgte lokasjoner
- 35. ✅ **Access logging** for private lokasjoner
- 42. ✅ **Offline QR scanning** med synkronisering
- 44. ✅ **NFC support** som QR-alternativ
- 45. ✅ **Barcode integration** for produktkategorisering

**Ikke inkludert:**
- 36-40. ❌ Smart templates & automation (for komplekst)
- 41. ❌ Voice commands (ikke ønsket)
- 43. ❌ AR labels (ikke ønsket)

## Printing & QR System Integrasjon

### Eksisterende `/printing` Side Utvidelser
Den eksisterende `/printing` siden skal utvides med:

#### Hierarchisk Etikett-mal System
```
Rom (Level 0) 
  ↓ bestemmer
Hylle (Level 1)
  ↓ bestemmer  
Boks (Level 2)
  ↓ bestemmer
Pose (Level 3)
```

#### Ny Funksjonalitet i `/printing`:
1. **Etikett-mal Manager**
   - Oprett maler for hver lokasjon-type (Rom, Hylle, Boks, Pose)
   - Standard-mal per hierarki-nivå
   - "Bruk som standard for alle nedover" knapp

2. **QR-kode Forhåndsvisning**
   - Live preview av QR-koder med valgt mal
   - Test-print funksjon
   - Bulk QR-generering for hierarkier

3. **Mal Arv System**
   - Rom-mal propagerer nedover til alle under-lokasjoner
   - Mulighet for override på hvert nivå
   - Visual indikator for arvede vs egendefinerte maler

### Instillinger Side Oppdateringer

#### Hierarki-regler Konfigurasjon
Ny seksjon i `/settings` for å definere:

```typescript
interface HierarchyRule {
  parentType: LocationType
  allowedChildTypes: LocationType[]
  maxDepth: number
  autoNaming: boolean
  defaultTemplate?: string
}
```

#### Eksempel Hierarki-regler:
- **Rom** kan inneholde: [Skap, Hylle, Reol, Kommode]
- **Skap** kan inneholde: [Hylle, Boks, Skuff]  
- **Hylle** kan inneholde: [Boks, Pose, Kurv]
- **Boks** kan inneholde: [Pose, Mindre-boks]
- **Pose** kan inneholde: [Ingenting] (leaf node)

#### UI for Hierarki-regler:
- Drag & drop for å definere tillatte relasjoner
- Toggle for automatisk navngivning per type
- Template-selector per lokasjon-type
- Maksimal dybde-begrensning

## UI/UX Endringer Nødvendig

### 1. Location Wizard Komponenter
- **`LocationWizard.tsx`** - Hovedwizard for oppretting
- **`HierarchyBuilder.tsx`** - Tree-view med +knapper
- **`LocationTypeSelector.tsx`** - Velg type (boks, hylle, etc.)
- **`AutoNamingConfig.tsx`** - Konfigurer navngivingsregler

### 2. Existing Pages å Oppdatere
- **`/locations`** - Legg til "Start Wizard" knapp
- **`/printing`** - Integrer QR & mal-system
- **`/settings`** - Legg til hierarki-regler seksjon
- **`/scan`** - Støtte for lokasjon QR-scanning

### 3. Nye UI Komponenter
- **`PrivacyToggle.tsx`** - Privat/offentlig switch
- **`QRPreview.tsx`** - Live QR-kode forhåndsvisning  
- **`HierarchyRuleEditor.tsx`** - Regel-konfigurasjon
- **`TemplatePropagation.tsx`** - "Standard nedover" funksjon

---

**Neste steg**: Skal vi begynne med implementeringen? Foreslår å starte med database schema oppdateringer og deretter UI komponenter! 🚀
