'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { Plus, Package, MapPin, Search, QrCode, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Velkommen tilbake! Her er en oversikt over inventaret ditt.
          </p>
        </div>
        <AccessibleButton aria-label="Legg til ny gjenstand">
          <Plus className="w-4 h-4 mr-2" />
          Legg til gjenstand
        </AccessibleButton>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totale gjenstander
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Start med å legge til dine første gjenstander
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lokasjoner
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Opprett rom og oppbevaringssteder
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              QR-koder generert
            </CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              QR-etiketter for enkel skanning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Denne måneden
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Gjenstander lagt til
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Kom i gang</CardTitle>
            <CardDescription>
              Sett opp ditt første inventar på noen enkle steg
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                1
              </div>
              <div>
                <h3 className="font-medium">Opprett ditt første rom</h3>
                <p className="text-sm text-muted-foreground">
                  Start med å lage rom som kjøkken, soverom eller bod
                </p>
              </div>
              <Button variant="outline" size="sm">
                Opprett rom
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                2
              </div>
              <div>
                <h3 className="font-medium">Legg til oppbevaringssteder</h3>
                <p className="text-sm text-muted-foreground">
                  Lag hyller, bokser og skuffer i rommene dine
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Legg til hyller
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                3
              </div>
              <div>
                <h3 className="font-medium">Registrer dine første gjenstander</h3>
                <p className="text-sm text-muted-foreground">
                  Ta bilder og legg til beskrivelser av tingene dine
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Legg til gjenstander
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nylige aktiviteter</CardTitle>
            <CardDescription>
              Oversikt over dine siste handlinger
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ingen aktiviteter ennå</p>
              <p className="text-sm">
                Aktiviteter vil vises her når du begynner å bruke systemet
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Nylig lagt til</CardTitle>
            <CardDescription>
              Dine sist registrerte gjenstander
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Søk i inventar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Inventaret ditt er tomt</h3>
            <p className="text-sm mb-6">
              Begynn med å legge til dine første gjenstander for å holde oversikt
            </p>
            <AccessibleButton aria-label="Legg til din første gjenstand">
              <Plus className="w-4 h-4 mr-2" />
              Legg til første gjenstand
            </AccessibleButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
