# Testing av Garn Master/Batch System

## 🚀 Quick Start Testing

### Steg 1: Initialiser nye kategorier

For å teste systemet må du først opprette de nye kategoriene:

```bash
# Start utviklingsserveren
npm run dev

# Gå til admin-panel eller kjør direkte via tRPC
# Dette vil opprette "Garn Master" og "Garn Batch" kategorier
```

### Steg 2: Test API Endpoints

Du kan teste endepunktene via tRPC-panelet eller direkte i koden:

#### A. Opprett en Garn Master

```typescript
// Via tRPC client
const master = await trpc.yarn.createMaster.mutate({
  name: "Drops Baby Merino",
  locationId: "din_lokasjon_id", 
  producer: "Garnstudio",
  composition: "100% Extrafine Merino Wool",
  weight: "50g",
  yardage: "175m",
  needleSize: "2.5-4.0mm",
  gauge: "21 sts = 10cm på p 3.5",
  careInstructions: "Håndvask 30°C",
  store: "Hobbii",
  notes: "Myk og deilig babygarn"
})
```

#### B. Legg til Batch for Master

```typescript
// Første batch - rosa
const batch1 = await trpc.yarn.createBatch.mutate({
  masterId: master.id,
  name: "Baby Merino Rosa - LOT001", 
  locationId: "din_lokasjon_id",
  batchNumber: "LOT2024001",
  color: "Light Pink",
  colorCode: "#FFB6C1", 
  quantity: 5,
  pricePerSkein: 89.50,
  condition: "Ny",
  notes: "Kjøpt til babyteppe-prosjekt"
})

// Andre batch - blå
const batch2 = await trpc.yarn.createBatch.mutate({
  masterId: master.id,
  name: "Baby Merino Blå - LOT002",
  locationId: "din_lokasjon_id", 
  batchNumber: "LOT2024002",
  color: "Navy Blue",
  colorCode: "#000080",
  quantity: 3, 
  pricePerSkein: 89.50,
  condition: "Ny"
})
```

#### C. Hent data tilbake

```typescript
// Hent alle masters
const masters = await trpc.yarn.getAllMasters.query({ 
  limit: 10, 
  offset: 0 
})

// Hent batches for master
const batches = await trpc.yarn.getBatchesForMaster.query({
  masterId: master.id
})

// Hent aggregerte totaler
const totals = await trpc.yarn.getMasterTotals.query({
  masterId: master.id  
})
console.log(totals) 
// Output: { totalSkeins: 8, availableSkeins: 8, totalValue: 716, batchCount: 2 }
```

## 🔍 Verifikasjon

### 1. Sjekk Database
Etter å ha kjørt testene, sjekk at:
- Master item er opprettet med riktig kategori
- Batch items er opprettet og linket til master
- `relatedItems` relasjon fungerer

### 2. Sjekk Data-struktur

**Master item skal ha:**
```json
{
  "category": { "name": "Garn Master" },
  "categoryData": {
    "producer": "Garnstudio",
    "composition": "100% Extrafine Merino Wool",
    "weight": "50g",
    // ... andre felles data
  },
  "relatedTo": [/* array av batch items */]
}
```

**Batch items skal ha:**
```json
{
  "category": { "name": "Garn Batch" }, 
  "categoryData": {
    "batchNumber": "LOT2024001",
    "color": "Light Pink",
    "quantity": 5,
    "masterItemId": "master_id",
    // ... andre batch-spesifikke data
  },
  "relatedItems": [/* master item */]
}
```

## 🧪 Test-scenarios

### Scenario 1: Registrer komplett garntype
1. Opprett Master med alle felles data
2. Legg til 3 forskjellige batches (ulike farger)
3. Verifiser at totals beregnes riktig
4. Sjekk at alle batch items linker til master

### Scenario 2: Utvid eksisterende garntype  
1. Start med Master + 1 batch
2. Legg til ny batch med annen farge
3. Verifiser at begge batches vises under samme master
4. Sjekk at totals oppdateres

### Scenario 3: Søk og filter
1. Opprett flere masters med forskjellige produsenter
2. Test søk-funksjonalitet i getAllMasters
3. Verifiser at søk fungerer på navn og beskrivelse

## 🚨 Vanlige problemer

### Feil: "Garn Master kategori ikke funnet"
**Løsning:** Kjør `categories.initializeDefaults()` først

### Feil: "Master tilhører ikke brukeren"  
**Løsning:** Sjekk at userId stemmer i både master og batch opprettelse

### Batch vises ikke under master
**Løsning:** Sjekk at `relatedItems` relasjonen er opprettet riktig

## 📊 Forventet Output

Etter vellykket testing bør du ha:

```
Database:
├── 1 Garn Master item
│   ├── Kategori: "Garn Master" 
│   ├── Felles data i categoryData
│   └── relatedTo: [batch1, batch2]
│
└── 2 Garn Batch items
    ├── Kategori: "Garn Batch"
    ├── Unike data i categoryData  
    └── relatedItems: [master]

Aggregerte data:
├── totalSkeins: 8
├── availableSkeins: 8
├── totalValue: 716 kr
└── batchCount: 2
```

## ✅ Test Checklist

- [ ] Nye kategorier opprettet vellykket
- [ ] Master item opprettet med riktige data  
- [ ] Batch items linket til master
- [ ] Aggregerte totaler beregnes riktig
- [ ] Søk-funksjonalitet fungerer
- [ ] relatedItems relasjoner er korrekte
- [ ] Ingen linter-feil eller build-problemer

## 🎯 Neste Steg

Etter vellykket testing av Fase 1, kan vi begynne på:
- UI-komponenter for brukergrensesnitt
- Avanserte søk- og filterfunksjoner
- Prosjekt-integrasjon
- Bulk-operasjoner

**Happy testing! 🧶**
