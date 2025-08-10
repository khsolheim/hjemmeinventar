'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AccessibleButton } from "@/components/ui/accessible-button"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold mb-4">
          🏠 Hjemmeinventar
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Den enkle måten å holde oversikt over alle dine eiendeler med QR-koder og smart organisering
        </p>
        <div className="flex gap-4 justify-center">
          <AccessibleButton 
            size="lg"
            aria-label="Kom i gang med hjemmeinventar"
          >
            Kom i gang
          </AccessibleButton>
          <Button 
            variant="outline" 
            size="lg"
            aria-label="Les mer om funksjoner"
          >
            Les mer
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Hovedfunksjoner
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📦 Smart Organisering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organiser alt fra garn til elektronikk med hierarkiske lokasjoner og QR-koder
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧶 Garn & Hobby
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Spesialtilpasset for garn med oppskrifter, prosjekt-tracking og parti-numre
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📱 Mobilvennlig
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Fungerer perfekt på telefon, nettbrett og desktop. Installer som app på hjem-skjermen
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏷️ QR-Etiketter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generer og skriv ut QR-etiketter for enkelt å finne ting med kameraet
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔍 Smart Søk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Avansert søk med filter på kategori, lokasjon, tags og mer
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👥 Deling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Del inventaret ditt med familie og samarbeid om organisering
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16 bg-muted/50 rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Klar til å komme i gang?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Det tar bare noen minutter å sette opp ditt første rom og legge til gjenstander
          </p>
          <AccessibleButton 
            size="lg"
            aria-label="Registrer deg og start med hjemmeinventar"
          >
            Registrer deg gratis
          </AccessibleButton>
        </div>
      </section>
    </div>
  )
}
