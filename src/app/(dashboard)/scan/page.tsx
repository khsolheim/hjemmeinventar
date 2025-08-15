'use client'

import { useEffect, useState, Suspense } from 'react'
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
import { useSession } from 'next-auth/react'
// removed duplicate Button import
import { dymoService } from '@/lib/printing/dymo-service'
import { printQueue } from '@/lib/printing/print-queue'

function ScanPageContent() {
  const [manualCode, setManualCode] = useState('')
  const [scanResult, setScanResult] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const params = useSearchParams()
  const distributionCode = params?.get('d') || ''
  const { data: session, status } = useSession()
  const commonOpts = { retry: 0, refetchOnWindowFocus: false, refetchOnMount: false, staleTime: 5 * 60 * 1000 } as const
  const profiles = trpc.users.getLabelProfiles.useQuery(undefined, { 
    ...commonOpts, 
    enabled: status === 'authenticated' && !!scanResult && scanResult.type === 'distribution' 
  })
  const userProfile = trpc.users.getProfile.useQuery(undefined, { 
    ...commonOpts, 
    enabled: status === 'authenticated' && !!scanResult && scanResult.type === 'distribution' 
  })
  const [selectedProfileId, setSelectedProfileId] = useState('')

  useEffect(() => {
    if (!selectedProfileId && userProfile.data?.defaultLabelProfileId) {
      setSelectedProfileId(userProfile.data.defaultLabelProfileId)
    }
  }, [userProfile.data, selectedProfileId])

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
    // Kun distributionskoder (D-......) støttes
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
    // For andre koder viser vi not found (ingen dummy-data)
    setScanResult({ error: 'QR-kode ikke funnet i systemet' })
  }

  const startCameraScanning = () => {
    setIsScanning(true)
    // Ingen dummy-simulering – stopp skanning uten å sette resultat
    setTimeout(() => {
      setIsScanning(false)
    }, 1500)
  }

  const clearResult = () => {
    setScanResult(null)
    setManualCode('')
  }

  if (status !== 'authenticated') {
    return (
      <div className="page container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">QR Scanner</h1>
      </div>
    )
  }

  return (
    <div className="page container mx-auto px-4 py-8 cq">
      {/* Header */}
      <div className="mb-8 cq">
        <h1 className="text-3xl font-bold title">QR Scanner</h1>
        <p className="text-muted-foreground secondary-text">
          Skann QR-koder for å finne gjenstander og lokasjoner
        </p>
      </div>

      {/* Scanner Section */}
      {!scanResult && (
        <div className="cq-grid items-grid gap-6 mb-8" style={{"--card-min":"320px"} as any}>
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
                   placeholder="F.eks. D-ABCDEFGH"
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
                <div>
                  <Label className="text-xs text-muted-foreground">Etikettmal</Label>
                  <select className="border rounded px-2 py-1 text-sm" value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)}>
                    <option value="">(Standard)</option>
                    {(profiles.data || []).map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                {/* Preview */}
                <div className="hidden md:block border rounded p-2 max-w-sm">
                  <div className="text-xs font-medium mb-1">Forhåndsvisning</div>
                  {(() => {
                    const profile = (profiles.data || []).find((p: any) => p.id === selectedProfileId)
                    const logo = profile?.logoUrl || userProfile.data?.logoUrl || ''
                    const extra1 = profile?.extraLine1 || ''
                    const extra2 = profile?.extraLine2 || ''
                    const showUrl = profile?.showUrl ?? true
                    const url = typeof window !== 'undefined' ? `${window.location.origin}/scan?d=${scanResult.data.qrCode}` : ''
                    return (
                      <div className="flex items-start gap-3">
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
                        ) : null}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{scanResult.data.item.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{scanResult.data.location.name}</div>
                          {extra1 ? <div className="text-xs text-muted-foreground truncate">{extra1}</div> : null}
                          {extra2 ? <div className="text-xs text-muted-foreground truncate">{extra2}</div> : null}
                          <div className="mt-2 flex items-center gap-3">
                            <div className="text-[11px]">
                              <div className="font-mono">{scanResult.data.qrCode}</div>
                              {showUrl ? <div className="text-muted-foreground break-all">{url}</div> : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
                <Button variant="outline" onClick={async () => {
                try {
                    const profile = (profiles.data || []).find((p: any) => p.id === selectedProfileId)
                    await dymoService.printQRLabel({
                    itemName: scanResult.data.item.name,
                    locationName: scanResult.data.location.name,
                    qrCode: scanResult.data.qrCode,
                      dateAdded: new Date().toLocaleDateString('nb-NO'),
                      extraLine1: profile?.extraLine1,
                      extraLine2: profile?.extraLine2
                    }, { copies: 1 })
                } catch (e) {
                  console.error(e)
                }
              }}>Skriv ut på DYMO</Button>
                <Button variant="outline" onClick={() => {
                  const printWindow = window.open('', '_blank')
                  if (printWindow) {
                    const url = `${window.location.origin}/scan?d=${scanResult.data.qrCode}`
                    const profile = (profiles.data || []).find((p: any) => p.id === selectedProfileId)
                    const extra1 = profile?.extraLine1 || ''
                    const extra2 = profile?.extraLine2 || ''
                    const showUrl = profile?.showUrl ?? true
                    const logo = profile?.logoUrl || userProfile.data?.logoUrl || ''
                    printWindow.document.write(`<!DOCTYPE html><html><head><title>Etikett</title><style>body{margin:0;padding:12px;font-family:Arial} .box{border:1px solid #000; padding:8px; width:280px} .title{font-weight:bold; font-size:14px; margin:6px 0} .small{font-size:12px; color:#444} .code{font-family:monospace; font-size:12px}</style></head><body><div class='box'>${logo ? `<img src='${logo}' style='max-width:260px;max-height:40px'/>` : ''}<div class='title'>${scanResult.data.item.name}</div><div class='small'>${scanResult.data.location.name}</div>${extra1 ? `<div class='small'>${extra1}</div>` : ''}${extra2 ? `<div class='small'>${extra2}</div>` : ''}<img id='qr' style='width:160px;height:160px'/><div class='code'>${scanResult.data.qrCode}</div>${showUrl ? `<div class='small'>${url}</div>` : ''}<script src='https://unpkg.com/qrcode/build/qrcode.min.js'></script><script>window.addEventListener('load',()=>{window.QRCode.toDataURL(${JSON.stringify(url)}, { width: 160, margin: 1 }, function (err, data){ if(!err){ document.getElementById('qr').src = data; } });});</script></div></body></html>`)
                    printWindow.document.close()
                    setTimeout(() => { printWindow.print(); printWindow.close() }, 250)
                  }
                }}>Skriv ut i nettleser</Button>
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
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    Gjenstand/Lokasjon
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
            ) : null}
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

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="page container mx-auto px-4 py-8"><h1 className="text-2xl font-semibold">Laster QR-skanner...</h1></div>}>
      <ScanPageContent />
    </Suspense>
  )
}
