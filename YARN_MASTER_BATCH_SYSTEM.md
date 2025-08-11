# Garn Master/Batch System - Fase 1 ✅

## Hva er implementert

Vi har bygget grunnmuren for et smart garn-registreringssystem som skiller mellom **felles garndata** og **unike batch-data**.

### 🎯 Løsningsarkitektur

**Master Items:** Inneholder felles data som produsent, sammensetning, vaskeråd, etc.
**Batch Items:** Inneholder unike data som batch-nummer, farge, antall, pris per nøste, etc.

Batch items kobles til Master via det eksisterende `relatedItems` systemet.

## 📋 Ny Kategori-struktur

### Garn Master 🧶
**Formål:** Lagre felles egenskaper for en garntype

**Felter:**
- ✅ Produsent (påkrevd)
- ✅ Sammensetning (påkrevd) 
- ✅ Løpelengde (f.eks. 100m)
- ✅ Vekt (f.eks. 50g)
- ✅ Strikkefasthet (f.eks. 22 masker = 10cm)
- ✅ Anbefalte pinner (f.eks. 4.0mm)
- ✅ Vaskeråd
- ✅ Butikk (hvor garnet vanligvis kjøpes)
- ✅ Notater

### Garn Batch 🎨  
**Formål:** Lagre unike egenskaper per nøste/batch

**Felter:**
- ✅ Batch nummer (påkrevd)
- ✅ Farge (påkrevd)
- ✅ Farge kode (hex eller navn)
- ✅ Antall nøster (påkrevd)
- ✅ Pris per nøste
- ✅ Kjøpsdato
- ✅ Tilstand (Ny/Brukt)
- ✅ Batch-notater
- ✅ Link til Master (automatisk)

## 🔧 API Endepunkter

### Master Operations
```typescript
// Opprett ny garn master
yarn.createMaster({ name, locationId, producer, composition, ... })

// Hent alle masters med aggregert data
yarn.getAllMasters({ limit, offset, search })

// Beregn totaler for en master
yarn.getMasterTotals({ masterId })
```

### Batch Operations  
```typescript
// Opprett ny batch for eksisterende master
yarn.createBatch({ masterId, name, batchNumber, color, quantity, ... })

// Hent alle batches for en master
yarn.getBatchesForMaster({ masterId })

// Hent master for en batch
yarn.getMasterForBatch({ batchId })
```

## 🛠️ Hjelpefunksjoner

### Utils (`/lib/utils/yarn-helpers.ts`)
- ✅ `isYarnMaster()` - Identifiser master items
- ✅ `isYarnBatch()` - Identifiser batch items  
- ✅ `getBatchesForMaster()` - Hent alle relaterte batches
- ✅ `getMasterForBatch()` - Finn master for batch
- ✅ `calculateMasterTotals()` - Beregn aggregerte data
- ✅ `createBatchForMaster()` - Opprett ny batch
- ✅ `createYarnMaster()` - Opprett ny master
- ✅ `syncMasterDataToBatches()` - Sync felles data

## 📊 Smart Features

### Automatisk Datakobling
- Batch items kobles automatisk til Master via `relatedItems`
- Felles data lagres bare én gang i Master
- Unike data lagres individuelt per Batch

### Aggregert Statistikk
- Total antall nøster per garntype
- Tilgjengelig mengde på tvers av alle batches  
- Samlet verdi per garntype
- Batch-telling

### Bakoverkompatibilitet
- Eksisterende "Garn og Strikking" kategori beholdes
- Kan gradvis migrere eksisterende garn til nytt system

## 🚀 Neste Steg (Fase 2)

### UI-komponenter
- [ ] Garn Master Dashboard
- [ ] Batch Management Interface  
- [ ] Wizard for ny garn-registrering
- [ ] Quick-add batch flow

### Smart Features
- [ ] Master data sync til batches
- [ ] Avansert søk på tvers av Master/Batch
- [ ] Farge-basert gruppering
- [ ] Prosjekt-integrasjon

## 💡 Brukseksempel

### Scenario: Registrere "Drops Baby Merino"

**Steg 1:** Opprett Master
```json
{
  "name": "Drops Baby Merino",
  "producer": "Garnstudio", 
  "composition": "100% Extrafine Merino Wool",
  "weight": "50g",
  "yardage": "175m", 
  "needleSize": "2.5-4.0mm",
  "gauge": "21 sts = 10cm",
  "careInstructions": "Håndvask 30°C"
}
```

**Steg 2:** Legg til batches
```json
[
  {
    "masterId": "master_123",
    "batchNumber": "LOT2024001", 
    "color": "Light Pink",
    "colorCode": "#FFB6C1",
    "quantity": 5,
    "pricePerSkein": 89.50
  },
  {
    "masterId": "master_123",
    "batchNumber": "LOT2024002",
    "color": "Navy Blue", 
    "colorCode": "#000080",
    "quantity": 3,
    "pricePerSkein": 89.50
  }
]
```

**Resultat:** 
- 1 Master med felles data
- 8 nøster totalt (5 rosa + 3 blå)
- Samlet verdi: 716 kr
- Kan enkelt legge til nye farger/batches senere

## ✅ Status: Fase 1 Fullført

- [x] Kategori-skjemaer opprettet
- [x] Database-relasjoner etablert  
- [x] API-endepunkter implementert
- [x] Hjelpefunksjoner bygget
- [x] Build-test vellykket
- [x] Bakoverkompatibilitet sikret

**Klart for testing og videre utvikling! 🎉**
