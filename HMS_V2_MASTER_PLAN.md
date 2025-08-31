# HMS Inventory V2 - Master Development Plan

## 📋 Prosjekt Oversikt

### Visjon
Et moderne, modulært inventory management system med fokus på brukeropplevelse, fleksibilitet og skalerbarhet.

### Kjerneprinsipper
- **Mobile-first** design for sluttbrukere
- **Modulær arkitektur** - aktiver/deaktiver funksjoner
- **Multi-tenancy** - støtte for flere husstander/organisasjoner
- **Offline-first** - fungerer uten internett
- **Minimalistisk UI** med progressive disclosure

## 🏗️ Teknisk Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Språk**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui (eller alternativ)
- **State**: Zustand + React Query
- **PWA**: next-pwa for offline support

### Backend
- **Database**: PostgreSQL (lokal på VPS)
- **ORM**: Prisma
- **Caching**: Redis
- **File Storage**: MinIO (self-hosted S3)
- **Email**: Resend
- **Auth**: Custom JWT + refresh tokens

### DevOps
- **Hosting**: VPS med Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + custom dashboard
- **Backup**: Automated PostgreSQL + MinIO backup

## 🎯 Moduler & Prioritering

### Fase 1: Core MVP (8 uker)
1. **✅ Brukeradministrasjon & Auth**
   - Registrering/innlogging
   - Admin panel
   - "Login as user" for support

2. **✅ Organisasjoner & Tilgang**
   - Multi-tenancy
   - Rolle-basert tilgang (Admin/Editor/Viewer/Guest)
   - Tidsbaserte tilganger

3. **✅ Inventory Core**
   - Items (gjenstander)
   - Locations (lokasjoner)
   - Categories
   - QR-kode generering

4. **✅ Scanning & Bulk Operations**
   - QR/Barcode scanning via kamera
   - Bulk registrering
   - Quick-add med AI suggestions

### Fase 2: Extended Features (4 uker)
5. **🎨 Label Designer** ⭐ NY!
   - Drag-and-drop editor
   - Dynamiske data-felter
   - Multiple templates
   - Preview med ekte data
   - Export til forskjellige formater

6. **📦 Spesialiserte Moduler**
   - Yarn/Craft inventory
   - 3D Filament tracking
   - Mat/Grocery modul

7. **🔄 Utlån & Deling**
   - Låne ut items
   - Tracking & påminnelser
   - Deling mellom husstander

### Fase 3: Avanserte Features (4 uker)
8. **📊 Lister & Rapporter**
   - Custom lister
   - Filter/sortering
   - Export (CSV, PDF)

9. **🤖 AI Features**
   - Smart kategorisering
   - Natural language search
   - Inventory insights

10. **🔌 Integrasjoner**
    - Import/Export
    - Backup til cloud
    - API for tredjeparter

## 📱 Brukerflyter

### Onboarding Flow
```
1. Registrer → 2. Velg type (Hjem/Hobby/Business) → 
3. Opprett første lokasjon → 4. Scan/legg til første item → 
5. Inviter familie (valgfritt)
```

### Scanning Flow
```
1. Åpne scanner → 2. Scan QR/Barcode → 
3a. Eksisterende: Vis/flytt/rediger
3b. Ny: Quick-add med AI-forslag → 
4. Bekreft → 5. Fortsett eller avslutt
```

### Label Design Flow ⭐
```
1. Velg mal/start blankt → 2. Drag-drop elementer → 
3. Bind data-felter → 4. Preview med ekte items → 
5. Lagre mal → 6. Print enkelt/bulk
```

## 🗓️ Detaljert Utviklingsplan

### Sprint 1: Foundation (Uke 1-2)
- [ ] Prosjektoppsett med alle dependencies
- [ ] Database schema design
- [ ] Prisma setup med migrations
- [ ] Basic auth system (register/login)
- [ ] Admin panel skeleton
- [ ] Docker setup for lokal utvikling

### Sprint 2: Multi-tenancy (Uke 3-4)
- [ ] Organization/Household modell
- [ ] User-Organization relationships
- [ ] Role-based access control (RBAC)
- [ ] Invitation system
- [ ] Guest/temporary access

### Sprint 3: Core Inventory (Uke 5-6)
- [ ] Items CRUD med bilder
- [ ] Locations med hierarki
- [ ] Categories system
- [ ] QR-kode generering
- [ ] Public location URLs

### Sprint 4: Mobile & Scanning (Uke 7-8)
- [ ] PWA setup
- [ ] Camera-based scanning
- [ ] Bulk registration flow
- [ ] Offline support
- [ ] Real-time sync

### Sprint 5: Label Designer (Uke 9-10) ⭐
- [ ] Canvas-based designer
- [ ] Drag-drop interface
- [ ] Element library (text, QR, barcode, shapes)
- [ ] Data binding system
- [ ] Template management
- [ ] Print preview & export

### Sprint 6: Specialized Modules (Uke 11-12)
- [ ] Module activation system
- [ ] Yarn/Craft specific fields
- [ ] 3D Filament tracking
- [ ] Food/Expiry tracking
- [ ] Module-specific UI components

### Sprint 7: Polish & Launch Prep (Uke 13-14)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Backup system
- [ ] Monitoring setup
- [ ] Documentation

### Sprint 8: Advanced Features (Uke 15-16)
- [ ] AI integration prep
- [ ] Advanced search
- [ ] Custom reports
- [ ] API development
- [ ] Migration tools

## 💰 Monetization Plan

### Pricing Tiers
1. **Free**
   - 100 items
   - 1 husstand
   - Basis moduler

2. **Familie** (49 kr/mnd)
   - Ubegrenset items
   - 3 husstander
   - Alle moduler
   - 5 brukere

3. **Pro** (99 kr/mnd)
   - Alt i Familie +
   - Ubegrenset brukere
   - API tilgang
   - Priority support

4. **Business** (Custom)
   - Multi-organization
   - SLA
   - Custom features

### Module Pricing
- 14 dagers gratis prøveperiode
- Individual modul: 19 kr/mnd
- Bundle discounts

## 🔐 Sikkerhet & Privacy

- End-to-end encryption for sensitive data
- GDPR compliant
- Regular security audits
- Automated backups
- Data export on demand

## 📊 Success Metrics

- User activation rate > 80%
- Daily active users > 40%
- <2s load time on mobile
- <5 min onboarding time
- >90% scanning success rate

## 🚀 Launch Strategy

1. **Alpha** (Uke 14): Intern testing
2. **Beta** (Uke 16): 50 inviterte brukere
3. **Soft Launch** (Uke 18): Åpen registrering
4. **Marketing Push** (Uke 20): Full launch

## 📝 Notater & Beslutninger

- Start med PostgreSQL, kan migrere senere om nødvendig
- Label designer er kritisk differentiator
- Offline-first fra dag 1
- Progressive web app, ingen native apps initially
- Module system må være fleksibelt for fremtidige utvidelser

---

**Status**: Ready to start Sprint 1
**Sist oppdatert**: ${new Date().toISOString()}
