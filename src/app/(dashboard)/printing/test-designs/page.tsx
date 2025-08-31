'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Monitor, Sidebar, Layout } from 'lucide-react'

export default function TestDesignsPage() {
  const designs = [
    {
      id: 'fullscreen',
      title: 'Fullskjerm Modal',
      description: 'Fullskjerm overlay med fokusert arbeidsflyt',
      icon: Monitor,
      href: '/printing/test-fullscreen',
      pros: [
        'Maksimal fokus og skjermplassutnyttelse',
        'Ingen distraksjoner fra andre UI-elementer',
        'Tydelig progress og navigasjon',
        'Perfekt for mobile enheter'
      ],
      cons: [
        'Kan føles "fanget" inne i modal',
        'Mindre fleksibel for multitasking'
      ],
      color: 'bg-blue-500'
    },
    {
      id: 'sidebar',
      title: 'Sidebar Layout',
      description: 'Sidebar med template-liste og hovedområde for preview',
      icon: Sidebar,
      href: '/printing/test-sidebar',
      pros: [
        'Følger etablerte design patterns',
        'God oversikt over alle templates',
        'Naturlig informasjonshierarki',
        'Lett å navigere mellom steg'
      ],
      cons: [
        'Mindre plass til preview på små skjermer',
        'Kan virke mer kompleks'
      ],
      color: 'bg-green-500'
    },
    {
      id: 'tabs',
      title: 'Tabs Layout',
      description: 'Horisontale tabs for hver steg med to-kolonne innhold',
      icon: Layout,
      href: '/printing/test-tabs',
      pros: [
        'Mest intuitiv navigasjon mellom steg',
        'Tydelig progress indikator',
        'Fleksibel layout per steg',
        'Kjent UX pattern for brukere'
      ],
      cons: [
        'Kan bli trangt med mange tabs',
        'Mindre lineær arbeidsflyt'
      ],
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Test Printing Wizard Designs</h1>
        <p className="text-muted-foreground">
          Sammenlign tre forskjellige tilnærminger til printing wizard designet.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {designs.map((design) => {
          const IconComponent = design.icon
          return (
            <Card key={design.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${design.color} rounded-lg`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{design.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {design.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-green-700 mb-2">✅ Fordeler:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {design.pros.map((pro, index) => (
                      <li key={index}>• {pro}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-orange-700 mb-2">⚠️ Ulemper:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {design.cons.map((con, index) => (
                      <li key={index}>• {con}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4">
                  <Button asChild className="w-full">
                    <Link href={design.href}>
                      Test {design.title}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium mb-2">Hvordan teste designene</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>1. Test hver design:</strong> Klikk på "Test" knappene ovenfor for å prøve hver tilnærming.
                </p>
                <p>
                  <strong>2. Vurder brukeropplevelsen:</strong> Tenk på hvor intuitivt det er å navigere og fullføre oppgavene.
                </p>
                <p>
                  <strong>3. Sjekk responsivitet:</strong> Test på forskjellige skjermstørrelser hvis mulig.
                </p>
                <p>
                  <strong>4. Gi tilbakemelding:</strong> Fortell meg hvilken design du foretrekker og hvorfor.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
