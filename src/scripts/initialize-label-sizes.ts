import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function initializeLabelSizes() {
  console.log('🚀 Initialiserer label sizes...')

  try {
    // Sjekk om det allerede finnes label sizes
    const existingSizes = await prisma.labelSize.findMany()
    
    if (existingSizes.length > 0) {
      console.log(`✅ Fant ${existingSizes.length} eksisterende label sizes`)
      return
    }

    // Standard label sizes for DYMO og andre printere
    const defaultSizes = [
      {
        name: 'Standard',
        width: 204, // ~54mm at 96 DPI
        height: 94, // ~25mm at 96 DPI
        widthMm: 54,
        heightMm: 25,
        description: 'Mest brukt størrelse for generelle etiketter',
        isDefault: true
      },
      {
        name: 'Liten',
        width: 113, // ~30mm at 96 DPI
        height: 57, // ~15mm at 96 DPI
        widthMm: 30,
        heightMm: 15,
        description: 'For små gjenstander og kort informasjon',
        isDefault: false
      },
      {
        name: 'Stor',
        width: 336, // ~89mm at 96 DPI
        height: 136, // ~36mm at 96 DPI
        widthMm: 89,
        heightMm: 36,
        description: 'For større gjenstander og mer informasjon',
        isDefault: false
      },
      {
        name: 'Adresse',
        width: 336, // ~89mm at 96 DPI
        height: 94, // ~25mm at 96 DPI
        widthMm: 89,
        heightMm: 25,
        description: 'Spesielt for adresse-etiketter',
        isDefault: false
      },
      {
        name: 'QR-kode',
        width: 151, // ~40mm at 96 DPI
        height: 151, // ~40mm at 96 DPI
        widthMm: 40,
        heightMm: 40,
        description: 'Kvadratisk størrelse for QR-koder',
        isDefault: false
      },
      {
        name: 'Strekkode',
        width: 336, // ~89mm at 96 DPI
        height: 57, // ~15mm at 96 DPI
        widthMm: 89,
        heightMm: 15,
        description: 'Bred format for strekkoder',
        isDefault: false
      }
    ]

    // Opprett label sizes
    for (const size of defaultSizes) {
      await prisma.labelSize.create({
        data: {
          ...size,
          userId: 'system' // Placeholder - må oppdateres med faktisk bruker-ID
        }
      })
    }

    console.log(`✅ Opprettet ${defaultSizes.length} label sizes`)
    
    // List opprettede sizes
    const createdSizes = await prisma.labelSize.findMany()
    console.log('📋 Opprettede label sizes:')
    createdSizes.forEach(size => {
      console.log(`  - ${size.name}: ${size.widthMm}×${size.heightMm}mm ${size.isDefault ? '(Standard)' : ''}`)
    })

  } catch (error) {
    console.error('❌ Feil ved initialisering av label sizes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Kjør scriptet hvis det kalles direkte
if (require.main === module) {
  initializeLabelSizes()
    .then(() => {
      console.log('✅ Label sizes initialisering fullført')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Feil:', error)
      process.exit(1)
    })
}

export { initializeLabelSizes }
