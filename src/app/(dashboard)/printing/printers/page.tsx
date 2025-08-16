'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Printer, Wifi, WifiOff, Settings, Plus, MoreHorizontal, Eye, Edit, Trash2, Power, PowerOff, TestTube, AlertTriangle, CheckCircle, XCircle, Zap, Cable, Bluetooth } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'
import type { PrinterProfile, ConnectionType } from '@prisma/client'

interface PrinterWithStatus extends PrinterProfile {
  isOnline: boolean
  lastPing?: Date
  queuedJobs: number
  totalJobsCompleted: number
  paperLevel?: number
  inkLevel?: number
}

export default function PrintersPage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'settings' | 'diagnostics'>('overview')
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null)
  const [showAddPrinter, setShowAddPrinter] = useState(false)
  const [showTestPrint, setShowTestPrint] = useState(false)
  const [newPrinter, setNewPrinter] = useState({
    name: '',
    model: '',
    ipAddress: '',
    port: '9100',
    connectionType: 'NETWORK' as ConnectionType,
    location: '',
    description: '',
    settings: {}
  })

  // tRPC queries
  const { 
    data: printers, 
    isLoading, 
    refetch: refetchPrinters 
  } = trpc.printing.listPrinters.useQuery()

  const { data: supportedModels } = trpc.printing.getSupportedPrinterModels.useQuery()

  // Mutations
  const addPrinterMutation = trpc.printing.addPrinter.useMutation({
    onSuccess: () => {
      setShowAddPrinter(false)
      refetchPrinters()
      resetNewPrinter()
    }
  })

  const updatePrinterMutation = trpc.printing.updatePrinter.useMutation({
    onSuccess: () => {
      refetchPrinters()
    }
  })

  const deletePrinterMutation = trpc.printing.deletePrinter.useMutation({
    onSuccess: () => {
      refetchPrinters()
    }
  })

  const testPrinterMutation = trpc.printing.testPrinter.useMutation()

  const resetNewPrinter = () => {
    setNewPrinter({
      name: '',
      model: '',
      ipAddress: '',
      port: '9100',
      connectionType: 'NETWORK',
      location: '',
      description: '',
      settings: {}
    })
  }

  const getConnectionIcon = (connectionType: ConnectionType, isOnline: boolean) => {
    const iconClass = isOnline ? "text-green-600" : "text-gray-400"
    
    switch (connectionType) {
      case 'NETWORK':
        return isOnline ? <Wifi className={`h-4 w-4 ${iconClass}`} /> : <WifiOff className={`h-4 w-4 ${iconClass}`} />
      case 'USB':
        return <Cable className={`h-4 w-4 ${iconClass}`} />
      case 'BLUETOOTH':
        return <Bluetooth className={`h-4 w-4 ${iconClass}`} />
      default:
        return <Printer className={`h-4 w-4 ${iconClass}`} />
    }
  }

  const getStatusBadge = (isOnline: boolean, hasWarnings?: boolean) => {
    if (!isOnline) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <PowerOff className="h-3 w-3" />
        Frakoblet
      </Badge>
    }
    
    if (hasWarnings) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Advarsler
      </Badge>
    }
    
    return <Badge variant="default" className="flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      Tilkoblet
    </Badge>
  }

  const handleAddPrinter = async () => {
    try {
      await addPrinterMutation.mutateAsync(newPrinter)
    } catch (error) {
      console.error('Feil ved tillegging av skriver:', error)
    }
  }

  const handleTestPrint = async (printerId: string) => {
    try {
      await testPrinterMutation.mutateAsync({ printerId })
      setShowTestPrint(false)
    } catch (error) {
      console.error('Feil ved testutskrift:', error)
    }
  }

  const handleDeletePrinter = async (printerId: string) => {
    if (confirm('Er du sikker på at du vil slette denne skriveren?')) {
      try {
        await deletePrinterMutation.mutateAsync({ printerId })
      } catch (error) {
        console.error('Feil ved sletting av skriver:', error)
      }
    }
  }

  const PrinterCard = ({ printer }: { printer: PrinterWithStatus }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getConnectionIcon(printer.connectionType, printer.isOnline)}
              <CardTitle className="text-sm">{printer.name}</CardTitle>
            </div>
            {getStatusBadge(printer.isOnline, printer.paperLevel && printer.paperLevel < 20)}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSelectedPrinter(printer.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Se detaljer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowTestPrint(true)}>
                <TestTube className="h-4 w-4 mr-2" />
                Test utskrift
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Konfigurer
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeletePrinter(printer.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Slett
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardDescription className="text-xs">
          {printer.model} • {printer.location || 'Ingen lokasjon'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-xs text-muted-foreground">Tilkobling</Label>
            <div className="flex items-center gap-2">
              <span className="capitalize">{printer.connectionType.toLowerCase()}</span>
              {printer.connectionType === 'NETWORK' && printer.ipAddress && (
                <span className="text-muted-foreground">({printer.ipAddress})</span>
              )}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Jobber i kø</Label>
            <span>{printer.queuedJobs || 0}</span>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Fullførte jobber</Label>
            <span>{printer.totalJobsCompleted || 0}</span>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Sist aktiv</Label>
            <span className="text-xs">
              {printer.lastPing 
                ? formatDistanceToNow(new Date(printer.lastPing), { addSuffix: true, locale: nb })
                : 'Ukjent'
              }
            </span>
          </div>
        </div>
        
        {/* Resource levels */}
        {(printer.paperLevel !== undefined || printer.inkLevel !== undefined) && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Ressursnivå</Label>
            {printer.paperLevel !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-xs w-12">Papir:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      printer.paperLevel > 50 ? 'bg-green-500' :
                      printer.paperLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${printer.paperLevel}%` }}
                  ></div>
                </div>
                <span className="text-xs w-8">{printer.paperLevel}%</span>
              </div>
            )}
            {printer.inkLevel !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-xs w-12">Blekk:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      printer.inkLevel > 50 ? 'bg-green-500' :
                      printer.inkLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${printer.inkLevel}%` }}
                  ></div>
                </div>
                <span className="text-xs w-8">{printer.inkLevel}%</span>
              </div>
            )}
          </div>
        )}
        
        {printer.description && (
          <div className="text-xs text-muted-foreground">
            {printer.description}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skrivere</h1>
          <p className="text-muted-foreground">
            Administrer og konfigurere skrivere for utskrift
          </p>
        </div>
        
        <Button onClick={() => setShowAddPrinter(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Legg til skriver
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Oversikt ({printers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Innstillinger
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Diagnostikk
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : printers?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Printer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ingen skrivere konfigurert</h3>
                <p className="text-muted-foreground mb-4">
                  Legg til din første skriver for å komme i gang med utskrift.
                </p>
                <Button onClick={() => setShowAddPrinter(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Legg til skriver
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {printers.map(printer => (
                <PrinterCard key={printer.id} printer={printer as PrinterWithStatus} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Globale innstillinger</CardTitle>
              <CardDescription>
                Konfigurer standard innstillinger for alle skrivere
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Standard oppløsning</Label>
                  <Select defaultValue="300">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="203">203 DPI</SelectItem>
                      <SelectItem value="300">300 DPI</SelectItem>
                      <SelectItem value="600">600 DPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Standard hastighet</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Langsom (høy kvalitet)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="fast">Rask (lav kvalitet)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-calibrate">Automatisk kalibrering</Label>
                  <Switch id="auto-calibrate" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="low-supply-notifications">Varsler ved lav forsyning</Label>
                  <Switch id="low-supply-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-mode">Vedlikeholdsmodus</Label>
                  <Switch id="maintenance-mode" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tilkoblingstest</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Test tilkobling til alle konfigurerte skrivere
                </p>
                <Button className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Test alle skrivere
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ytelsesanalyse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Gjennomsnittlig print-tid:</span>
                    <span>2.4s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Suksessrate:</span>
                    <span className="text-green-600">98.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Aktive skrivere:</span>
                    <span>{printers?.filter(p => (p as PrinterWithStatus).isOnline).length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Printer Dialog */}
      <Dialog open={showAddPrinter} onOpenChange={setShowAddPrinter}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Legg til ny skriver</DialogTitle>
            <DialogDescription>
              Konfigurer en ny skriver for utskrift
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="printer-name">Navn *</Label>
                <Input
                  id="printer-name"
                  placeholder="F.eks. DYMO LabelWriter 450"
                  value={newPrinter.name}
                  onChange={(e) => setNewPrinter(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printer-model">Modell *</Label>
                <Select 
                  value={newPrinter.model}
                  onValueChange={(value) => setNewPrinter(prev => ({ ...prev, model: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg modell" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DYMO_LW_450">DYMO LabelWriter 450</SelectItem>
                    <SelectItem value="DYMO_LW_450_TURBO">DYMO LabelWriter 450 Turbo</SelectItem>
                    <SelectItem value="DYMO_LW_550">DYMO LabelWriter 550</SelectItem>
                    <SelectItem value="DYMO_LW_550_TURBO">DYMO LabelWriter 550 Turbo</SelectItem>
                    <SelectItem value="ZEBRA_ZD220">Zebra ZD220</SelectItem>
                    <SelectItem value="ZEBRA_ZD420">Zebra ZD420</SelectItem>
                    <SelectItem value="BROTHER_QL_800">Brother QL-800</SelectItem>
                    <SelectItem value="BROTHER_QL_820NWB">Brother QL-820NWB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tilkoblingstype</Label>
              <Select 
                value={newPrinter.connectionType}
                onValueChange={(value: ConnectionType) => setNewPrinter(prev => ({ ...prev, connectionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NETWORK">Nettverk (Wi-Fi/Ethernet)</SelectItem>
                  <SelectItem value="USB">USB</SelectItem>
                  <SelectItem value="BLUETOOTH">Bluetooth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newPrinter.connectionType === 'NETWORK' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="ip-address">IP-adresse</Label>
                  <Input
                    id="ip-address"
                    placeholder="192.168.1.100"
                    value={newPrinter.ipAddress}
                    onChange={(e) => setNewPrinter(prev => ({ ...prev, ipAddress: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    placeholder="9100"
                    value={newPrinter.port}
                    onChange={(e) => setNewPrinter(prev => ({ ...prev, port: e.target.value }))}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="location">Lokasjon</Label>
              <Input
                id="location"
                placeholder="F.eks. Kontor, Lager, Resepsjon"
                value={newPrinter.location}
                onChange={(e) => setNewPrinter(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                placeholder="Valgfri beskrivelse av skriveren"
                value={newPrinter.description}
                onChange={(e) => setNewPrinter(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddPrinter(false)}>
                Avbryt
              </Button>
              <Button 
                onClick={handleAddPrinter}
                disabled={!newPrinter.name || !newPrinter.model || addPrinterMutation.isLoading}
              >
                {addPrinterMutation.isLoading ? 'Legger til...' : 'Legg til skriver'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Print Dialog */}
      <Dialog open={showTestPrint} onOpenChange={setShowTestPrint}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test utskrift</DialogTitle>
            <DialogDescription>
              Send en test-etikett til skriveren for å verifisere tilkobling
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-2">Test-etikett innhold:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Skriver: {printers?.find(p => p.id === selectedPrinter)?.name}</p>
                <p>• Dato: {new Date().toLocaleDateString('no-NO')}</p>
                <p>• Test-ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                <p>• QR-kode med test-data</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTestPrint(false)}>
                Avbryt
              </Button>
              <Button 
                onClick={() => selectedPrinter && handleTestPrint(selectedPrinter)}
                disabled={testPrinterMutation.isLoading}
              >
                {testPrinterMutation.isLoading ? 'Sender...' : 'Send test-utskrift'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Printer Details Dialog */}
      {selectedPrinter && (
        <Dialog open={!!selectedPrinter} onOpenChange={() => setSelectedPrinter(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Skriver-detaljer</DialogTitle>
              <DialogDescription>
                Detaljert informasjon og innstillinger for skriveren
              </DialogDescription>
            </DialogHeader>
            {(() => {
              const printer = printers?.find(p => p.id === selectedPrinter) as PrinterWithStatus
              if (!printer) return null
              
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Navn</Label>
                      <p className="text-sm text-muted-foreground">{printer.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">{getStatusBadge(printer.isOnline)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Modell</Label>
                      <p className="text-sm text-muted-foreground">{printer.model}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tilkobling</Label>
                      <div className="flex items-center gap-2">
                        {getConnectionIcon(printer.connectionType, printer.isOnline)}
                        <span className="text-sm capitalize">{printer.connectionType.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {printer.connectionType === 'NETWORK' && printer.ipAddress && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">IP-adresse</Label>
                        <p className="text-sm text-muted-foreground">{printer.ipAddress}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Port</Label>
                        <p className="text-sm text-muted-foreground">{printer.port || '9100'}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Lokasjon</Label>
                      <p className="text-sm text-muted-foreground">{printer.location || 'Ikke angitt'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Sist aktiv</Label>
                      <p className="text-sm text-muted-foreground">
                        {printer.lastPing 
                          ? formatDistanceToNow(new Date(printer.lastPing), { addSuffix: true, locale: nb })
                          : 'Ukjent'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {printer.description && (
                    <div>
                      <Label className="text-sm font-medium">Beskrivelse</Label>
                      <p className="text-sm text-muted-foreground">{printer.description}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      onClick={() => setShowTestPrint(true)}
                      className="flex-1"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test utskrift
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Konfigurer
                    </Button>
                  </div>
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}