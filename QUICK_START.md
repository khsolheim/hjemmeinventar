# ⚡ Quick Start Guide - 5 minutters oppsett

## 🚀 Kom i gang på 5 minutter!

### 1️⃣ **Start systemet** (1 min)
```bash
# Installer avhengigheter
pnpm install

# Setup database og seed data
npx prisma db push && npx tsx prisma/seed.ts

# Start development server
pnpm dev
```

### 2️⃣ **Åpne printing-systemet** (30 sek)
Gå til: `http://localhost:3000/printing`

### 3️⃣ **Koble til DYMO-skriver** (2 min)

**Har du DYMO Connect installert?**
- ✅ **JA**: Hopp til steg 4
- ❌ **NEI**: Last ned fra [dymo.com](https://www.dymo.com/support?cfid=DYMO-Connect-for-Desktop) og installer

**Test DYMO-tilkobling:**
```bash
# Sjekk om DYMO Connect kjører
curl http://localhost:41951/DYMO/DLS/Printing/Check
```

### 4️⃣ **Oppdag dine skrivere** (30 sek)
1. Gå til **Skrivere** i navigasjon
2. Klikk **"Oppdater skrivere"**
3. Dine DYMO-skrivere vises automatisk

### 5️⃣ **Test utskrift** (1 min)
1. Velg en skriver fra listen
2. Klikk **"Test utskrift"**
3. En test-etikett skrives ut! 🎉

---

## 🎯 Neste steg - Lag din første etikett

### Via Print Wizard (anbefalt for nybegynnere)
1. Gå til **Print Wizard** i navigasjon
2. Følg trinnene:
   - **Steg 1**: Velg mal (eller lag ny)
   - **Steg 2**: Fyll ut data
   - **Steg 3**: Velg skriver
   - **Steg 4**: Skriv ut!

### Via Template Editor (for avanserte brukere)
1. Gå til **Templates** → **Editor**
2. Design din egen etikett
3. Lagre og test

---

## 📝 Hurtig referanse

| Funksjon | URL | Beskrivelse |
|----------|-----|-------------|
| 🎯 **Dashboard** | `/printing` | Oversikt og statistikk |
| 🧙 **Print Wizard** | `/printing/wizard` | Guided utskrift |
| 📄 **Templates** | `/printing/templates` | Administrer maler |
| 🎨 **Template Editor** | `/printing/templates/editor` | Design egne maler |
| 🖨️ **Skrivere** | `/printing/printers` | Administrer skrivere |
| 📊 **Analytics** | `/printing/analytics` | Statistikk og rapporter |
| ⚙️ **Jobs** | `/printing/jobs` | Print jobs og kø |
| ✅ **Godkjenning** | `/printing/approvals` | Approval workflows |

---

## 🆘 Problemer?

### DYMO Connect ikke funnet
```bash
# Test tilkobling
curl http://localhost:41951/DYMO/DLS/Printing/Check

# Hvis feiler:
# 1. Start DYMO Connect manuelt
# 2. Sjekk at port 41951 er åpen
# 3. Restart DYMO Connect
```

### Skriver ikke funnet
1. Sjekk at skriver er påkoblet (USB/nettverk)
2. Se at skriver vises i DYMO Connect
3. Klikk "Oppdater skrivere" i systemet

### Database feil
```bash
# Reset database
npx prisma migrate reset

# Seed på nytt
npx tsx prisma/seed.ts
```

---

## 🎉 Du er klar!

**Systemet kjører nå og du kan:**
- ✅ Designe etiketter
- ✅ Skrive ut til DYMO-skrivere
- ✅ Administrere print jobs
- ✅ Se analytics og rapporter
- ✅ Sette opp approval workflows

**🚀 Happy printing!**