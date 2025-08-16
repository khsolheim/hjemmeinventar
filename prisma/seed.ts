// Database seed script
import { PrismaClient } from '@prisma/client'
import { seedPrintingSystem } from './seed-printing'

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

  // Default hierarchy rule sets
  const hierarchyRuleSets = [
    {
      name: 'minimal',
      description: 'Enkel organisering for mindre husholdninger',
      rules: [
        // Rom kan inneholde
        { parent: 'ROOM', child: 'CONTAINER', description: 'Rom kan inneholde beholdere' },
        { parent: 'ROOM', child: 'BOX', description: 'Rom kan inneholde bokser' },
        { parent: 'ROOM', child: 'CABINET', description: 'Rom kan inneholde skap' },
        
        // Beholdere kan inneholde
        { parent: 'CONTAINER', child: 'BOX', description: 'Beholdere kan inneholde bokser' },
        { parent: 'CONTAINER', child: 'BAG', description: 'Beholdere kan inneholde poser' },
        
        // Skap kan inneholde
        { parent: 'CABINET', child: 'BOX', description: 'Skap kan inneholde bokser' },
        { parent: 'CABINET', child: 'BAG', description: 'Skap kan inneholde poser' },
        
        // Bokser kan inneholde
        { parent: 'BOX', child: 'BAG', description: 'Bokser kan inneholde poser' }
      ]
    },
    {
      name: 'standard',
      description: 'Balansert fleksibilitet for de fleste husholdninger',
      rules: [
        // Rom kan inneholde
        { parent: 'ROOM', child: 'SHELF', description: 'Rom kan inneholde reoler' },
        { parent: 'ROOM', child: 'CABINET', description: 'Rom kan inneholde skap' },
        { parent: 'ROOM', child: 'CONTAINER', description: 'Rom kan inneholde beholdere' },
        
        // Reoler kan inneholde
        { parent: 'SHELF', child: 'SHELF_COMPARTMENT', description: 'Reoler kan inneholde hylleavdelinger' },
        { parent: 'SHELF', child: 'BOX', description: 'Reoler kan inneholde bokser' },
        
        // Skap kan inneholde
        { parent: 'CABINET', child: 'DRAWER', description: 'Skap kan inneholde skuffer' },
        { parent: 'CABINET', child: 'SHELF_COMPARTMENT', description: 'Skap kan inneholde hylleavdelinger' },
        { parent: 'CABINET', child: 'CONTAINER', description: 'Skap kan inneholde beholdere' },
        { parent: 'CABINET', child: 'BOX', description: 'Skap kan inneholde bokser' },
        
        // Hylleavdelinger kan inneholde
        { parent: 'SHELF_COMPARTMENT', child: 'BOX', description: 'Hylleavdelinger kan inneholde bokser' },
        { parent: 'SHELF_COMPARTMENT', child: 'BAG', description: 'Hylleavdelinger kan inneholde poser' },
        
        // Skuffer kan inneholde
        { parent: 'DRAWER', child: 'SECTION', description: 'Skuffer kan inneholde avsnitt' },
        { parent: 'DRAWER', child: 'BAG', description: 'Skuffer kan inneholde poser' },
        { parent: 'DRAWER', child: 'CONTAINER', description: 'Skuffer kan inneholde små beholdere' },
        
        // Beholdere kan inneholde
        { parent: 'CONTAINER', child: 'BAG', description: 'Beholdere kan inneholde poser' },
        { parent: 'CONTAINER', child: 'SECTION', description: 'Beholdere kan inneholde avsnitt' },
        
        // Bokser kan inneholde
        { parent: 'BOX', child: 'BAG', description: 'Bokser kan inneholde poser' },
        { parent: 'BOX', child: 'SECTION', description: 'Bokser kan inneholde avsnitt' }
      ]
    },
    {
      name: 'extended',
      description: 'Maksimal fleksibilitet for komplekse organisasjonsbehov',
      rules: [
        // Rom kan inneholde alt
        { parent: 'ROOM', child: 'SHELF', description: 'Rom kan inneholde reoler' },
        { parent: 'ROOM', child: 'CABINET', description: 'Rom kan inneholde skap' },
        { parent: 'ROOM', child: 'CONTAINER', description: 'Rom kan inneholde beholdere' },
        { parent: 'ROOM', child: 'BOX', description: 'Rom kan inneholde bokser' },
        
        // Reoler - utvidet
        { parent: 'SHELF', child: 'SHELF_COMPARTMENT', description: 'Reoler kan inneholde hylleavdelinger' },
        { parent: 'SHELF', child: 'BOX', description: 'Reoler kan inneholde bokser' },
        { parent: 'SHELF', child: 'DRAWER', description: 'Reoler kan inneholde skuffer' },
        { parent: 'SHELF', child: 'CONTAINER', description: 'Reoler kan inneholde beholdere' },
        
        // Skap - utvidet
        { parent: 'CABINET', child: 'DRAWER', description: 'Skap kan inneholde skuffer' },
        { parent: 'CABINET', child: 'SHELF_COMPARTMENT', description: 'Skap kan inneholde hylleavdelinger' },
        { parent: 'CABINET', child: 'CONTAINER', description: 'Skap kan inneholde beholdere' },
        { parent: 'CABINET', child: 'BOX', description: 'Skap kan inneholde bokser' },
        { parent: 'CABINET', child: 'BAG', description: 'Skap kan inneholde poser' },
        
        // Hylleavdelinger - utvidet
        { parent: 'SHELF_COMPARTMENT', child: 'BOX', description: 'Hylleavdelinger kan inneholde bokser' },
        { parent: 'SHELF_COMPARTMENT', child: 'BAG', description: 'Hylleavdelinger kan inneholde poser' },
        { parent: 'SHELF_COMPARTMENT', child: 'CONTAINER', description: 'Hylleavdelinger kan inneholde beholdere' },
        { parent: 'SHELF_COMPARTMENT', child: 'SECTION', description: 'Hylleavdelinger kan inneholde avsnitt' },
        
        // Skuffer - utvidet
        { parent: 'DRAWER', child: 'SECTION', description: 'Skuffer kan inneholde avsnitt' },
        { parent: 'DRAWER', child: 'BAG', description: 'Skuffer kan inneholde poser' },
        { parent: 'DRAWER', child: 'CONTAINER', description: 'Skuffer kan inneholde beholdere' },
        { parent: 'DRAWER', child: 'BOX', description: 'Skuffer kan inneholde bokser' },
        
        // Beholdere - utvidet
        { parent: 'CONTAINER', child: 'BAG', description: 'Beholdere kan inneholde poser' },
        { parent: 'CONTAINER', child: 'SECTION', description: 'Beholdere kan inneholde avsnitt' },
        { parent: 'CONTAINER', child: 'BOX', description: 'Beholdere kan inneholde bokser' },
        
        // Bokser - utvidet
        { parent: 'BOX', child: 'BAG', description: 'Bokser kan inneholde poser' },
        { parent: 'BOX', child: 'SECTION', description: 'Bokser kan inneholde avsnitt' },
        
        // Poser kan inneholde avsnitt
        { parent: 'BAG', child: 'SECTION', description: 'Poser kan inneholde avsnitt' }
      ]
    }
  ]

  // Create default hierarchy rules
  for (const ruleSet of hierarchyRuleSets) {
    console.log(`🏗️  Creating hierarchy rule set: ${ruleSet.name}`)
    
    for (const rule of ruleSet.rules) {
      const existing = await prisma.defaultHierarchyRule.findFirst({
        where: { 
          ruleSetName: ruleSet.name,
          parentType: rule.parent as any,
          childType: rule.child as any
        }
      })

      if (!existing) {
        await prisma.defaultHierarchyRule.create({
          data: {
            ruleSetName: ruleSet.name,
            parentType: rule.parent as any,
            childType: rule.child as any,
            isAllowed: true,
            description: rule.description
          }
        })
        console.log(`  ✅ ${rule.parent} → ${rule.child}`)
      } else {
        console.log(`  ⏭️  Rule already exists: ${rule.parent} → ${rule.child}`)
      }
    }
  }

  // Seed printing system
  await seedPrintingSystem()

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
