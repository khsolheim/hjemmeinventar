# 🚀 Hjemmeinventar - Quick Deploy Guide

**Få applikasjonen live på 10 minutter!**

## 📋 Prerequisites

Du trenger bare:
- En nettleser
- GitHub/Google konto

## 🗄️ Step 1: Database (3 minutter)

### Opprett Neon Database:
1. Gå til **[console.neon.tech](https://console.neon.tech)**
2. **Sign up** med GitHub
3. **Create Project**:
   - Name: `hjemmeinventar`
   - Region: `Europe (Frankfurt)`
   - PostgreSQL: `16`
4. **Kopier DATABASE_URL** (starter med `postgresql://...`)

## 🌐 Step 2: Deploy til Vercel (5 minutter)

### Upload Applikasjon:
1. Gå til **[vercel.com](https://vercel.com)**
2. **Sign up** med GitHub
3. **Add New Project** → **Browse All Git Repositories**
4. **Import Git Repository** eller **Upload zip** → Velg `hjemmeinventar-deployment.zip`

### Konfigurer:
- **Project Name**: `hjemmeinventar`
- **Framework**: Next.js (auto-detect)
- **Build Command**: `npm run build`
- **Install Command**: `pnpm install`

### Environment Variables:
Klikk **Environment Variables** og legg til:

```
DATABASE_URL = (din Neon DATABASE_URL)
NEXTAUTH_SECRET = super-secure-secret-at-least-32-characters-long
NEXTAUTH_URL = https://ditt-prosjekt.vercel.app
```

### Deploy:
Klikk **Deploy** - tar 2-3 minutter!

## 🔧 Step 3: Setup Database (2 minutter)

Når Vercel deployment er ferdig:

### Lokal setup (hvis du vil kjøre migrasjoner lokalt):
```bash
# Sett DATABASE_URL som environment variable
export DATABASE_URL="(din Neon connection string)"

# Kjør setup script
./scripts/setup-production-db.sh
```

### ELLER via Vercel Functions (anbefalt):
1. Gå til din Vercel app URL
2. Gå til `/api/migrate` (vil trigger migrasjoner automatisk)

## ✅ Step 4: Test Applikasjonen

### Automatisk test:
```bash
./scripts/test-production.sh https://ditt-prosjekt.vercel.app
```

### Manuell test:
1. **Gå til din Vercel URL**
2. **Test sign up/sign in**
3. **Opprett lokasjon**
4. **Legg til gjenstand**
5. **Test QR scanner**
6. **Installer som PWA på mobil**

## 🎉 Du er ferdig!

Din hjemmeinventar-app er nå live på:
`https://ditt-prosjekt.vercel.app`

### Features som fungerer:
- ✅ Bruker registrering og autentisering
- ✅ Lokasjon og gjenstand management
- ✅ QR-kode generering
- ✅ Kategori-spesifikke felt
- ✅ PWA installasjon
- ✅ Responsiv design
- ✅ Offline support

## 🔧 Troubleshooting

### Database connection issues:
- Sjekk at DATABASE_URL er riktig satt i Vercel
- Sørg for at `?sslmode=require` er på slutten av URL-en

### Build failures:
- Sjekk environment variables i Vercel
- Trigger redeploy fra Vercel dashboard

### App ikke tilgjengelig:
- Vent 2-3 minutter for initial cold start
- Sjekk Vercel Functions logs for errors

## 📞 Support

- Vercel: https://vercel.com/docs
- Neon: https://docs.neon.tech
- Next.js: https://nextjs.org/docs
