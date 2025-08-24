import { LocationType } from '@prisma/client'
import { db } from '@/lib/db'
import { generateUniqueQRCode } from '@/lib/db'

export interface DemoLocation {
  name: string
  displayName?: string
  type: LocationType
  autoNumber?: string
  level: number
  isPrivate?: boolean
  colorCode?: string
  tags?: string[]
  children?: DemoLocation[]
}

const demoHierarchy: DemoLocation[] = [
  {
    name: 'Soverom',
    type: LocationType.ROOM,
    level: 0,
    colorCode: '#3B82F6',
    tags: ['Soverom', 'Privat'],
    children: [
      {
        name: 'Skap A',
        type: LocationType.CABINET,
        autoNumber: 'A',
        level: 1,
        colorCode: '#10B981',
        children: [
          {
            name: 'Hylle A1',
            type: LocationType.SHELF,
            autoNumber: 'A1',
            level: 2,
            children: [
              {
                name: 'Boks A1-1',
                type: LocationType.BOX,
                autoNumber: 'A1-1',
                level: 3,
                tags: ['Vinterklaer'],
                children: [
                  {
                    name: 'Pose A1-1-a',
                    type: LocationType.BAG,
                    autoNumber: 'A1-1-a',
                    level: 4,
                    tags: ['Votter', 'Vinterklaer']
                  },
                  {
                    name: 'Pose A1-1-b',
                    type: LocationType.BAG,
                    autoNumber: 'A1-1-b',
                    level: 4,
                    tags: ['Skjerf', 'Vinterklaer']
                  }
                ]
              },
              {
                name: 'Boks A1-2',
                type: LocationType.BOX,
                autoNumber: 'A1-2',
                level: 3,
                tags: ['Sommerklaer']
              }
            ]
          },
          {
            name: 'Hylle A2',
            type: LocationType.SHELF,
            autoNumber: 'A2',
            level: 2
          }
        ]
      },
      {
        name: 'Skap B',
        type: LocationType.CABINET,
        autoNumber: 'B',
        level: 1,
        isPrivate: true,
        colorCode: '#EF4444',
        children: [
          {
            name: 'Hylle B1',
            type: LocationType.SHELF,
            autoNumber: 'B1',
            level: 2,
            isPrivate: true
          }
        ]
      }
    ]
  },
  {
    name: 'Kjøkken',
    type: LocationType.ROOM,
    level: 0,
    colorCode: '#F59E0B',
    tags: ['Kjøkken', 'Fellesområde'],
    children: [
      {
        name: 'Reol A',
        type: LocationType.RACK,
        autoNumber: 'A',
        level: 1,
        children: [
          {
            name: 'Hylle A1',
            type: LocationType.SHELF,
            autoNumber: 'A1',
            level: 2,
            tags: ['Kjøkkenredskap']
          },
          {
            name: 'Hylle A2',
            type: LocationType.SHELF,
            autoNumber: 'A2',
            level: 2,
            tags: ['Tallerkener']
          }
        ]
      }
    ]
  }
]

export async function createDemoLocations(userId: string): Promise<void> {
  console.log('Creating demo locations for user:', userId)
  
  // Delete existing locations for user
  await db.location.deleteMany({
    where: { userId }
  })
  
  // Create locations recursively
  await createLocationHierarchy(demoHierarchy, userId)
  
  console.log('Demo locations created successfully')
}

async function createLocationHierarchy(
  locations: DemoLocation[], 
  userId: string, 
  parentId?: string
): Promise<void> {
  for (const locationData of locations) {
    const qrCode = await generateUniqueQRCode()
    
    const location = await db.location.create({
      data: {
        name: locationData.name,
        // displayName: locationData.displayName, // Removed - not in schema
        type: locationData.type,
        qrCode,
        parentId,
        // autoNumber: locationData.autoNumber, // Removed - not in schema
        // level: locationData.level, // Removed - not in schema
        // isWizardCreated: true, // Removed - not in schema
        // wizardOrder: 1, // Removed - not in schema
        // isPrivate: locationData.isPrivate || false, // Removed - not in schema
        // colorCode: locationData.colorCode, // Removed - not in schema
        // tags: locationData.tags ? JSON.stringify(locationData.tags) : null, // Removed - not in schema
        // allowedUsers: null, // Removed - not in schema
        // images: null, // Removed - not in schema
        // primaryImage: null, // Removed - not in schema
        // householdId: null, // Removed - not in schema
        // isActive: true, // Removed - not in schema
        userId
      }
    })
    
    // Create children recursively
    if (locationData.children && locationData.children.length > 0) {
      await createLocationHierarchy(locationData.children, userId, location.id)
    }
  }
}

export async function clearDemoLocations(userId: string): Promise<void> {
  console.log('Clearing demo locations for user:', userId)
  
  await db.location.deleteMany({
    where: { 
      userId
      // isWizardCreated: true // Removed - not in schema
    }
  })
  
  console.log('Demo locations cleared')
}