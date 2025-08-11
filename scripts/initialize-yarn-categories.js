#!/usr/bin/env node

// Script for å initialisere Garn Master og Garn Batch kategorier
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Definer kategori-skjemaer
const yarnMasterFieldSchema = {
  type: 'object',
  properties: {
    producer: { type: 'string', label: 'Produsent', required: true },
    composition: { type: 'string', label: 'Sammensetning', required: true },
    yardage: { type: 'string', label: 'Løpelengde', placeholder: 'f.eks. 100m' },
    weight: { type: 'string', label: 'Vekt', placeholder: 'f.eks. 50g' },
    gauge: { type: 'string', label: 'Strikkefasthet', placeholder: 'f.eks. 22 masker = 10cm' },
    needleSize: { type: 'string', label: 'Anbefalte pinner', placeholder: 'f.eks. 4.0mm' },
    careInstructions: { type: 'string', label: 'Vaskeråd' },
    store: { type: 'string', label: 'Butikk', placeholder: 'Hvor garnet vanligvis kjøpes' },
    notes: { type: 'textarea', label: 'Notater', placeholder: 'Generelle notater om denne garntypen' }
  },
  required: ['producer', 'composition']
}

const yarnBatchFieldSchema = {
  type: 'object',
  properties: {
    batchNumber: { type: 'string', label: 'Batch nummer', required: true },
    color: { type: 'string', label: 'Farge', required: true },
    colorCode: { type: 'string', label: 'Farge kode', placeholder: 'f.eks. #FF5733 eller navn' },
    quantity: { type: 'number', label: 'Antall nøster', required: true, min: 1 },
    pricePerSkein: { type: 'number', label: 'Pris per nøste (kr)', min: 0, step: 0.01 },
    purchaseDate: { type: 'date', label: 'Kjøpsdato' },
    condition: { 
      type: 'select', 
      label: 'Tilstand',
      options: ['Ny', 'Brukt - god', 'Brukt - ok', 'Brukt - dårlig'],
      default: 'Ny'
    },
    masterItemId: { type: 'string', label: 'Tilhører Master', hidden: true },
    notes: { type: 'textarea', label: 'Batch-notater', placeholder: 'Spesifikke notater for denne batchen' }
  },
  required: ['batchNumber', 'color', 'quantity']
}

async function initializeYarnCategories() {
  try {
    console.log('🧶 Initialiserer garn-kategorier...')

    const categoriesToCreate = [
      {
        name: 'Garn Master',
        description: 'Garn-typer med felles egenskaper (produsent, sammensetning, etc.)',
        icon: '🧶',
        fieldSchema: JSON.stringify(yarnMasterFieldSchema)
      },
      {
        name: 'Garn Batch',
        description: 'Individuelle nøster/batcher med unike egenskaper (farge, batch nr, etc.)',
        icon: '🎨',
        fieldSchema: JSON.stringify(yarnBatchFieldSchema)
      }
    ]

    const results = []

    for (const categoryData of categoriesToCreate) {
      // Sjekk om kategorien allerede eksisterer
      const existing = await prisma.category.findFirst({
        where: { name: categoryData.name }
      })

      if (existing) {
        console.log(`✓ ${categoryData.name} finnes allerede`)
        results.push({ name: categoryData.name, status: 'exists' })
      } else {
        const created = await prisma.category.create({
          data: categoryData
        })
        console.log(`✓ Opprettet ${categoryData.name}`)
        results.push({ name: categoryData.name, status: 'created', id: created.id })
      }
    }

    console.log('\n🎉 Garn-kategorier initialisert vellykket!')
    console.log('━'.repeat(50))
    console.log('📋 Sammendrag:')
    results.forEach(result => {
      const status = result.status === 'created' ? '🆕 Opprettet' : '✅ Eksisterte'
      console.log(`   ${status}: ${result.name}`)
    })

    console.log('\n🚀 Du kan nå:')
    console.log('   • Gå til /garn for å se garn-dashboardet')
    console.log('   • Registrere nye garn-typer (Master)')
    console.log('   • Legge til batches til eksisterende typer')
    console.log('   • Spore beholdning på tvers av alle nøster')

  } catch (error) {
    console.error('❌ Feil ved initialisering av garn-kategorier:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Kjør script
if (require.main === module) {
  initializeYarnCategories()
}

module.exports = { initializeYarnCategories }
