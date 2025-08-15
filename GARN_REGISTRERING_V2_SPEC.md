## Garnregistrering V2 – Spesifikasjon (Wizard 2.0 + Integrert Dashboard)

Denne spesifikasjonen beskriver ny ende-til-ende prosess for registrering og forvaltning av garn: Master (garn-type) → Farge → Parti (batch) → Antall. Dokumentet fungerer som referanse under implementering og testing.

### Mål
- **Rask og trygg registrering** for både nybegynnere (wizard) og superbrukere (dashboard).
- **Full CRUD** på master, farge og batch, inkl. antallsjustering med revisjonsspor.
- **Deduplisering** og validering (unngå like farger/batcher).
- **Ingen endring i eksisterende data** uten eksplisitt migrering.

---

## Datamodell (logisk) og relasjoner
- **Master (Garn-type)**: `name`, `producer`, `composition`, `yardage`, `weight`, `gauge`, `needleSize`, `careInstructions`, `store`, `notes`, `locationId`, `imageUrl`.
- **Farge**: `name`, `colorCode`, `imageUrl`, relasjon til master.
- **Batch (Parti)**: `name`, `batchNumber`, `colorId` (eller `color`/`colorCode` for fallback), `quantity`, `pricePerSkein`, `purchaseDate`, `condition`, `notes`, `locationId`, `imageUrl`, `unit` (default: "nøste").
- **Antall**: håndteres på batch som `totalQuantity`/`availableQuantity` (justeres via egne mutasjoner).

Valideringsregler:
- **Master**: `name` påkrevd, `locationId` må være gyldig.
- **Farge**: `name` påkrevd; duplikat pr. master bestemmes av `name` (case-insensitiv) + `colorCode` (hvis satt).
- **Batch**: `batchNumber` påkrevd; unik pr. (master + farge); `quantity` heltall ≥ 0 (≥ 1 ved opprettelse i wizard).

---

## API/TRPC – endepunkter (tillegg til eksisterende)

Eksisterer allerede (brukes videre): `createMaster`, `createColor`, `createBatch`, `getAllMasters`, `getColorsForMaster`, `getBatchesForMaster`.

Nye/utvidede endepunkter for komplett CRUD og antallshåndtering:

```ts
// Master
updateMaster({
  id: string,
  name?: string,
  producer?: string,
  composition?: string,
  yardage?: string,
  weight?: string,
  gauge?: string,
  needleSize?: string,
  careInstructions?: string,
  store?: string,
  notes?: string,
  locationId?: string,
  imageUrl?: string,
})
deleteMaster({ id: string }) // Blokker hvis batches finnes, eller krev eksplisitt bekreftet cascade

// Color
updateColor({ id: string, name?: string, colorCode?: string, imageUrl?: string })
deleteColor({ id: string }) // Blokker hvis batches finnes for fargen

// Batch
updateBatch({
  id: string,
  name?: string,
  batchNumber?: string,
  colorId?: string,
  quantity?: number,
  pricePerSkein?: number,
  purchaseDate?: Date,
  condition?: string,
  notes?: string,
  locationId?: string,
  imageUrl?: string,
})
deleteBatch({ id: string })

// Antall (audit-vennlig justering)
adjustBatchQuantity({
  id: string,
  delta: number, // +1, -1, +10, ...
  reason?: 'COUNT' | 'PURCHASE' | 'CONSUME' | 'CORRECTION' | 'OTHER',
  note?: string,
})
```

Serverregler:
- Deduplisering i `createColor` og `createBatch` (case-insensitiv og trimmede verdier).
- Konflikt (409) ved forsøk på å opprette duplikat batch.
- `updateBatch` må hindre kollisjon ved endring av `batchNumber`/`colorId`.

---

## UI og sider – tilpasning til ny prosess

### Navigasjonskart
- `(/dashboard)/garn` → Oversikt (eksisterer, beholdes)
- `(/dashboard)/garn/register` → Wizard 2.0 (oppgraderes)
- `(/dashboard)/garn/manage` → Ny integrert 3-kolonne manager
- `(/dashboard)/garn/[id]` → Master-detalj (behold)
- `(/dashboard)/garn/[id]/farge/[colorId]` → Fargedetalj (behold/forbedre)

### Wizard 2.0 – steg og skjema
- **Steg 1: Velg opprettelsesmåte**
  - Ny master / Eksisterende master / Importer fra URL.
- **Steg 2: Master-detaljer** (kun når ny master)
  - Felter som i dag. `name` påkrevd. `locationId` velges/finnes.
- **Steg 3: Farge** (nytt steg)
  - Liste over eksisterende farger (fra `getColorsForMaster`).
  - Velg eksisterende eller opprett ny (`createColor`).
  - Deduplisering: vis varsel og gjenbruk eksisterende om match.
- **Steg 4: Batch**
  - Felter: `batchNumber` (påkrevd), `quantity` (≥1), `pricePerSkein`, `purchaseDate`, `notes`.
  - Automatisk `name`: "{Farge} – {BatchNr}".
  - Skann støttes (strekkode/QR på partinr.).
- **Steg 5: Oppsummering**
  - Bekreftelse + snarvei "Legg til ny batch for samme master" (hopper tilbake til Steg 3–4).

Feil- og statehåndtering:
- Vis konkrete feilmeldinger for duplikater/manglende lokasjon.
- Optimistic UI der det er trygt; ellers vent på server.

### Integrert Dashboard (3-kol manager)
- **Kolonne 1: Masterliste**
  - Søk/filtre. "+ Ny master" åpner panel i kolonne 3.
- **Kolonne 2: Farger og batches**
  - Foldbare noder per farge, viser underlagte batches med antall.
  - Knapper: "+ Ny farge", "+ Ny batch" i riktig kontekst.
- **Kolonne 3: Detaljpanel / Skjema**
  - Master valgt → rediger master.
  - Farge valgt → rediger farge.
  - Batch valgt → rediger batch + antallsjustering (\+1/−1/sett-eksakt).
  - Massevalg (bulk): flytt lokasjon, sett pris, osv.

Tilgjengelighet og mobil:
- Tastatursnarveier i wizard (Enter/Shift+Enter).
- Responsivt layout; kolonner stabler på mobil (2 → 1 kolonne).
- ARIA-roller og fokusstyring på dialoger/skjema.

Cache og refetch:
- Bruk `trpc.useUtils()` for invalidation etter mutasjoner per ressurs (masters, colors, batches, totals).

---

## Komponenter (gjenbrukbare byggeklosser)
- `YarnWizard` (oppgradert): nytt steg for farge, støtte skanning, "legg til en til".
- `YarnManager` (ny): 3-kolonne layout med liste + detaljpanel.
- `ColorSelector` (ny): velg/lag farge med deduplisering.
- `BatchForm` (ny): skjema for opprett/oppdater batch.
- `QuantityAdjuster` (ny): +/−/sett antall med årsak/notat.
- `DedupeAlert` (ny): presentasjon av konflikt og forslag til løsning.

---

## Kanttilfeller og regler
- Forsøk på opprettelse av eksisterende farge/batch → vis valg om gjenbruk.
- Sletting blokkeres når det finnes avhengigheter (f.eks. batch med forbruk i prosjekt).
- Flytting av batch mellom farger (endre `colorId`) må hindre kollisjon.

---

## Testplan (kritiske scenarioer)
- Opprett ny master → ny farge → ny batch (med antall) → totals oppdateres.
- Opprett duplikat farge/batch → konflikt og gjenbruk.
- Juster antall via dashboard (+/−/sett) → totals og historikk oppdateres korrekt.
- Slett farge uten batches (ok) vs. med batches (blokker, vis melding).
- Flytt batch til annen farge → datastruktur og summer forblir konsistent.

---

## Leveranseplan (MVP → Full)
- **MVP**
  - Wizard: nytt fargesteg, validering, skanning av partinr.
  - API: `updateBatch`, `deleteBatch`, `updateColor`, `deleteColor`, `adjustBatchQuantity`.
  - Manager: 3-kol layout med visning og enkel redigering.
- **Full**
  - Bulk-operasjoner i manager, flytt batch mellom farger, bedre filtrering/søk.
  - Revisjonsspor for antall (visninger i UI).

---

## Oppgaveliste (arbeidsordre)
- [ ] Oppgradere `YarnWizard` med eget fargesteg og deduplisering
- [ ] Legge til skannefelt for partinummer i batch-steg
- [ ] Implementere nye TRPC-endepunkter (CRUD + justering)
- [ ] Lage `YarnManager`-side med 3-kolonne layout
- [ ] Lage `ColorSelector`, `BatchForm`, `QuantityAdjuster`, `DedupeAlert`
- [ ] Invalidere relevante cache-nøkler etter mutasjoner
- [ ] Skrive tester for duplikater, antall, sletting og flytting
- [ ] Oppdatere hjelpetekster/feilmeldinger på norsk

---

## Referanser (eksisterende filer)
- `src/components/yarn/YarnWizard.tsx`
- `src/components/yarn/YarnMasterDashboard.tsx`
- `src/lib/trpc/routers/yarn.ts`
- `src/lib/utils/yarn-helpers.ts`
- `src/app/(dashboard)/garn/register/page.tsx`

Dette dokumentet oppdateres fortløpende under implementering.


