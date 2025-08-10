# 🚀 Hjemmeinventar - Deployment Guide

## Overview
Dette dokumentet beskriver hvordan du deployer Hjemmeinventar-applikasjonen til produksjon med Neon PostgreSQL og Vercel.

## Forutsetninger

### 1. Database (Neon PostgreSQL)
1. Gå til [console.neon.tech](https://console.neon.tech)
2. Opprett konto med GitHub/Google
3. Klikk "Create Project"
4. Velg:
   - **Region**: Europe (Frankfurt) 
   - **Navn**: `hjemmeinventar`
   - **PostgreSQL**: versjon 16
5. Kopier connection string (starter med `postgresql://`)

### 2. Hosting (Vercel)
1. Gå til [vercel.com](https://vercel.com)
2. Logg inn med GitHub
3. Installer Vercel CLI: `npm i -g vercel`
4. Logg inn: `vercel login`

### 3. OAuth (Google - valgfritt)
1. Gå til [console.cloud.google.com](https://console.cloud.google.com)
2. Opprett nytt prosjekt
3. Aktiver Google+ API
4. Opprett OAuth 2.0 credentials
5. Legg til authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-app.vercel.app/api/auth/callback/google`

## Deployment Steps

### Steg 1: Forbered Environment Variables
Opprett `.env.local` med produksjonsverdier:

```bash
# Database (din Neon connection string)
DATABASE_URL="postgresql://username:password@host.neon.tech/hjemmeinventar?sslmode=require"

# NextAuth (generer sikre verdier)
NEXTAUTH_SECRET="generer-en-sikker-32+ karakter-streng"
NEXTAUTH_URL="https://din-app.vercel.app"

# Google OAuth (valgfritt)
GOOGLE_CLIENT_ID="din-google-client-id"
GOOGLE_CLIENT_SECRET="din-google-client-secret"
```

### Steg 2: Database Migrasjoner
```bash
# 1. Bytt til produksjons-schema
cp prisma/schema.prod.prisma prisma/schema.prisma

# 2. Generer Prisma client
npx prisma generate

# 3. Kjør migrasjoner mot Neon database
npx prisma migrate deploy

# 4. Seed kategorier (valgfritt)
npm run db:seed
```

### Steg 3: Deploy til Vercel

#### Automatisk deployment (anbefalt):
```bash
./scripts/deploy.sh
```

#### Manuell deployment:
```bash
# 1. Bygg applikasjonen
npm run build

# 2. Deploy
vercel --prod
```

### Steg 4: Konfigurer Vercel Environment Variables
I Vercel dashboard (vercel.com/dashboard):

1. Velg ditt prosjekt
2. Gå til Settings → Environment Variables
3. Legg til følgende variabler:

| Variable | Value | Environment |
|----------|--------|-------------|
| `DATABASE_URL` | Din Neon connection string | Production |
| `NEXTAUTH_SECRET` | Sikker 32+ karakter streng | Production |
| `NEXTAUTH_URL` | https://din-app.vercel.app | Production |
| `GOOGLE_CLIENT_ID` | Google OAuth ID (valgfritt) | Production |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret (valgfritt) | Production |

### Steg 5: Test Deployment
1. Gå til din Vercel URL
2. Test sign-up/sign-in funksjonalitet
3. Opprett lokasjon og gjenstand
4. Test QR scanner
5. Verifiser at data lagres korrekt

## Post-Deployment

### Domain Setup (valgfritt)
1. Kjøp domene (f.eks. Cloudflare)
2. I Vercel dashboard → Settings → Domains
3. Legg til ditt custom domain
4. Oppdater `NEXTAUTH_URL` environment variable

### Monitoring
- Vercel gir automatisk monitoring og logs
- Database monitoring i Neon dashboard
- Sett opp error tracking (Sentry anbefales)

### Backup
- Neon tar automatiske backups
- Eksporter data regelmessig: `pg_dump`

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
npx prisma db push --preview-feature
```

### Build Errors
```bash
# Clear cache og rebuild
npm run build --force
```

### Environment Variable Issues
- Sjekk at alle required variables er satt i Vercel
- Redeploy etter endringer: `vercel --prod`

### Migration Issues
```bash
# Reset database (NB: Sletter all data!)
npx prisma migrate reset --force
npx prisma migrate deploy
npm run db:seed
```

## Sikkerhet

### Produksjon Checklist
- [ ] Sikre NEXTAUTH_SECRET (32+ random characters)
- [ ] HTTPS enforced (Vercel gjør dette automatisk)
- [ ] Database SSL enabled (Neon default)
- [ ] OAuth callback URLs korrekt satt
- [ ] Environment variables ikke eksponert i frontend
- [ ] Error handling ikke leak sensitive data

### Oppdateringer
```bash
# Regelmessige oppdateringer
npm update
npx prisma migrate deploy
vercel --prod
```

## Support
- Neon: [docs.neon.tech](https://docs.neon.tech)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- Prisma: [prisma.io/docs](https://prisma.io/docs)
