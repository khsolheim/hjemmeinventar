'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  Camera, 
  Search,
  Package,
  MapPin,
  Calendar
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { dymoService } from '@/lib/printing/dymo-service'
import { printQueue } from '@/lib/printing/print-queue'

// Mock QR scan results
const mockQRResults = {
  'KJK-0001': {
    type: 'location',
    name: 'Kjøkken',
    description: 'Hovedkjøkken i første etasje',
    itemCount: 12,
    items: [
      { name: 'Kaffe Friele', category: 'Mat og Drikke' },
      { name: 'Kokosolje', category: 'Mat og Drikke' },
      { name: 'Krydder sett', category: 'Mat og Drikke' }
    ]
  },
  'KJK-0002': {
    type: 'location',
    name: 'Kjøkkenskap øverst til høyre',
    description: 'Øvre skap i kjøkkenet',
    itemCount: 8,
    items: [
      { name: 'Kaffe Friele', category: 'Mat og Drikke' },
      { name: 'Te Earl Grey', category: 'Mat og Drikke' }
    ]
  },
  'ITEM-001': {
    type: 'item',
    name: 'DROPS Melody Garn - Perlegrå',
    category: 'Garn og Strikking',
    location: 'Soverom > Strikkeskap',
    quantity: '3 av 5 nøste',
    description: '71% Alpakka, 25% Ull, 4% Polyamid'
  }
}

export default function ScanPage() {
  const [manualCode, setManualCode] = useState('')
  const [scanResult, setScanResult] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const params = useSearchParams()
  const distributionCode = params?.get('d') || ''

  const { data: distributionData, refetch: refetchDistribution } = trpc.items.getDistributionByQRCode.useQuery(
    { qrCode: distributionCode },
    { enabled: !!distributionCode }
  )
  const consumeMutation = trpc.items.consumeFromDistribution.useMutation({
    onSuccess: () => { refetchDistribution() },
  })

  useEffect(() => {
    if (distributionData) {
      setScanResult({ type: 'distribution', data: distributionData })
    }
  }, [distributionData])

  const handleManualScan = async () => {
    const code = manualCode.trim()
    if (!code) return
    // Distribution codes start with D-
    if (code.startsWith('D-')) {
      try {
        const data = await consumeMutation.client.items.getDistributionByQRCode.query({ qrCode: code })
        setScanResult({ type: 'distribution', data })
        return
      } catch (e) {
        setScanResult({ error: 'QR-kode ikke funnet i systemet' })
        return
      }
    }
    // Fallback to mock lookup
    const result = mockQRResults[code as keyof typeof mockQRResults]
    if (result) {
      setScanResult(result)
    } else {
      setScanResult({ error: 'QR-kode ikke funnet i systemet' })
    }
  }

  const startCameraScanning = () => {
    setIsScanning(true)
    // In a real implementation, this would start the camera
    // For demo purposes, we'll simulate a successful scan after 2 seconds
    setTimeout(() => {
      setScanResult(mockQRResults['KJK-0001'])
      setIsScanning(false)
    }, 2000)
  }

  const clearResult = () => {
    setScanResult(null)
    setManualCode('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">QR Scanner</h1>
        <p className="text-muted-foreground">
          Skann QR-koder for å finne gjenstander og lokasjoner
        </p>
      </div>

      {/* Scanner Section */}
      {!scanResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Camera Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Kamera-skanning
              </CardTitle>
              <CardDescription>
                Bruk kameraet til å skanne QR-koder automatisk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                {isScanning ? (
                  <div className="py-12">
                    <div className="w-32 h-32 mx-auto border-4 border-primary border-dashed rounded-lg flex items-center justify-center animate-pulse">
                      <QrCode className="w-16 h-16 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Skanner etter QR-kode...
                    </p>
                  </div>
                ) : (
                  <div className="py-12">
                    <div className="w-32 h-32 mx-auto border-4 border-muted border-dashed rounded-lg flex items-center justify-center">
                      <Camera className="w-16 h-16 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Trykk på knappen nedenfor for å starte kameraet
                    </p>
                  </div>
                )}
                <Button 
                  onClick={startCameraScanning}
                  disabled={isScanning}
                  className="w-full"
                  aria-label="Start kamera-skanning"
                >
                  {isScanning ? 'Skanner...' : 'Start kamera-skanning'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Manual Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Manuell inntasting
              </CardTitle>
              <CardDescription>
                Skriv inn QR-koden manuelt hvis skanning ikke fungerer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="manual-code">QR-kode</Label>
                 <Input
                  id="manual-code"
                   placeholder="F.eks. D-ABCDEFGH, KJK-0001"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
                />
              </div>
              <Button 
                onClick={handleManualScan}
                className="w-full"
                disabled={!manualCode.trim()}
                aria-label="Søk etter QR-kode"
              >
                Søk etter kode
              </Button>

              {/* Test Codes */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Test-koder:</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>KJK-0001 (Kjøkken)</div>
                  <div>KJK-0002 (Kjøkkenskap)</div>
                  <div>ITEM-001 (Garn)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scan Result */}
      {scanResult && scanResult.type === 'distribution' && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Fordeling funnet
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={clearResult}>Skann ny kode</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Batch</div>
                <div className="font-medium">{scanResult.data.item.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Lokasjon</div>
                <div className="font-medium">{scanResult.data.location.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tilgjengelig</div>
                <div className="font-medium">{scanResult.data.quantity} {scanResult.data.item.unit}</div>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="take-out">Ta ut antall</Label>
                <Input id="take-out" type="number" min={0} max={scanResult.data.quantity} defaultValue={1} />
              </div>
              <div className="flex-1">
                <Label htmlFor="take-notes">Notater (valgfritt)</Label>
                <Input id="take-notes" placeholder="F.eks. til prosjekt X" />
              </div>
              <Button onClick={() => {
                const amount = Number((document.getElementById('take-out') as HTMLInputElement)?.value || '0')
                const notes = (document.getElementById('take-notes') as HTMLInputElement)?.value || undefined
                if (amount > 0) {
                  consumeMutation.mutate({ distributionId: scanResult.data.id, amount, notes })
                }
              }}
              >Ta ut</Button>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" onClick={async () => {
                try {
                  await dymoService.printQRLabel({
                    itemName: scanResult.data.item.name,
                    locationName: scanResult.data.location.name,
                    qrCode: scanResult.data.qrCode,
                    dateAdded: new Date().toLocaleDateString('nb-NO')
                  }, { copies: 1 })
                } catch (e) {
                  console.error(e)
                }
              }}>Skriv ut på DYMO</Button>
              <Button variant="outline" onClick={() => {
                printQueue.add({
                  itemName: scanResult.data.item.name,
                  locationName: scanResult.data.location.name,
                  qrCode: scanResult.data.qrCode,
                  dateAdded: new Date().toLocaleDateString('nb-NO')
                })
              }}>Legg i utskriftskø</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {scanResult && scanResult.type !== 'distribution' && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {scanResult.error ? (
                  <>
                    <Search className="w-5 h-5 text-red-500" />
                    Ikke funnet
                  </>
                ) : scanResult.type === 'location' ? (
                  <>
                    <MapPin className="w-5 h-5" />
                    Lokasjon funnet
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    Gjenstand funnet
                  </>
                )}
              </CardTitle>
              <Button variant="outline" onClick={clearResult}>
                Skann ny kode
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {scanResult.error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-red-700 mb-2">
                  {scanResult.error}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sjekk at koden er riktig eller at gjenstanden/lokasjonen er registrert i systemet
                </p>
              </div>
            ) : scanResult.type === 'location' ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold">{scanResult.name}</h3>
                  <p className="text-muted-foreground">{scanResult.description}</p>
                  <Badge variant="secondary" className="mt-2">
                    {scanResult.itemCount} gjenstander
                  </Badge>
                </div>

                {scanResult.items && scanResult.items.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Gjenstander i denne lokasjonen:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {scanResult.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.category}</div>
                          </div>
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold">{scanResult.name}</h3>
                  <p className="text-muted-foreground">{scanResult.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{scanResult.category}</Badge>
                    <Badge variant="outline">{scanResult.quantity}</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{scanResult.location}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>Nylige skanninger</CardTitle>
          <CardDescription>
            De siste QR-kodene du har skannet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Ingen skanninger ennå</p>
            <p className="text-sm">
              Skanninger vil vises her når du begynner å bruke QR-skanneren
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
