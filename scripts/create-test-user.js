const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Hash password (using same rounds as auth system)
    const hashedPassword = await bcrypt.hash('test123', 12)
    
    // Create or update test user  
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Test Bruker'
      },
      create: {
        email: 'test@example.com',
        name: 'Test Bruker',
        password: hashedPassword,
      }
    })
    
    console.log('✅ Test bruker opprettet:')
    console.log('📧 Email: test@example.com')
    console.log('🔑 Passord: test123')
    console.log('🆔 ID:', user.id)
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  Test bruker eksisterer allerede')
      console.log('📧 Email: test@example.com')
      console.log('🔑 Passord: test123')
    } else {
      console.error('❌ Feil ved opprettelse av bruker:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
