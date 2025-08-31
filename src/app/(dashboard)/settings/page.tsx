"use client"

import { NotificationSettings } from '@/components/notifications/NotificationSettings'
import { WizardSettings } from '@/components/settings/WizardSettings'
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
import { useTheme } from 'next-themes'
import { useCompactMode } from '@/hooks/useCompactMode'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { isCompact, setCompactMode } = useCompactMode()
  const commonOpts = { enabled: status === 'authenticated', retry: 0, refetchOnWindowFocus: false, refetchOnMount: false, staleTime: 5 * 60 * 1000 } as const
  // const profilesQuery = trpc.users.getLabelProfiles.useQuery(undefined, commonOpts) // Temporarily disabled
  const profilesQuery = { data: [], refetch: () => {}, isLoading: false } // Placeholder since getLabelProfiles not available
  const profileQuery = trpc.users.getProfile.useQuery(undefined, commonOpts)
  const updateUser = trpc.users.updateProfile.useMutation({ onSuccess: () => { profileQuery.refetch() } })
  // const createProfile = trpc.users.createLabelProfile.useMutation({ onSuccess: () => profilesQuery.refetch() }) // Temporarily disabled
  // const updateProfile = trpc.users.updateLabelProfile.useMutation({ onSuccess: () => profilesQuery.refetch() }) // Temporarily disabled
  // const deleteProfile = trpc.users.deleteLabelProfile.useMutation({ onSuccess: () => profilesQuery.refetch() }) // Temporarily disabled
  
  // Placeholder mutations
  const createProfile = { mutateAsync: async (data: any) => {}, mutate: async (data: any) => {} }
  const updateProfile = { mutateAsync: async (data: any) => {}, mutate: async (data: any) => {} }
  const deleteProfile = { mutateAsync: async (data: any) => {}, mutate: async (data: any) => {} }
  const [newProfile, setNewProfile] = useState({ name: '', extraLine1: '', extraLine2: '', showUrl: true, logoUrl: '' })
  const [defaultProfileId, setDefaultProfileId] = useState<string>('')

  useEffect(() => {
    // TODO: Implement default label profile selection
    // if (!defaultProfileId && profileQuery.data?.defaultLabelProfileId) {
    //   setDefaultProfileId(profileQuery.data.defaultLabelProfileId)
    // }
  }, [profileQuery.data, defaultProfileId])
  if (status !== 'authenticated') {
    return (
      <div className="page container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Innstillinger</h1>
      </div>
    )
  }
  return (
    <div className="page container mx-auto px-4 py-8 cq">
      {/* Header */}
      <div className="mb-8 cq">
        <h1 className="text-3xl font-bold title">Innstillinger</h1>
        <p className="text-muted-foreground secondary-text">
          Administrer kontoinformasjon og app-preferanser
        </p>
      </div>

      <div className="settings-panel grid gap-6 lg:grid-cols-2 lg:gap-8 auto-rows-max cq">
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
                <Input id="firstName" placeholder="Ditt fornavn" readOnly />
              </div>
              <div>
                <Label htmlFor="lastName">Etternavn</Label>
                <Input id="lastName" placeholder="Ditt etternavn" readOnly />
              </div>
            </div>
            <div>
              <Label htmlFor="email">E-post</Label>
              <Input id="email" type="email" placeholder="din@epost.no" readOnly />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-2">
                <Label htmlFor="user-logo-url">Logo</Label>
                <div className="flex items-center gap-3">
                  <Input id="user-logo-url" placeholder="https://..." readOnly />
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
              <Label htmlFor="defaultLabelProfile">Standard etikettmal</Label>
              <select id="defaultLabelProfile" name="defaultLabelProfile" className="w-full mt-1 px-3 py-2 border rounded-md" value={defaultProfileId || ''} onChange={(e) => setDefaultProfileId(e.target.value)}>
                <option value="">(Ingen)</option>
                {(profilesQuery.data || []).map((p: any) => (
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
            <div className="space-y-4">
              {/* First row - Name (full width) */}
              <div>
                <Label htmlFor="newProfileName">Navn</Label>
                <Input id="newProfileName" name="newProfileName" value={newProfile.name} onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })} placeholder="F.eks. Standard med logo" />
              </div>

              {/* Second row - Extra lines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newProfileLine2">Linje 2 (valgfritt)</Label>
                  <Input id="newProfileLine2" name="newProfileLine2" value={newProfile.extraLine1} onChange={(e) => setNewProfile({ ...newProfile, extraLine1: e.target.value })} placeholder="Ekstra tekst linje 2" />
                </div>
                <div>
                  <Label htmlFor="newProfileLine3">Linje 3 (valgfritt)</Label>
                  <Input id="newProfileLine3" name="newProfileLine3" value={newProfile.extraLine2} onChange={(e) => setNewProfile({ ...newProfile, extraLine2: e.target.value })} placeholder="Ekstra tekst linje 3" />
                </div>
              </div>

              {/* Third row - Logo and URL switch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <Label htmlFor="newProfileLogoUrl">Logo URL (valgfritt)</Label>
                  <Input id="newProfileLogoUrl" name="newProfileLogoUrl" value={newProfile.logoUrl} onChange={(e) => setNewProfile({ ...newProfile, logoUrl: e.target.value })} placeholder="https://eksempel.com/logo.png" />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <Switch id="newProfileShowUrl" name="newProfileShowUrl" checked={newProfile.showUrl} onCheckedChange={(v) => setNewProfile({ ...newProfile, showUrl: !!v })} />
                  <Label htmlFor="newProfileShowUrl">Vis URL på etikett</Label>
                </div>
              </div>

              {/* Button row */}
              <div className="flex justify-end">
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
              {(profilesQuery.data || []).map((p: any) => (
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

        {/* Notification Settings - Full width */}
        <div className="lg:col-span-2">
          <NotificationSettings />
        </div>

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
            <div className="setting-row flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Vis profil til andre brukere</Label>
                <div className="text-sm text-muted-foreground">
                  Tillat andre medlemmer i husholdningen å se profilen din
                </div>
              </div>
              <Switch className="setting-switch" />
            </div>

            <div className="setting-row flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Anonymiser aktivitetslogger</Label>
                <div className="text-sm text-muted-foreground">
                  Skjul ditt navn i delte aktivitetslogger
                </div>
              </div>
              <Switch className="setting-switch" />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-base">Endre passord</Label>
              <div className="grid grid-cols-1 gap-2">
                <Input id="currentPassword" name="currentPassword" type="password" placeholder="Nåværende passord" readOnly />
                <Input id="newPassword" name="newPassword" type="password" placeholder="Nytt passord" readOnly />
                <Input id="confirmNewPassword" name="confirmNewPassword" type="password" placeholder="Bekreft nytt passord" readOnly />
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
            <div className="setting-row flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pref-dark-mode" className="text-base">Mørk modus</Label>
                <div className="text-sm text-muted-foreground">
                  Bruk mørk fargepalett for appen
                </div>
              </div>
              <Switch 
                id="pref-dark-mode" 
                name="pref-dark-mode" 
                className="setting-switch"
                checked={resolvedTheme === 'dark'}
                onCheckedChange={(checked) => {
                  setTheme(checked ? 'dark' : 'light')
                }}
              />
            </div>

            <div className="setting-row flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pref-compact-mode" className="text-base">Kompakt visning</Label>
                <div className="text-sm text-muted-foreground">
                  Vis mer informasjon på mindre plass
                </div>
              </div>
              <Switch 
                id="pref-compact-mode" 
                name="pref-compact-mode" 
                className="setting-switch"
                checked={isCompact}
                onCheckedChange={setCompactMode}
              />
            </div>

            <div className="setting-row flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pref-auto-save" className="text-base">Automatisk lagring</Label>
                <div className="text-sm text-muted-foreground">
                  Lagre endringer automatisk mens du skriver
                </div>
              </div>
              <Switch id="pref-auto-save" name="pref-auto-save" defaultChecked className="setting-switch" />
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

        {/* Organization Settings - Full width */}
        <Card className="lg:col-span-2">
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
                  <Label htmlFor="org-strict-validation" className="text-base">Streng hierarki-validering</Label>
                  <div className="text-sm text-muted-foreground">
                    Forhindre plassering av gjenstander som bryter hierarki-reglene
                  </div>
                </div>
                <Switch id="org-strict-validation" name="org-strict-validation" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="org-show-warnings" className="text-base">Vis hierarki-advarsler</Label>
                  <div className="text-sm text-muted-foreground">
                    Vis advarsler når du oppretter lokasjoner som kan forvirre organisasjonen
                  </div>
                </div>
                <Switch id="org-show-warnings" name="org-show-warnings" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="org-auto-suggest" className="text-base">Auto-foreslå lokasjoner</Label>
                  <div className="text-sm text-muted-foreground">
                    Foreslå passende overordnede lokasjoner basert på type
                  </div>
                </div>
                <Switch id="org-auto-suggest" name="org-auto-suggest" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wizard Settings - Full width */}
        <div className="lg:col-span-2">
          <WizardSettings />
        </div>

        {/* Data Management - Full width */}
        <Card className="lg:col-span-2">
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
              <div className="text-sm text-muted-foreground mb-4">
                Disse handlingene kan ikke angres
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <SignOutButton variant="destructive" className="w-full sm:w-auto">
                    Logg ut fra kontoen
                  </SignOutButton>
                  <div className="text-xs text-muted-foreground">
                    Dette vil logge deg ut og sende deg tilbake til innloggingssiden
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button variant="destructive" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Slett alle data
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Dette vil permanent slette alle dine gjenstander, lokasjoner og aktiviteter
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help & Support - Full width */}
        <Card className="lg:col-span-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div className="text-sm text-muted-foreground space-y-1">
              <div>Versjon: 1.0.0</div>
              <div>Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}</div>
              <div>© 2024 HMS - Home Management System</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
