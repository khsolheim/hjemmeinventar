// Database seed script
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Default categories with field schemas
  const categories = [
    {
      name: 'Garn og Strikking',
      description: 'Garn, oppskrifter og strikkeutstyr',
      icon: '🧶',
      fieldSchema: JSON.stringify({
        type: 'object',
        properties: {
          producer: { type: 'string', label: 'Produsent' },
          composition: { type: 'string', label: 'Sammensetning' },
          yardage: { type: 'string', label: 'Løpelengde' },
          weight: { type: 'string', label: 'Vekt' },
          gauge: { type: 'string', label: 'Strikkefasthet' },
          needleSize: { type: 'string', label: 'Anbefalte pinner' },
          careInstructions: { type: 'string', label: 'Vaskeråd' },
          assignedProject: { type: 'string', label: 'Tilknyttet prosjekt' },
          condition: { 
            type: 'select', 
            label: 'Tilstand',
            options: ['Ny', 'Brukt - god', 'Brukt - ok', 'Brukt - dårlig']
          },
          store: { type: 'string', label: 'Butikk' },
          pricePerSkein: { type: 'number', label: 'Pris per nøste' }
        },
        required: ['producer', 'composition']
      })
    },
    {
      name: 'Elektronikk',
      description: 'Datautstyr, telefoner og elektroniske enheter',
      icon: '💻',
      fieldSchema: JSON.stringify({
        type: 'object',
        properties: {
          brand: { type: 'string', label: 'Merke' },
          model: { type: 'string', label: 'Modell' },
          serialNumber: { type: 'string', label: 'Serienummer' },
          warrantyExpiry: { type: 'date', label: 'Garanti utløper' },
          condition: { 
            type: 'select', 
            label: 'Tilstand',
            options: ['Ny', 'Som ny', 'God', 'Brukbar', 'Defekt']
          },
          accessories: { type: 'string', label: 'Tilbehør inkludert' }
        }
      })
    },
    {
      name: 'Mat og Drikke',
      description: 'Matvarer, krydder og drikkevarer',
      icon: '🍎',
      fieldSchema: JSON.stringify({
        type: 'object',
        properties: {
          brand: { type: 'string', label: 'Merke' },
          nutritionInfo: { type: 'string', label: 'Næringsinnhold' },
          allergens: { type: 'string', label: 'Allergener' },
          storage: { 
            type: 'select', 
            label: 'Oppbevaring',
            options: ['Kjøleskap', 'Fryser', 'Tørt og kjølig', 'Romtemperatur']
          },
          opened: { type: 'boolean', label: 'Åpnet' },
          openedDate: { type: 'date', label: 'Åpnet dato' }
        }
      })
    },
    {
      name: 'Klær og Tekstiler',
      description: 'Klær, sko og tekstiler',
      icon: '👕',
      fieldSchema: JSON.stringify({
        type: 'object',
        properties: {
          size: { type: 'string', label: 'Størrelse' },
          color: { type: 'string', label: 'Farge' },
          material: { type: 'string', label: 'Materiale' },
          season: { 
            type: 'select', 
            label: 'Sesong',
            options: ['Vinter', 'Vår', 'Sommer', 'Høst', 'Året rundt']
          }
        }
      })
    },
    {
      name: 'Verktøy og Utstyr',
      description: 'Håndverktøy, elektriske verktøy og utstyr',
      icon: '🔧',
      fieldSchema: JSON.stringify({
        type: 'object',
        properties: {
          brand: { type: 'string', label: 'Merke' },
          model: { type: 'string', label: 'Modell' },
          condition: { 
            type: 'select', 
            label: 'Tilstand',
            options: ['Ny', 'God', 'Brukbar', 'Trenger service', 'Defekt']
          },
          lastMaintenance: { type: 'date', label: 'Sist vedlikeholdt' },
          manual: { type: 'string', label: 'Bruksanvisning URL' }
        }
      })
    },
    {
      name: 'Bøker og Medier',
      description: 'Bøker, filmer, spill og andre medier',
      icon: '📚',
      fieldSchema: JSON.stringify({
        type: 'object',
        properties: {
          author: { type: 'string', label: 'Forfatter/Skaper' },
          isbn: { type: 'string', label: 'ISBN/ID' },
          genre: { type: 'string', label: 'Sjanger' },
          format: { 
            type: 'select', 
            label: 'Format',
            options: ['Fysisk bok', 'E-bok', 'DVD', 'Blu-ray', 'Digital', 'Vinyl', 'CD']
          },
          rating: { 
            type: 'select', 
            label: 'Vurdering',
            options: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐']
          }
        }
      })
    },
    {
      name: 'Hobby og Kreativt',
      description: 'Hobbymaterialer, kunst og kreative prosjekter',
      icon: '🎨',
      fieldSchema: JSON.stringify({
        type: 'object',
        properties: {
          medium: { type: 'string', label: 'Medium/Type' },
          brand: { type: 'string', label: 'Merke' },
          color: { type: 'string', label: 'Farge' },
          project: { type: 'string', label: 'Tilknyttet prosjekt' },
          skill_level: { 
            type: 'select', 
            label: 'Ferdighetsnivå',
            options: ['Nybegynner', 'Middels', 'Avansert', 'Ekspert']
          }
        }
      })
    },
    {
      name: 'Helse og Skjønnhet',
      description: 'Kosmetikk, medisiner og helseprodukter',
      icon: '💄',
      fieldSchema: JSON.stringify({
        type: 'object',
        properties: {
          brand: { type: 'string', label: 'Merke' },
          shade: { type: 'string', label: 'Nyanse/Farge' },
          spf: { type: 'number', label: 'SPF-faktor' },
          skinType: { 
            type: 'select', 
            label: 'Hudtype',
            options: ['Normal', 'Tørr', 'Fet', 'Kombinert', 'Sensitiv']
          },
          opened: { type: 'boolean', label: 'Åpnet' }
        }
      })
    }
  ]

  // Create categories
  for (const categoryData of categories) {
    const existing = await prisma.category.findFirst({
      where: { name: categoryData.name }
    })

    if (!existing) {
      await prisma.category.create({
        data: categoryData
      })
      console.log(`✅ Created category: ${categoryData.name}`)
    } else {
      console.log(`⏭️  Category already exists: ${categoryData.name}`)
    }
  }



  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
