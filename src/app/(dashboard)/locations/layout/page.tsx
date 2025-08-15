'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Grid3X3,
  TreePine,
  Smartphone,
  Layout,
  Save,
  Upload,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Info
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { LayoutCanvas } from '@/components/locations/LayoutCanvas'

// Helper function to flatten hierarchical location structure
function flattenLocations(locations: any[]): any[] {
  const flattened: any[] = []
  
  function addLocation(location: any) {
    flattened.push(location)
    if (location.children && location.children.length > 0) {
      location.children.forEach((child: any) => addLocation(child))
    }
  }
  
  locations.forEach(location => addLocation(location))
  return flattened
}

export default function LocationsLayoutPage() {
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [savedLayouts, setSavedLayouts] = useState<any[]>([])
  const [activeLayout, setActiveLayout] = useState<any>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // tRPC queries
  const { data: locations = [], isLoading, error, refetch } = trpc.locations.getAll.useQuery()
  
  // Flat list of all locations
  const allLocations = flattenLocations(locations)
  
  // Filter to get only rooms
  const rooms = allLocations.filter(loc => loc.type === 'ROOM')
  
  // Get selected room data
  const selectedRoomData = selectedRoom ? allLocations.find(loc => loc.id === selectedRoom) : null

  const handleSaveLayout = (layoutItems: any[]) => {
    if (!selectedRoom) {
      toast.error('Velg et rom først')
      return
    }

    const layout = {
      id: Math.random().toString(36).substr(2, 9),
      roomId: selectedRoom,
      roomName: selectedRoomData?.name || 'Ukjent rom',
      items: layoutItems,
      savedAt: new Date().toISOString()
    }

    setSavedLayouts(prev => {
      const filtered = prev.filter(l => l.roomId !== selectedRoom)
      return [...filtered, layout]
    })

    setActiveLayout(layout)
    toast.success(`Layout for ${selectedRoomData?.name} lagret!`)
  }

  const handleLoadLayout = (layout: any) => {
    setSelectedRoom(layout.roomId)
    setActiveLayout(layout)
    toast.success(`Layout for ${layout.roomName} lastet`)
  }

  const handleExportLayout = () => {
    if (!activeLayout) {
      toast.error('Ingen layout å eksportere')
      return
    }

    const dataStr = JSON.stringify(activeLayout, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `layout-${activeLayout.roomName}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success('Layout eksportert!')
  }

  const handleImportLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const layoutData = JSON.parse(e.target?.result as string)
        setSavedLayouts(prev => [...prev, layoutData])
        setActiveLayout(layoutData)
        setSelectedRoom(layoutData.roomId)
        toast.success('Layout importert!')
      } catch (error) {
        toast.error('Ugyldig layout-fil')
      }
    }
    reader.readAsText(file)
  }

  if (isLoading) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Laster lokasjoner...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Feil ved lasting av lokasjoner</h3>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Prøv igjen</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col cq layout-header">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3" style={{ minHeight: '12cqh' }}>
        <div className="flex items-center justify-between header-actions">
          <div className="flex items-center gap-4">
            <Link href="/locations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tilbake
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Layout className="w-6 h-6" />
                Visuell Layout Editor
              </h1>
              <p className="text-sm text-muted-foreground secondary-text">
                Tegn og organiser rominnredning visuelt
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Room selector */}
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Velg rom" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View toggles */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? (
                <>
                  <EyeOff className="w-4 h-4 mr-1" />
                  Rediger
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Forhåndsvis
                </>
              )}
            </Button>

            {/* Navigation */}
            <div className="flex border rounded-lg">
              <Link href="/locations">
                <Button variant="ghost" size="sm">
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/locations/tree">
                <Button variant="ghost" size="sm">
                  <TreePine className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/locations/mobile">
                <Button variant="ghost" size="sm">
                  <Smartphone className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex cq layout-main">
        {/* Sidebar */}
        <div className="layout-sidebar w-80 border-r bg-gray-50">
          <Tabs defaultValue="layouts" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-2" style={{ minHeight: 44 }}>
              <TabsTrigger value="layouts">Layouts</TabsTrigger>
              <TabsTrigger value="help">Hjelp</TabsTrigger>
            </TabsList>

            <TabsContent value="layouts" className="hidden data-[state=active]:block flex-1 p-4 space-y-4">
              {/* Export/Import */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportLayout}
                    disabled={!activeLayout}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Eksporter
                  </Button>
                  
                  <label className="flex-1">
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <span>
                        <Upload className="w-4 h-4 mr-1" />
                        Importer
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportLayout}
                    />
                  </label>
                </div>
              </div>

              {/* Saved layouts */}
              <div>
                <h3 className="font-medium mb-3">Lagrede layouts</h3>
                {savedLayouts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Ingen layouts lagret ennå
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedLayouts.map(layout => (
                      <Card 
                        key={layout.id} 
                        className={`cursor-pointer transition-colors ${
                          activeLayout?.id === layout.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => handleLoadLayout(layout)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{layout.roomName}</h4>
                              <p className="text-xs text-muted-foreground">
                                {layout.items.length} objekter
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {new Date(layout.savedAt).toLocaleDateString('no-NO')}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Current room info */}
              {selectedRoomData && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Aktivt rom</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="font-medium">{selectedRoomData.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {selectedRoomData._count?.items || 0} gjenstander
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {selectedRoomData.children?.length || 0} underlokasjoner
                        </Badge>
                      </div>
                      {selectedRoomData.description && (
                        <p className="text-xs text-muted-foreground">
                          {selectedRoomData.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="help" className="hidden data-[state=active]:block flex-1 p-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Hvordan bruke layout-editoren
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p><strong>Verktøy:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Velg: Flytt og rediger objekter</li>
                      <li>Rektangel: Tegn møbler og utstyr</li>
                      <li>Sirkel: Tegn runde objekter</li>
                      <li>Linje: Tegn vegger og skiller</li>
                    </ul>
                    
                    <p className="pt-2"><strong>Handlinger:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Dra for å flytte objekter</li>
                      <li>Klikk for å velge</li>
                      <li>Bruk egenskaps-panelet til høyre</li>
                      <li>Last opp bakgrunnsbilde</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Bruk grid for presis plassering</li>
                      <li>Lagre ofte for å ikke miste arbeid</li>
                      <li>Eksporter layouts for backup</li>
                      <li>Last opp et foto av rommet som bakgrunn</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas area */}
        <div className="flex-1 layout-canvas">
          {selectedRoom ? (
            <LayoutCanvas
              roomId={selectedRoom}
              locations={allLocations.filter(loc => loc.parentId === selectedRoom)}
              onSave={handleSaveLayout}
              initialLayout={activeLayout?.items || []}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Layout className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Velg et rom for å begynne</h3>
                <p className="text-sm text-muted-foreground">
                  Bruk dropdown-menyen øverst til høyre for å velge hvilket rom du vil tegne layout for
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
