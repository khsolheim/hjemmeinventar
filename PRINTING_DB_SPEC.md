# Printing-system: Database-spesifikasjon og implementasjonsplan

Denne spesifikasjonen definerer databasestruktur og implementasjonsplan for etikettutskrift med DYMO, inkludert maler, jobber og bruker-/husholdningsinnstillinger. Målet er å støtte både QR- og strekkodeetiketter, med mulighet for egendefinerte XML-maler.

## Mål
- **Maler**: Lagring av DYMO XML-maler pr. bruker/husholdning og systemmaler.
- **Profiler**: Lagre foretrukket skriver, etikettstørrelse og antall kopier pr. bruker/husholdning.
- **Jobber**: Logg av utskriftsjobber (bulk og enkel) for feilsøking og sporbarhet.
- **Ingen dummydata**: Kun systemmaler kan seeds som plattform-ressurser.

## Datamodell

### Enums
- **LabelType**: `QR`, `BARCODE`, `CUSTOM`
- **LabelSize**: `SMALL`, `STANDARD`, `LARGE`
- **PrintJobStatus**: `QUEUED`, `PROCESSING`, `SUCCESS`, `FAILED`, `CANCELLED`

### Tabeller

#### LabelTemplate
- `id` TEXT PK (cuid)
- `name` TEXT NOT NULL
- `type` TEXT NOT NULL (LabelType)
- `size` TEXT NOT NULL (LabelSize)
- `xml` TEXT NOT NULL (DYMO Label XML)
- `fieldMapping` TEXT NULL (JSON: mapping mellom feltnavn i malen og datakilder, f.eks. `{"ITEM_NAME":"item.name"}`)
- `isSystemDefault` BOOLEAN NOT NULL DEFAULT false
- `userId` TEXT NULL → FK `User(id)` ON DELETE CASCADE
- `householdId` TEXT NULL → FK `Household(id)` ON DELETE CASCADE
- `createdAt` DATETIME NOT NULL DEFAULT now
- `updatedAt` DATETIME NOT NULL

Indekser:
- IDX på `userId`, IDX på `householdId`
- Valgfri unikhet: (`name`, `userId`, `householdId`) – ikke håndhevet i første versjon

#### PrinterProfile
- `id` TEXT PK (cuid)
- `name` TEXT NOT NULL (f.eks. "Hjemmekontor")
- `printerName` TEXT NOT NULL (rapportert fra DYMO)
- `size` TEXT NOT NULL (LabelSize)
- `defaultCopies` INTEGER NOT NULL DEFAULT 1
- `userId` TEXT NOT NULL → FK `User(id)` ON DELETE CASCADE
- `householdId` TEXT NULL → FK `Household(id)` ON DELETE CASCADE
- `createdAt` DATETIME NOT NULL DEFAULT now
- `updatedAt` DATETIME NOT NULL

Indekser:
- IDX på `userId`, IDX på `householdId`

#### PrintJob
- `id` TEXT PK (cuid)
- `jobTitle` TEXT NOT NULL
- `type` TEXT NOT NULL (LabelType)
- `status` TEXT NOT NULL DEFAULT `QUEUED` (PrintJobStatus)
- `printerName` TEXT NULL
- `copies` INTEGER NOT NULL DEFAULT 1
- `size` TEXT NULL (LabelSize) – valgfri dersom mal bestemmer størrelsen
- `payload` TEXT NOT NULL (JSON-array av etiketter, struktur som `LabelData`)
- `errorMessage` TEXT NULL
- `templateId` TEXT NULL → FK `LabelTemplate(id)` ON DELETE SET NULL
- `userId` TEXT NOT NULL → FK `User(id)` ON DELETE CASCADE
- `householdId` TEXT NULL → FK `Household(id)` ON DELETE CASCADE
- `createdAt` DATETIME NOT NULL DEFAULT now
- `updatedAt` DATETIME NOT NULL
- `startedAt` DATETIME NULL
- `finishedAt` DATETIME NULL

Indekser:
- IDX på `userId`, `status`, `createdAt`, `templateId`

## Seed-strategi
- Opprett kun systemmaler (ingen brukerdata):
  - Standard QR (30252 Address) – `LabelType=QR`, `LabelSize=STANDARD`, `isSystemDefault=true`
  - Code128 Barcode (30252 Address) – `LabelType=BARCODE`, `LabelSize=STANDARD`, `isSystemDefault=true`
- Ingen opprettelse av `PrinterProfile` eller `PrintJob` i seed.

## API/Service-plan (V1)
- Bruk eksisterende `dymo-service` for utskrift og forhåndsvisning i klienten.
- Serverlagring:
  - [GET] List/les maler (bruker/husholdning/system)
  - [POST/PUT] Lagre/oppdatere mal (XML + mapping)
  - [POST] Opprett `PrintJob` før klient initierer utskrift (asynkron logging)
- TRPC-router `printing.ts` (senere): `listTemplates`, `getTemplate`, `upsertTemplate`, `listJobs`, `getJob`

## UI/Wireframe-plan
- Sider under `(dashboard)/printing/`:
  - `page.tsx`: Oversikt med lenker til "Maler" og "Utskriftsveiviser".
  - `templates/page.tsx`: Liste over maler + knapp "Ny mal" → åpner editor.
  - `editor/[id]/page.tsx` og `editor/page.tsx`: Editor med felter: Navn, Type, Størrelse, XML-editor (placeholder), felttilordninger (placeholder), Lagre/Avbryt. Klikkbar navigasjon mellom seksjoner.
  - `wizard/page.tsx`: Stegvis veiviser: 1) Velg mal, 2) Kildevalg (lokasjoner/varer/QR-scan) – placeholder, 3) Innstillinger (skriver, størrelse, kopier), 4) Forhåndsvis og skriv ut. Navigasjon Next/Back.
- Ingen dummydata; komponentene er klikkbare med placeholder-tilstander.

## Migrasjonsplan
1. Legg til enums i Prisma (`LabelType`, `LabelSize`, `PrintJobStatus`).
2. Opprett tabeller `LabelTemplate`, `PrinterProfile`, `PrintJob` med FK-er.
3. Indekser for vanlige oppslag.
4. Seed systemmaler.

## Notater om kompatibilitet
- Eksisterende `LabelProfile` beholdes som separat konsept (innhold på etikett som ekstra linjer/logo). `LabelTemplate` omhandler layout/XML.
- `dymo-service` kan senere leses fra `LabelTemplate.xml` i stedet for hardkodede maler.
- SQLite: enums lagres som `TEXT`-kolonner; validering håndteres i applikasjonslaget.