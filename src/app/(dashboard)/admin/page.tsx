'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Activity, 
  Database, 
  Search,
  Settings,
  Users,
  BarChart3,
  Bell,
  HardDrive,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { BackgroundJobsMonitor } from '@/components/admin/BackgroundJobsMonitor'
import { trpc } from '@/lib/trpc/client'
import { useSession } from 'next-auth/react'

export default function AdminPage() {
  const { data: session } = useSession()
  const [selectedTab, setSelectedTab] = useState('overview')

  // In a real app, check if user has admin permissions
  const isAdmin = true // session?.user?.role === 'admin'

  if (!isAdmin) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600">Ingen tilgang</h2>
              <p className="text-gray-500">Du har ikke administratortilgang til denne siden.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="page container mx-auto px-4 py-8 cq">
      {/* Header */}
      <div className="mb-8 cq">
        <h1 className="text-3xl font-bold title">Administrator Panel</h1>
        <p className="text-muted-foreground secondary-text">
          Overvåk og administrer systemet
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6 cq">
        <TabsList className="grid w-full grid-cols-5" style={{ minHeight: 44 }}>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Oversikt
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Bakgrunnsjobber
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Brukere
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Innstillinger
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="hidden data-[state=active]:block space-y-6">
          {/* System Health */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System status</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Operativ</div>
                <p className="text-xs text-muted-foreground">
                  Alle tjenester kjører normalt
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktive brukere</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 fra forrige uke
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totale gjenstander</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,248</div>
                <p className="text-xs text-muted-foreground">
                  +89 denne måneden
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.5k</div>
                <p className="text-xs text-muted-foreground">
                  Siste 24 timer
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hurtighandlinger</CardTitle>
              <CardDescription>
                Vanlige administratoroppgaver
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span className="font-medium">Database backup</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Opprett sikkerhetskopi av databasen
                  </p>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span className="font-medium">Reindekser søk</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Oppdater Meilisearch indeks
                  </p>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span className="font-medium">Test notifikasjoner</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Send test push notifikasjoner
                  </p>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Systemaktiviteter</CardTitle>
              <CardDescription>
                Siste administratorhendelser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    time: '2 timer siden',
                    event: 'Daglig vedlikehold kjørt',
                    details: 'Sjekket 156 utløpsdatoer, sendt 3 varsler',
                    status: 'success'
                  },
                  {
                    time: '6 timer siden',
                    event: 'Ny bruker registrert',
                    details: 'john.doe@example.com',
                    status: 'info'
                  },
                  {
                    time: '12 timer siden',
                    event: 'Søkeindeks oppdatert',
                    details: '1,248 dokumenter indeksert',
                    status: 'success'
                  },
                  {
                    time: '1 dag siden',
                    event: 'Backup fullført',
                    details: 'Database backup (245 MB)',
                    status: 'success'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded border">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{activity.event}</div>
                      <div className="text-xs text-muted-foreground">{activity.details}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Background Jobs Tab */}
        <TabsContent value="jobs" className="hidden data-[state=active]:block">
          <BackgroundJobsMonitor />
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="hidden data-[state=active]:block space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Systemresurser</CardTitle>
              <CardDescription>
                Overvåking av systemytelse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CPU-bruk</span>
                    <span className="text-sm font-medium">23%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '23%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Minnebruk</span>
                    <span className="text-sm font-medium">67%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Diskplass</span>
                    <span className="text-sm font-medium">12%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tjenestestatus</CardTitle>
              <CardDescription>
                Status for alle eksterne tjenester
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'PostgreSQL Database', status: 'operational', latency: '2ms' },
                  { name: 'Meilisearch', status: 'operational', latency: '15ms' },
                  { name: 'Vercel Blob Storage', status: 'operational', latency: '45ms' },
                  { name: 'Inngest Background Jobs', status: 'operational', latency: '120ms' },
                  { name: 'Push Notification Service', status: 'operational', latency: '200ms' }
                ].map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{service.latency}</Badge>
                      <Badge variant="outline">Operativ</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="hidden data-[state=active]:block space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brukeroversikt</CardTitle>
              <CardDescription>
                Administrer brukere og tilganger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Brukeradministrasjon kommer snart...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="hidden data-[state=active]:block space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Systeminnstillinger</CardTitle>
              <CardDescription>
                Konfigurer systemoppførsel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Systeminnstillinger kommer snart...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
