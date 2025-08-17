import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AccessibleButton } from "@/components/ui/accessible-button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="page container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 cq" style={{"--card-min":"360px"} as any}>
        <h1 className="text-4xl font-bold mb-4">
          🏠 HMS
        </h1>
        <p className="text-xl text-muted-foreground mb-2 max-w-2xl mx-auto font-semibold">
          Home Management System
        </p>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Den enkle måten å holde oversikt over alle dine eiendeler med QR-koder og smart organisering
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <AccessibleButton 
            asChild
            size="lg"
            aria-label="Registrer deg og kom i gang"
            className="cta-button"
          >
            <Link href="/auth/signup">Kom i gang</Link>
          </AccessibleButton>
          <Button 
            variant="outline" 
            size="lg"
            aria-label="Les mer om funksjoner"
            asChild
          >
            <a href="#features">Les mer</a>
          </Button>
          <Button 
            asChild
            variant="ghost" 
            size="lg"
            aria-label="Logg inn hvis du allerede har konto"
          >
            <Link href="/auth/signin">Logg inn</Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 cq">
        <h2 className="text-3xl font-bold text-center mb-12">
          Hovedfunksjoner
        </h2>
        <div className="cq-grid items-grid" style={{"--card-min":"220px"} as any}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 title">
                📦 Smart Organisering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="secondary-text">
                Organiser alt fra garn til elektronikk med hierarkiske lokasjoner og QR-koder
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 title">
                🧶 Garn & Hobby
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="secondary-text">
                Spesialtilpasset for garn med oppskrifter, prosjekt-tracking og parti-numre
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 title">
                📱 Mobilvennlig
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="secondary-text">
                Fungerer perfekt på telefon, nettbrett og desktop. Installer som app på hjem-skjermen
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 title">
                🏷️ QR-Etiketter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="secondary-text">
                Generer og skriv ut QR-etiketter for enkelt å finne ting med kameraet
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 title">
                🔍 Smart Søk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="secondary-text">
                Avansert søk med filter på kategori, lokasjon, tags og mer
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 title">
                👥 Deling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="secondary-text">
                Del inventaret ditt med familie og samarbeid om organisering
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16 bg-muted/50 rounded-lg cq">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Klar til å komme i gang?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Det tar bare noen minutter å sette opp ditt første rom og legge til gjenstander
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <AccessibleButton 
              asChild
              size="lg"
              aria-label="Registrer deg og start med HMS"
              className="cta-button"
            >
              <Link href="/auth/signup">Registrer deg gratis</Link>
            </AccessibleButton>
            <Button 
              asChild
              variant="outline"
              size="lg"
              aria-label="Logg inn hvis du allerede har konto"
            >
              <Link href="/auth/signin">Har du konto? Logg inn</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
