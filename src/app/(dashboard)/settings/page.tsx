import { NotificationSettings } from '@/components/notifications/NotificationSettings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Shield, 
  Palette, 
  Database, 
  Download,
  Trash2,
  HelpCircle
} from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Innstillinger</h1>
        <p className="text-muted-foreground">
          Administrer kontoinformasjon og app-preferanser
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil
            </CardTitle>
            <CardDescription>
              Administrer din konto og profilinformasjon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Fornavn</Label>
                <Input id="firstName" placeholder="Ditt fornavn" />
              </div>
              <div>
                <Label htmlFor="lastName">Etternavn</Label>
                <Input id="lastName" placeholder="Ditt etternavn" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">E-post</Label>
              <Input id="email" type="email" placeholder="din@epost.no" />
            </div>
            <Button>Lagre endringer</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <NotificationSettings />

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Personvern og sikkerhet
            </CardTitle>
            <CardDescription>
              Administrer personverninnstillinger og kontosikkerhet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Vis profil til andre brukere</Label>
                <div className="text-sm text-gray-600">
                  Tillat andre medlemmer i husholdningen å se profilen din
                </div>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Anonymiser aktivitetslogger</Label>
                <div className="text-sm text-gray-600">
                  Skjul ditt navn i delte aktivitetslogger
                </div>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-base">Endre passord</Label>
              <div className="grid grid-cols-1 gap-2">
                <Input type="password" placeholder="Nåværende passord" />
                <Input type="password" placeholder="Nytt passord" />
                <Input type="password" placeholder="Bekreft nytt passord" />
              </div>
              <Button variant="outline">Oppdater passord</Button>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              App-preferanser
            </CardTitle>
            <CardDescription>
              Tilpass appens utseende og oppførsel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Mørk modus</Label>
                <div className="text-sm text-gray-600">
                  Bruk mørk fargepalett for appen
                </div>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Kompakt visning</Label>
                <div className="text-sm text-gray-600">
                  Vis mer informasjon på mindre plass
                </div>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Automatisk lagring</Label>
                <div className="text-sm text-gray-600">
                  Lagre endringer automatisk mens du skriver
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div>
              <Label htmlFor="language">Språk</Label>
              <select 
                id="language" 
                className="w-full mt-1 px-3 py-2 border rounded-md"
                defaultValue="nb"
              >
                <option value="nb">Norsk (Bokmål)</option>
                <option value="nn">Norsk (Nynorsk)</option>
                <option value="en">English</option>
                <option value="da">Dansk</option>
                <option value="sv">Svenska</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dataadministrasjon
            </CardTitle>
            <CardDescription>
              Administrer dine data og eksporthendelser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Last ned mine data
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Eksporter til CSV
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-base text-red-600">Farlig sone</Label>
              <div className="text-sm text-gray-600 mb-4">
                Disse handlingene kan ikke angres
              </div>
              
              <div className="space-y-2">
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Slett alle data
                </Button>
                <div className="text-xs text-gray-500">
                  Dette vil permanent slette alle dine gjenstander, lokasjoner og aktiviteter
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Hjelp og støtte
            </CardTitle>
            <CardDescription>
              Få hjelp eller send tilbakemelding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline">
                Hjelpedokumentasjon
              </Button>
              <Button variant="outline">
                Kontakt støtte
              </Button>
              <Button variant="outline">
                Send tilbakemelding
              </Button>
              <Button variant="outline">
                Rapporter en feil
              </Button>
            </div>

            <Separator />

            <div className="text-sm text-gray-600 space-y-1">
              <div>Versjon: 1.0.0</div>
              <div>Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}</div>
              <div>© 2024 Hjemmeinventar</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
