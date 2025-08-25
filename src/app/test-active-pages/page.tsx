"use client"

import { useActivePages } from '@/hooks/useActivePages'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TestActivePages() {
  const { activePagesConfig, isLoading, isPageActive, updatePageActive } = useActivePages()

  const testPages = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'items', name: 'Gjenstander' },
    { id: 'locations', name: 'Lokasjoner' },
    { id: 'settings', name: 'Innstillinger' },
    { id: 'ai', name: 'AI Assistant' },
    { id: 'blockchain', name: 'Blockchain' }
  ]

  if (isLoading) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Laster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Test Aktive Sider</h1>
        <p className="text-muted-foreground">
          Test-side for å verifisere at aktive sider funksjonaliteten fungerer
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Konfigurasjon Status</CardTitle>
            <CardDescription>
              Nåværende konfigurasjon av aktive sider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Konfigurasjon lagret:</strong> {Object.keys(activePagesConfig).length > 0 ? 'Ja' : 'Nei'}
              </div>
              <div>
                <strong>Antall konfigurerte sider:</strong> {Object.keys(activePagesConfig).length}
              </div>
              <div>
                <strong>Raw konfigurasjon:</strong>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(activePagesConfig, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Sider</CardTitle>
            <CardDescription>
              Test hvilke sider som er aktive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{page.name}</div>
                    <div className="text-sm text-muted-foreground">ID: {page.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isPageActive(page.id) ? 'default' : 'secondary'}>
                      {isPageActive(page.id) ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updatePageActive(page.id, !isPageActive(page.id))}
                    >
                      {isPageActive(page.id) ? 'Deaktiver' : 'Aktiver'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lenker</CardTitle>
            <CardDescription>
              Test-lenker til ulike sider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button asChild>
                <a href="/settings">Innstillinger</a>
              </Button>
              <Button asChild>
                <a href="/settings/active-pages">Aktive Sider Innstillinger</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
