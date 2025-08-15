## Omstrukturering av Gjenstandssystemet (Item System)

Dette dokumentet beskriver en detaljert plan for å omstrukturere gjenstandssystemet (Item System) i Hjemmeinventar. Målet er å gjøre løsningen mer robust, skalerbar, typesikker og enklere å videreutvikle.

### 1. Mål og prinsipper

- **Typesikkerhet**: Klare kontrakter for data (kategori‑spesifikke felter) på både klient og server.
- **Entydige relasjoner**: Alle koblinger mellom `Item`s skal ha en relasjonstype og være validerbare.
- **Acyklisk hierarki**: Regler og trestrukturer skal være uten sykluser.
- **Thin client, rich server**: Domenelogikk flyttes til services på serveren; klienten blir tynnere.
- **Forutsigbar cache**: Konsistente regler for invalidasjon og refetch.
- **Observability**: Gode logger/metrics; enklere feilsøking.

### 2. Dagens situasjon (kort oppsummert)

- `Item` lagrer felles felter + kategori‑spesifikke data i `categoryData` (JSON).
- Relasjoner skjer via `relatedItems`/`relatedTo` uten eksplisitt relasjonstype.
- Hierarki for lokasjon har konfigurerbare regler, men kan bli sirkulært.
- Flere domeneområder (f.eks. Garn) bruker samme grunnstruktur, men med mye logikk i klient/wizard.
- tRPC‑routere inneholder både endpoints og forretningslogikk.

### 3. Problemområder

- **JSON uten kontrakt**: `categoryData` er lite typesikker → risiko for feil og inkonsistens.
- **Relasjoner uten type**: Vanskelig å validere (f.eks. master/batch/farge), gir tvetydighet.
- **Sirkulære regler**: Hierarkikonfig kan gi sykluser (BOX→CONTAINER→BOX).
- **Spredt logikk**: Forretningsregler ligger i både UI og routere.
- **Caching**: Ulik praksis → stale data i lister/faner.
- **Søk/agg**: Mange aggregeringer gjøres i klient med JSON‑parsing.

### 4. Foreslått målarkitektur

#### 4.1 Datamodell

- `Item`: Felles felter (id, name, userId, categoryId, locationId, totals, imageUrl, osv.).
- `ItemRelation` (ny/tydeliggjøres): `fromItemId`, `toItemId`, `relationType: enum`.
  - Eksempler: `MASTER_OF`, `BATCH_OF`, `COLOR_OF`, `CHILD_OF`, `ATTACHMENT_OF`.
- `CategorySchema` (kode, ikke DB): Zod‑skjema per kategori for `categoryData` + genererte TypeScript‑typer.
- Normalisering av “hot fields”: Der vi ofte filtrerer/sorterer (f.eks. `colorCode`, `purchaseDate`) vurderes egne kolonner.

#### 4.2 Hierarki og regler

- Regler lagres som eksplisitte tillatte `parentType -> childType` kanter.
- Validering ved lagring: bygg en graf og kjør syklussjekk (DAG) → blokkér ved syklus.
- Klare forhåndsdefinerte hierarkiprofiler (valgfritt), f.eks. `ROOM→SHELF→BOX→ITEM`.

#### 4.3 Services og API

- Opprett services: `itemsService`, `locationsService`, `yarnService`, `hierarchyService`.
- Routere (tRPC) blir tynne: valider input, kall service, returnér view‑modell.
- Aggregeringer flyttes til services/DB (SQL/Prisma aggregater) i stedet for klient.

#### 4.4 Caching og invalidasjon

- Standardiserte “invalidate utils” pr. domene. Eksempel:
  - `invalidateAfterBatchCreate(masterId)`
  - `invalidateAfterColorCreate(masterId)`
- Faner/lister: `staleTime: 0` når ferskhet er kritisk (f.eks. “Farger”); ellers balansert `staleTime` + bakgrunnsrefetch.

#### 4.5 Søk og analyser

- Meilisearch som sekundær indeks for raskt søk og filtrering.
- Egen index per kategori + denormaliserte “views” (f.eks. master med totals og synlige batch‑felter).
- API‑endepunkter for aggregeringer (totalt antall, verdi, per periode, topp‑N, osv.).

### 5. Detaljert plan per fase

#### Fase 1 – Fundamentet (relasjoner, hierarki, skjema)

1) Relasjonstype
- Introduser `relationType` (enum) i kode/DB (evt. bruk eksisterende relasjonstabell om den finnes; hvis ikke – modellér via `relatedItems` med typefelt i `categoryData` som midlertidig løsning).
- Migrér garn: MASTER_OF (master→batch), COLOR_OF (master↔farge), BATCH_OF (farge↔batch) der det passer.
- Oppdater services/wizard til å bruke `colorId`/`masterId` entydig.

2) Acyklisk hierarki
- `hierarchyService.validateAcyclic(rules)` ved lagring i `settings/hierarchy`.
- Pass på back‑compat for eksisterende regler (finn og bryt sykluser).

3) Skjema per kategori
- `categorySchemas.ts`: Zod‑skjema per kategori; generér TS‑typer.
- `DynamicFormFields` leser skjema og bygger felter automatisk (label, inputtype, enum, hjelpetekster).
- Valider i tRPC før skriving til DB.

4) Caching‑policy grunnlag
- Etabler konvensjon for invalidasjon etter mutasjoner i items/yarn/locations.
- Faner som “Farger” settes til `refetchOnMount: true`, `staleTime: 0`.

Leveranser Fase 1:
- Nye services (skjeletter) + første flytting av logikk fra router.
- Relasjonstype i bruk i garnløpet (wizard, dashboard, detaljer).
- Acyklussjekk i hierarki.
- Zod‑skjema for 2–3 viktigste kategorier (inkl. garn).

#### Fase 2 – Query‑lag, søk og aggregeringer

- Flytt aggregeringer til services (totals, per farge, per master, per lokasjon).
- Meilisearch full sync (on‑write triggers) + søk i UI bruker index først.
- Stabiliser view‑modeller (DTO’er) for lister og detaljer.

Leveranser Fase 2:
- Nye aggregerte endepunkter.
- Meilisearch brukes i “Avansert søk”, garnoversikt og globale søk.

#### Fase 3 – Normalisering og datahygiene

- Script for deduplisering av farger (case‑insensitivt navn + kode); etabler “single source of truth”.
- Flytt ofte brukte felter ut av `categoryData` til kolonner (kun der lønnsomt).
- Datareparasjoner (migreringer/backfill) med sikre rollbacker.

Leveranser Fase 3:
- Konsistent fargemodell med `colorId` brukt gjennomgående.
- Redusert avhengighet til JSON‑parsing.

#### Fase 4 – UX/ytelse/testing

- Wizard‑forbedringer: tydelige presets (id‑first), bedre feilmeldinger, loading.
- Virtuelle lister for store datamengder.
- Bedre bildepipeline (thumbnails, mime‑validering, caching, fallback).
- Testpakke:
  - Contract‑tester for tRPC.
  - E2E for kritiske flyter: master→farge→batch; filter+bulk; hierarkiregler.
  - Lighthouse‑/ytelsestester på nøkkelsider.

Leveranser Fase 4:
- Jevn og rask UI‑opplevelse.
- Høyere kvalitet og enklere feilsøking.

### 6. Risiko og mitigasjon

- **Migrasjoner**: Gjør små, reversible steg. Feature‑flagging ved behov.
- **Bakoverkompabilitet**: Oppretthold lesing av gammel struktur midlertidig; bygg konverterere.
- **Ytelse**: Test aggregeringer mot realistiske datamengder; profiler queries.

### 7. Suksesskriterier

- Ingen sirkulære hierarkier kan lagres.
- Konsistent bruk av `colorId`/relasjonstyper i garnflyt.
- Skjema‑validering hindrer “skitne” data.
- Lister (som “Farger”) viser fersk og riktig data uten manuelt refresh.
- Søk/agg er raske og presise.

### 8. Konkrete neste steg (operasjonelle)

1) Opprett `categorySchemas.ts` og definer skjema for: Garn Master, Garn Farge, Garn Batch.
2) Opprett `hierarchyService.validateAcyclic()` og kall den ved lagring av regler.
3) Legg til `relationType` i relasjonene (kode/DB); migrer garnrelasjoner.
4) Lag `invalidateAfter*` utils og bruk dem i mutasjoner.
5) Flytt batch/farge‑logikk til `yarnService` (router blir tynn).
6) Sett opp Meilisearch sync (om ikke aktivt) og klargjør index‑mappinger.

—

Dette dokumentet oppdateres fortløpende etter hvert som implementasjonen skrider frem.


