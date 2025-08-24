import { db } from './db'

export async function seedLabelSizes() {
  console.log('🌱 Seeding label sizes...')
  
  // Standard størrelser (i millimeter)
  const defaultSizes = [
    {
      name: 'Liten',
      widthMm: 30,
      heightMm: 15,
      description: 'For små gjenstander',
      isDefault: false
    },
    {
      name: 'Standard',
      widthMm: 54,
      heightMm: 25,
      description: 'Mest brukt størrelse',
      isDefault: true
    },
    {
      name: 'Stor',
      widthMm: 89,
      heightMm: 36,
      description: 'For store gjenstander',
      isDefault: false
    }
  ]
  
  // Hent alle brukere
  const users = await db.user.findMany()
  
  for (const user of users) {
    for (const size of defaultSizes) {
      // Konverter mm til piksler (300 DPI)
      const widthPx = Math.round(size.widthMm * 11.811)
      const heightPx = Math.round(size.heightMm * 11.811)
      
      // Sjekk om størrelsen allerede eksisterer
      const existing = await db.labelSize.findFirst({
        where: {
          name: size.name,
          userId: user.id
        }
      })
      
      if (!existing) {
        await db.labelSize.create({
          data: {
            name: size.name,
            width: widthPx,
            height: heightPx,
            widthMm: size.widthMm,
            heightMm: size.heightMm,
            description: size.description,
            isDefault: size.isDefault,
            userId: user.id
          }
        })
        console.log(`✅ Created ${size.name} size for user ${user.email}`)
      } else {
        console.log(`⏭️  ${size.name} size already exists for user ${user.email}`)
      }
    }
  }
  
  console.log('✅ Label sizes seeding completed!')
}
