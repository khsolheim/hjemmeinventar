#!/usr/bin/env node

/**
 * Migrasjonsskript for å oppdatere eksisterende lokasjoner med LOC-koder
 * Kjører gjennom alle lokasjoner og gir dem sekvensielle LOC001, LOC002, etc.
 */

const { PrismaClient } = require('@prisma/client')

const db = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function migrateLocationCodes() {
  console.log('🚀 Starter migrering av lokasjonskoder...\n')

  try {
    // Hent alle lokasjoner som ikke har LOC-koder
    const locationsWithoutLOC = await db.location.findMany({
      where: {
        NOT: {
          qrCode: {
            startsWith: 'LOC'
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Eldste først
      }
    })

    console.log(`📊 Fant ${locationsWithoutLOC.length} lokasjoner som trenger LOC-koder`)

    if (locationsWithoutLOC.length === 0) {
      console.log('✅ Alle lokasjoner har allerede LOC-koder!')
      return
    }

    // Finn høyeste eksisterende LOC-nummer
    const lastLOCLocation = await db.location.findFirst({
      where: {
        qrCode: {
          startsWith: 'LOC'
        }
      },
      orderBy: {
        qrCode: 'desc'
      }
    })

    let nextNumber = 1
    if (lastLOCLocation?.qrCode) {
      const match = lastLOCLocation.qrCode.match(/LOC(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
        console.log(`📈 Høyeste eksisterende LOC-nummer: ${match[1]}, starter på ${nextNumber}`)
      }
    }

    console.log('\n🔄 Oppdaterer lokasjoner...\n')

    // Oppdater hver lokasjon
    const results = []
    for (const location of locationsWithoutLOC) {
      const newQRCode = `LOC${nextNumber.toString().padStart(3, '0')}`
      
      try {
        const updated = await db.location.update({
          where: { id: location.id },
          data: { qrCode: newQRCode }
        })

        console.log(`✅ ${location.name} (${location.type}): ${location.qrCode} → ${newQRCode}`)
        
        results.push({
          id: location.id,
          name: location.name,
          oldCode: location.qrCode,
          newCode: newQRCode,
          success: true
        })
        
        nextNumber++
      } catch (error) {
        console.error(`❌ Feil ved oppdatering av ${location.name}: ${error.message}`)
        results.push({
          id: location.id,
          name: location.name,
          oldCode: location.qrCode,
          newCode: newQRCode,
          success: false,
          error: error.message
        })
      }
    }

    // Sammendrag
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    console.log('\n📊 SAMMENDRAG:')
    console.log(`✅ Vellykket oppdatert: ${successful}`)
    console.log(`❌ Feilet: ${failed}`)

    if (failed > 0) {
      console.log('\n❌ Feilede oppdateringer:')
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`)
      })
    }

    // Verifiser resultatet
    console.log('\n🔍 Verifiserer resultatet...')
    const totalLocations = await db.location.count()
    const locationsWithLOC = await db.location.count({
      where: {
        qrCode: {
          startsWith: 'LOC'
        }
      }
    })

    console.log(`📊 Totalt lokasjoner: ${totalLocations}`)
    console.log(`📊 Lokasjoner med LOC-koder: ${locationsWithLOC}`)
    console.log(`📊 Dekningsgrad: ${((locationsWithLOC / totalLocations) * 100).toFixed(1)}%`)

    if (locationsWithLOC === totalLocations) {
      console.log('\n🎉 MIGRERING FULLFØRT! Alle lokasjoner har nå LOC-koder.')
    } else {
      console.log('\n⚠️  Noen lokasjoner mangler fortsatt LOC-koder. Sjekk feilmeldingene over.')
    }

  } catch (error) {
    console.error('💥 Kritisk feil under migrering:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Kjør migreringen
if (require.main === module) {
  migrateLocationCodes()
    .then(() => {
      console.log('\n✨ Migrasjonsskript fullført!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migrasjonsskript feilet:', error)
      process.exit(1)
    })
}

module.exports = { migrateLocationCodes }
