# 📱 HMS iOS App med Capacitor

## Steg-for-steg guide for å lage iOS-app av HMS

### 1. 🚀 Installer Capacitor

```bash
# I HMS-prosjektet
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/camera @capacitor/geolocation @capacitor/push-notifications
```

### 2. ⚙️ Initialiser Capacitor

```bash
npx cap init HMS com.hms.homemanagement
```

### 3. 📱 Legg til iOS platform

```bash
npx cap add ios
```

### 4. 🔧 Konfigurer capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hms.homemanagement',
  appName: 'HMS - Home Management',
  webDir: 'out', // Next.js static export
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff'
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    Geolocation: {
      permissions: ['location']
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
```

### 5. 📦 Oppdater next.config.ts for static export

```typescript
const nextConfig: NextConfig = {
  // Eksisterende config...
  output: 'export', // For Capacitor
  trailingSlash: true,
  images: {
    unoptimized: true // Kreves for static export
  }
}
```

### 6. 🔨 Build og sync

```bash
npm run build
npx cap sync ios
```

### 7. 📱 Åpne i Xcode

```bash
npx cap open ios
```

### 8. 🚀 Kjør på simulator/enhet

I Xcode:
1. Velg simulator eller tilkoblet iPhone
2. Trykk "Run" (▶️)
3. Appen åpnes som native iOS-app!

## 🔧 Native Funksjoner

### Kamera (erstatter web getUserMedia)

```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri
  });
  
  return image.webPath;
};
```

### QR-skanning med native ytelse

```bash
npm install @capacitor-community/barcode-scanner
```

```typescript
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

const scanQR = async () => {
  const result = await BarcodeScanner.startScan();
  if (result.hasContent) {
    return result.content; // QR-kode innhold
  }
};
```

### Push-notifikasjoner

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

const setupPush = async () => {
  await PushNotifications.requestPermissions();
  await PushNotifications.register();
};
```

## 📱 App Store Deployment

### 1. Konfigurer app i Xcode
- Bundle Identifier: `com.hms.homemanagement`
- App Name: `HMS - Home Management`
- Version: `1.0.0`

### 2. Legg til ikoner og splash screens
- App Icon: 1024x1024px
- Launch Screen: Adaptive for alle skjermstørrelser

### 3. Test på ekte enhet
```bash
# Koble til iPhone via USB
# Velg din iPhone i Xcode
# Trykk Run
```

### 4. Archive og upload til App Store
- Product → Archive
- Upload til App Store Connect
- Submit for review

## 🎯 Fordeler med denne tilnærmingen

### ✅ Samme kodebase
- 95% av koden kan gjenbrukes
- Kun platform-spesifikke tilpasninger

### ✅ Native ytelse
- Rask oppstart
- Smooth animasjoner
- Native UI-elementer

### ✅ App Store distribusjon
- Synlighet i App Store
- Push-notifikasjoner
- Native integrasjoner

### ✅ Offline-first
- Fungerer uten internett
- Lokal database
- Background sync

## 🔄 Utviklingsworkflow

```bash
# Utvikling (web)
npm run dev

# Test iOS-endringer
npm run build
npx cap sync ios
npx cap run ios

# Deploy web
npm run build
# Deploy til Vercel/Netlify

# Deploy iOS
# Archive i Xcode → App Store
```

## 📊 Sammenligning

| Feature | PWA | Capacitor | React Native |
|---------|-----|-----------|--------------|
| Kodebase | ✅ Samme | ✅ Samme | ⚠️ Delvis |
| App Store | ❌ Nei | ✅ Ja | ✅ Ja |
| Native API | ⚠️ Begrenset | ✅ Full | ✅ Full |
| Kompleksitet | 🟢 Lav | 🟡 Medium | 🔴 Høy |
| Vedlikehold | 🟢 Enkelt | 🟡 Medium | 🔴 Komplekst |

## 🎯 Anbefaling

**Capacitor er den beste løsningen for HMS fordi:**

1. **Minimal ekstra arbeid** - Bruker eksisterende Next.js app
2. **Native funksjoner** - Kamera, push, offline
3. **App Store** - Ekte iOS-app distribusjon
4. **Samme team** - Web-utviklere kan håndtere iOS
5. **Fremtidssikker** - Lett å legge til Android senere
