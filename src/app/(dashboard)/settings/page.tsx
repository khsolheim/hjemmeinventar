"use client"

import { NotificationSettings } from '@/components/notifications/NotificationSettings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { 
  User, 
  Shield, 
  Palette, 
  Database, 
  Download,
  Trash2,
  HelpCircle,
  Layers,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const commonOpts = { enabled: status === 'authenticated', retry: 0, refetchOnWindowFocus: false, refetchOnMount: false, staleTime: 5 * 60 * 1000 } as const
  const profilesQuery = trpc.users.getLabelProfiles.useQuery(undefined, commonOpts)
  const profileQuery = trpc.users.getProfile.useQuery(undefined, commonOpts)
  const updateUser = trpc.users.updateProfile.useMutation({ onSuccess: () => { profileQuery.refetch() } })
  const createProfile = trpc.users.createLabelProfile.useMutation({ onSuccess: () => profilesQuery.refetch() })
  const updateProfile = trpc.users.updateLabelProfile.useMutation({ onSuccess: () => profilesQuery.refetch() })
  const deleteProfile = trpc.users.deleteLabelProfile.useMutation({ onSuccess: () => profilesQuery.refetch() })
  const [newProfile, setNewProfile] = useState({ name: '', extraLine1: '', extraLine2: '', showUrl: true, logoUrl: '' })
  const [defaultProfileId, setDefaultProfileId] = useState<string>('')

  useEffect(() => {
    if (!defaultProfileId && profileQuery.data?.defaultLabelProfileId) {
      setDefaultProfileId(profileQuery.data.defaultLabelProfileId)
    }
  }, [profileQuery.data, defaultProfileId])
  if (status !== 'authenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Innstillinger</h1>
      </div>
    )
  }
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-3">
                  <Input id="user-logo-url" placeholder="https://..." />
                  <input id="user-logo-file" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, { method: 'POST', body: file })
                    const data = await res.json()
                    if (data.url) {
                      (document.getElementById('user-logo-url') as HTMLInputElement).value = data.url
                    }
                  }} />
                  <Button variant="outline" size="sm" onClick={() => (document.getElementById('user-logo-file') as HTMLInputElement).click()}>Last opp</Button>
                </div>
                <p className="text-xs text-muted-foreground">Lim inn URL eller last opp bilde</p>
              </div>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={async () => {
                  const logo = (document.getElementById('user-logo-url') as HTMLInputElement).value.trim()
                  if (!logo) return
                  updateUser.mutate({ logoUrl: logo })
                }}>Lagre logo</Button>
              </div>
            </div>
            <div>
              <Label>Standard etikettmal</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-md" value={defaultProfileId || ''} onChange={(e) => setDefaultProfileId(e.target.value)}>
                <option value="">(Ingen)</option>
                {(profilesQuery.data || []).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="flex justify-end mt-2">
                <Button size="sm" variant="outline" onClick={() => updateUser.mutate({ defaultLabelProfileId: defaultProfileId || null })}>Lagre standard</Button>
              </div>
            </div>
            <Button>Lagre endringer</Button>
          </CardContent>
        </Card>

        {/* Label Profiles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Etikettmaler
            </CardTitle>
            <CardDescription>
              Opprett og administrer etikettprofiler til utskrift (DYMO/Browser)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
              <div className="md:col-span-2">
                <Label>Navn</Label>
                <Input value={newProfile.name} onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })} placeholder="F.eks. Standard med logo" />
              </div>
              <div>
                <Label>Linje 2</Label>
                <Input value={newProfile.extraLine1} onChange={(e) => setNewProfile({ ...newProfile, extraLine1: e.target.value })} placeholder="Valgfritt" />
              </div>
              <div>
                <Label>Linje 3</Label>
                <Input value={newProfile.extraLine2} onChange={(e) => setNewProfile({ ...newProfile, extraLine2: e.target.value })} placeholder="Valgfritt" />
              </div>
              <div>
                <Label>Logo URL</Label>
                <Input value={newProfile.logoUrl} onChange={(e) => setNewProfile({ ...newProfile, logoUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={newProfile.showUrl} onCheckedChange={(v) => setNewProfile({ ...newProfile, showUrl: !!v })} />
                <Label>Vis URL på etikett</Label>
              </div>
              <div className="md:col-span-5 flex justify-end">
                <Button onClick={() => {
                  if (!newProfile.name.trim()) return
                  createProfile.mutate({ name: newProfile.name.trim(), extraLine1: newProfile.extraLine1 || undefined, extraLine2: newProfile.extraLine2 || undefined, showUrl: newProfile.showUrl, logoUrl: newProfile.logoUrl || undefined })
                  setNewProfile({ name: '', extraLine1: '', extraLine2: '', showUrl: true, logoUrl: '' })
                }}>Opprett mal</Button>
              </div>
            </div>

            <Separator />

            {/* List */}
            <div className="space-y-2">
              {(profilesQuery.data || []).map((p) => (
                <div key={p.id} className="p-3 border rounded flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{[p.extraLine1, p.extraLine2].filter(Boolean).join(' • ') || '—'}</div>
                    <div className="text-xs text-muted-foreground">Vis URL: {p.showUrl ? 'Ja' : 'Nei'} {p.logoUrl ? `• Logo: ${p.logoUrl}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      const name = prompt('Nytt navn', p.name) || p.name
                      const line2 = prompt('Linje 2 (valgfritt)', p.extraLine1 || '') || undefined
                      const line3 = prompt('Linje 3 (valgfritt)', p.extraLine2 || '') || undefined
                      const logo = prompt('Logo URL (valgfritt)', p.logoUrl || '') || undefined
                      const showUrl = confirm('Skal URL vises på etikett? OK = Ja, Avbryt = Nei')
                      updateProfile.mutate({ id: p.id, name, extraLine1: line2, extraLine2: line3, logoUrl: logo, showUrl })
                    }}>Rediger</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteProfile.mutate({ id: p.id })}>Slett</Button>
                  </div>
                </div>
              ))}
              {profilesQuery.isLoading && (
                <div className="text-sm text-muted-foreground">Laster...</div>
              )}
            </div>
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

        {/* Organization Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Organisering
            </CardTitle>
            <CardDescription>
              Konfigurer hvordan lokasjoner og gjenstander kan organiseres
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">Hierarki-regler</div>
                  <div className="text-sm text-muted-foreground">
                    Definer hvilke lokasjonstyper som kan inneholde andre typer
                  </div>
                </div>
                <Link href="/settings/hierarchy">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    Konfigurer
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Streng hierarki-validering</Label>
                  <div className="text-sm text-gray-600">
                    Forhindre plassering av gjenstander som bryter hierarki-reglene
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Vis hierarki-advarsler</Label>
                  <div className="text-sm text-gray-600">
                    Vis advarsler når du oppretter lokasjoner som kan forvirre organisasjonen
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-foreslå lokasjoner</Label>
                  <div className="text-sm text-gray-600">
                    Foreslå passende overordnede lokasjoner basert på type
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
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
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <SignOutButton variant="destructive" className="w-full sm:w-auto">
                    Logg ut fra kontoen
                  </SignOutButton>
                  <div className="text-xs text-gray-500">
                    Dette vil logge deg ut og sende deg tilbake til innloggingssiden
                  </div>
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
