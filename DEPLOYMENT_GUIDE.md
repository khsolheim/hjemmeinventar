# 🚀 Printing System - Deployment Guide

## 📋 Forutsetninger

### System Requirements
- **Node.js**: v18.0.0 eller nyere
- **npm/pnpm**: pnpm anbefales for raskere installasjon
- **Database**: SQLite for utvikling, PostgreSQL for produksjon
- **DYMO Connect**: v8.7.4 eller nyere (for DYMO-skrivere)

### Nettverkskrav
- Port 3000 (Next.js development server)
- Port 41951 (DYMO Connect Web Service)
- Skrivere må være tilkoblet samme nettverk (for nettverksskrivere)

## 🔧 Installasjon

### 1. Klone og installer avhengigheter
```bash
# Klone repository
git clone <your-repo-url>
cd hjemmeinventar

# Installer avhengigheter
pnpm install

# Eller med npm
npm install
```

### 2. Database setup
```bash
# Generer Prisma client
npx prisma generate

# Kjør database migrations
npx prisma db push

# Seed database med initial data
npx tsx prisma/seed.ts
```

### 3. Miljøvariabler
Opprett `.env.local` fil i prosjektets rot:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="din-sikre-secret-her"
NEXTAUTH_URL="http://localhost:3000"

# Printing System
DYMO_PRINT_API_URL="http://localhost:3000/api/printing"
ENABLE_PRINTING_SYSTEM="true"
PRINTING_DEBUG_MODE="true"

# AI/ML Features (valgfritt)
OPENAI_API_KEY="din-openai-key"
ENABLE_AI_FEATURES="false"

# Multi-tenant (for produksjon)
DEFAULT_TENANT_SUBDOMAIN="default"
ENABLE_MULTI_TENANT="false"
```

## 🖨️ DYMO Printer Setup

### 1. Installer DYMO Connect
```bash
# Last ned fra https://www.dymo.com/support?cfid=DYMO-Connect-for-Desktop
# Eller automatisk installasjon:
```

**Windows:**
- Last ned DYMO Connect fra offisiell nettside
- Installer og start tjenesten
- Kontroller at Web Service kjører på port 41951

**macOS:**
- Last ned DYMO Connect fra App Store eller offisiell nettside
- Gi nødvendige tillatelser for USB/nettverk tilgang
- Start DYMO Connect

**Linux:**
- DYMO Connect er ikke offisielt støttet
- Bruk CUPS med generiske label printer drivers
- Eller kjør DYMO Connect i Wine

### 2. Verifiser DYMO-tilkobling
```bash
# Test DYMO Web Service
curl http://localhost:41951/DYMO/DLS/Printing/Check

# Forventet respons: {"StatusDescription":"Ready","Status":0}
```

### 3. Koble til skrivere
1. **USB-skrivere**: Koble til og vent på automatisk gjenkjennelse
2. **Nettverksskrivere**: Konfigurer IP-adresse i DYMO Connect
3. **Bluetooth-skrivere**: Par via OS innstillinger først

## 🚀 Start Development Server

```bash
# Start Next.js development server
pnpm dev

# Eller med npm
npm run dev

# Server starter på http://localhost:3000
```

## 📝 Første bruk

### 1. Åpne applikasjonen
Naviger til `http://localhost:3000/printing`

### 2. Oppdag skrivere
1. Klikk "Oppdater skrivere" i Print Wizard eller Printer Profiles
2. Systemet vil automatisk finne alle tilkoblede DYMO-skrivere
3. Skrivere lagres i databasen for fremtidig bruk

### 3. Test utskrift
1. Gå til `/printing/printers`
2. Velg en skriver og klikk "Test utskrift"
3. En test-etikett skal skrives ut

### 4. Lag din første mal
1. Gå til `/printing/templates/editor`
2. Bruk template-editoren til å designe en etikett
3. Lagre malen

### 5. Skriv ut via Print Wizard
1. Gå til `/printing/wizard`
2. Følg trinnene:
   - Velg mal
   - Fyll ut data
   - Velg skriver
   - Bekreft og skriv ut

## 🔧 Produksjonsdrift

### Database Migration til PostgreSQL
```bash
# Oppdater DATABASE_URL i .env
DATABASE_URL="postgresql://user:password@localhost:5432/printing_system"

# Kjør migrations
npx prisma migrate deploy

# Seed production data
NODE_ENV=production npx tsx prisma/seed.ts
```

### Environment Variables for Production
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_SECRET="supersecret-production-key-256-bit"
NEXTAUTH_URL="https://yourdomain.com"

# Printing System
DYMO_PRINT_API_URL="https://yourdomain.com/api/printing"
ENABLE_PRINTING_SYSTEM="true"
PRINTING_DEBUG_MODE="false"

# Security
ENABLE_AUDIT_LOGGING="true"
ENABLE_RATE_LIMITING="true"

# Multi-tenant
ENABLE_MULTI_TENANT="true"
DEFAULT_TENANT_SUBDOMAIN="default"

# Performance
ENABLE_CACHING="true"
REDIS_URL="redis://localhost:6379"
```

### Build for Production
```bash
# Build optimized production bundle
pnpm build

# Start production server
pnpm start
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/printing_system
      - NEXTAUTH_SECRET=supersecret
    depends_on:
      - db
      - redis
    
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=printing_system
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 🔐 Sikkerhet

### Authentication Setup
```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Implement your auth logic
        return user
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    }
  }
})
```

### RBAC Configuration
```typescript
// lib/auth/permissions.ts
export const PERMISSIONS = {
  PRINT_CREATE: 'print:create',
  PRINT_MANAGE: 'print:manage',
  PRINTER_ADMIN: 'printer:admin',
  TEMPLATE_CREATE: 'template:create',
  TEMPLATE_SHARE: 'template:share',
  ANALYTICS_VIEW: 'analytics:view',
  APPROVAL_MANAGE: 'approval:manage'
}

export const ROLES = {
  USER: ['print:create', 'template:create'],
  OPERATOR: ['print:create', 'print:manage', 'template:create'],
  ADMIN: ['*'] // All permissions
}
```

## 📊 Monitoring & Logging

### Application Monitoring
```typescript
// lib/monitoring/metrics.ts
export class PrintingMetrics {
  static incrementPrintJobs() {
    // Implement metrics collection
  }
  
  static recordPrintDuration(duration: number) {
    // Record performance metrics
  }
  
  static incrementErrors(errorType: string) {
    // Track error rates
  }
}
```

### Health Check Endpoint
```typescript
// pages/api/health.ts
export default async function handler(req: NextRequest) {
  const checks = {
    database: await checkDatabase(),
    dymo: await checkDymoService(),
    printers: await checkPrinters()
  }
  
  const isHealthy = Object.values(checks).every(check => check.status === 'ok')
  
  return NextResponse.json(checks, { 
    status: isHealthy ? 200 : 503 
  })
}
```

## 🛠️ Troubleshooting

### Vanlige problemer

**1. DYMO Connect ikke tilgjengelig**
```bash
# Sjekk om tjenesten kjører
curl http://localhost:41951/DYMO/DLS/Printing/Check

# Windows: Start DYMO Connect manuelt
# macOS: Sjekk Security & Privacy innstillinger
# Linux: Installer Wine eller bruk CUPS
```

**2. Skrivere ikke funnet**
```bash
# Sjekk USB-tilkobling
lsusb | grep DYMO

# Sjekk nettverkstilkobling
ping <printer-ip>

# Test fra DYMO Connect
# Åpne DYMO Connect og se om skriver vises
```

**3. Database tilkoblingsproblemer**
```bash
# Sjekk database URL
echo $DATABASE_URL

# Test tilkobling
npx prisma db pull

# Reset database hvis nødvendig
npx prisma migrate reset
```

**4. Tømme print-kø**
```typescript
// Via tRPC i browser console
await trpc.printing.clearPrintQueue.mutate()

// Eller direkte i database
DELETE FROM PrintJob WHERE status IN ('QUEUED', 'FAILED');
```

### Debug Mode
```env
# Aktiver debug logging
PRINTING_DEBUG_MODE="true"
DYMO_DEBUG="true"
NEXT_DEBUG="true"
```

### Logging
```typescript
// lib/logging/printer-logger.ts
export class PrinterLogger {
  static logPrintAttempt(data: PrintAttempt) {
    console.log('Print attempt:', data)
    // Send to monitoring service
  }
  
  static logError(error: Error, context: any) {
    console.error('Printing error:', error, context)
    // Send to error tracking service
  }
}
```

## 📈 Skalering

### Horizontal Scaling
- Bruk load balancer for flere app-instanser
- Delt Redis for session storage
- PostgreSQL med read replicas

### Printer Load Balancing
```typescript
// lib/printing/load-balancer.ts
export class PrinterLoadBalancer {
  static selectOptimalPrinter(requirements: PrintRequirements) {
    // Implement printer selection logic
    // Based on queue length, capabilities, location
  }
}
```

### Caching Strategy
```typescript
// lib/caching/print-cache.ts
export class PrintCache {
  static async cacheTemplate(template: Template) {
    // Cache frequently used templates
  }
  
  static async cachePrinterStatus(status: PrinterStatus) {
    // Cache printer status with TTL
  }
}
```

## 🎯 Best Practices

### Template Design
- Bruk relative størrelser når mulig
- Test på alle målskrivere
- Valider data før utskrift
- Bruk versjonskontroll for templates

### Print Job Management
- Implementer retry-logic for failed jobs
- Set reasonable timeouts
- Monitor print queue størrelse
- Implement job prioritering

### Security
- Validér alle input data
- Implement rate limiting
- Audit alle print-operasjoner
- Krypter sensitive data

### Performance
- Cache printer status
- Batch multiple labels
- Optimize template rendering
- Monitor resource usage

---

## 🎉 Gratulerer!

Ditt printing-system er nå produksjonsklart! 

**Neste steg:**
1. Deploy til staging environment
2. Test med faktiske skrivere og brukere
3. Implementer overvåking og alerting
4. Skalér etter behov

**For support:** Sjekk troubleshooting-seksjonen eller dokumentasjonen.