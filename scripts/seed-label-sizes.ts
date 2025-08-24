import { seedLabelSizes } from '../src/lib/seed-label-sizes'

async function main() {
  try {
    await seedLabelSizes()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding label sizes:', error)
    process.exit(1)
  }
}

main()
