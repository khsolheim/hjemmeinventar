import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Garnrester - HMS',
  description: 'Administrer og bruk garnrester effektivt'
}

export default function RemnantsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Garnrester</h1>
        <p className="text-muted-foreground">
          Administrer og bruk garnrester effektivt for å redusere avfall.
        </p>
      </div>
      
      <div className="bg-muted rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Garnrest-systemet er implementert!</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>✅ Database og API - Komplett</p>
          <p>✅ RemnantCard komponent</p>
          <p>✅ RemnantGrid komponent</p>
          <p>✅ RemnantCreator dialog</p>
          <p>✅ RemnantUsageDialog komponent</p>
          <p>🔄 Integration med YarnManager - Under arbeid</p>
        </div>
      </div>
    </div>
  )
}