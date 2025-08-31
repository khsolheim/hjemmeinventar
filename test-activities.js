const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testActivities() {
  try {
    console.log('🔍 Testing Activity table...')
    
    // Test if table exists and can be queried
    const count = await prisma.activity.count()
    console.log('✅ Activity table exists. Total activities:', count)
    
    // Try to get recent activities
    const activities = await prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    console.log('✅ Found', activities.length, 'recent activities')
    
    if (activities.length > 0) {
      console.log('Sample activity:', activities[0])
    }
    
  } catch (error) {
    console.error('❌ Error testing activities:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testActivities()
