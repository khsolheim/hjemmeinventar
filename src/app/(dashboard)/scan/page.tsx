'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
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
  Calendar,
  Check
} from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useSession } from 'next-auth/react'
import { QRScanner } from '@/components/ui/qr-scanner'
import { dymoService } from '@/lib/printing/dymo-service'
import { printQueue } from '@/lib/printing/print-queue'

function ScanPageContent() {
  const [scanResult, setScanResult] = useState<any>(null)
  const [isMobileScanning, setIsMobileScanning] = useState(false)
  const params = useSearchParams()
  const router = useRouter()
  const distributionCode = params?.get('d') || ''
  const { data: session, status } = useSession()
  const commonOpts = { retry: 0, refetchOnWindowFocus: false, refetchOnMount: false, staleTime: 5 * 60 * 1000 } as const

  // Check if opened from PWA shortcut for mobile scanning
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isMobile = window.innerWidth < 768

    if (isStandalone && isMobile) {
      setIsMobileScanning(true)
    }
  }, [])
    // const profiles = trpc.users.getLabelProfiles.useQuery(undefined, { // Temporarily disabled
  //   ...commonOpts, 
  //   enabled: status === 'authenticated' && !!scanResult && scanResult.type === 'distribution'
  // })
  const profiles = { data: [] } // Placeholder since getLabelProfiles not available
  const userProfile = trpc.users.getProfile.useQuery(undefined, { 
    ...commonOpts, 
    enabled: status === 'authenticated' && !!scanResult && scanResult.type === 'distribution' 
  })
  const [selectedProfileId, setSelectedProfileId] = useState('')

  useEffect(() => {
    // TODO: Implement default label profile selection
    // if (!selectedProfileId && userProfile.data?.defaultLabelProfileId) {
    //   setSelectedProfileId(userProfile.data.defaultLabelProfileId)
    // }
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

  // Manual scanning is now handled by QRScanner component

  const handleQRScan = async (result: string) => {
    // Handle QR code scan result
    if (result.startsWith('D-')) {
      try {
        // TODO: Implement proper QR code lookup
        setScanResult({ error: 'QR-kode lookup ikke implementert ennå' })

        // If mobile scanning, navigate back after scan
        if (isMobileScanning) {
          setTimeout(() => {
            router.back()
          }, 2000)
        }
        return
      } catch (e) {
        setScanResult({ error: 'QR-kode ikke funnet i systemet' })
        return
      }
    }

    // Handle location/item codes
    if (result.startsWith('L-') || result.startsWith('I-')) {
      setScanResult({ type: 'item_or_location', code: result, message: 'Gjenstand/lokasjon funnet' })

      // If mobile scanning, navigate to the item/location
      if (isMobileScanning) {
        const [type, id] = result.split('-')
        if (type === 'I') {
          router.push(`/items?highlight=${id}`)
        } else if (type === 'L') {
          router.push(`/locations?highlight=${id}`)
        }
      }
      return
    }

    // For andre koder viser vi not found
    setScanResult({ error: 'QR-kode ikke funnet i systemet' })
  }

  const clearResult = () => {
    setScanResult(null)
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
        <div className="mb-8">
          <QRScanner
            onScan={handleQRScan}
            onError={(error) => {
              console.error('QR Scanner error:', error)
              setScanResult({ error })
            }}
          />
        </div>
      )}

      {/* Scan Result */}
      {scanResult && (scanResult.type === 'distribution' || scanResult.type === 'item_or_location') && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {scanResult.type === 'distribution' ? (
                  <>
                    <Package className="w-5 h-5" />
                    Fordeling funnet
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    Kode skannet
                  </>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={clearResult}>Skann ny kode</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {scanResult.type === 'distribution' ? (
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
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">{scanResult.message}</h3>
                <p className="text-sm text-muted-foreground font-mono">{scanResult.code}</p>
                {isMobileScanning && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Du sendes videre...
                  </p>
                )}
              </div>
            )}
                        {scanResult.type === 'distribution' && (
              <>
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
                      const profile = (profiles.data || []).find((p: any) => p.id === selectedProfileId)
                      await dymoService.printQRLabel({
                        itemName: scanResult.data.item.name,
                        locationName: scanResult.data.location.name,
                        qrCode: scanResult.data.qrCode,
                        // dateAdded: new Date().toLocaleDateString('nb-NO'), // TODO: Add dateAdded to type
                        // extraLine1: profile?.extraLine1, // TODO: Add extraLine1 to type
                        // extraLine2: profile?.extraLine2 // TODO: Add extraLine2 to type
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
                      const extra1 = '' // Temporarily disabled
                      const extra2 = '' // Temporarily disabled
                      const showUrl = true // Temporarily disabled
                      const logo = '' // Temporarily disabled
                      printWindow.document.write(`<!DOCTYPE html><html><head><title>Etikett</title><style>body{margin:0;padding:12px;font-family:Arial} .box{border:1px solid #000; padding:8px; width:280px} .title{font-weight:bold; font-size:14px; margin:6px 0} .small{font-size:12px; color:#444} .code{font-family:monospace; font-size:12px}</style></head><body><div class='box'>${logo ? `<img src='${logo}' style='max-width:260px;max-height:40px'/>` : ''}<div class='title'>${scanResult.data.item.name}</div><div class='small'>${scanResult.data.location.name}</div>${extra1 ? `<div class='small'>${extra1}</div>` : ''}${extra2 ? `<div class='small'>${extra2}</div>` : ''}<img id='qr' style='width:160px;height:160px'/><div class='code'>${scanResult.data.qrCode}</div>${showUrl ? `<div class='small'>${url}</div>` : ''}<script src='https://unpkg.com/qrcode/build/qrcode.min.js'></script><script>window.addEventListener('load',()=>{window.QRCode.toDataURL(${JSON.stringify(url)}, { width: 160, margin: 1 }, function (err, data){ if(!err){ document.getElementById('qr').src = data; } });});</script></div></body></html>`)
                      printWindow.document.close()
                      setTimeout(() => { printWindow.print(); printWindow.close() }, 250)
                    }
                  }}>Skriv ut i nettleser</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {scanResult && scanResult.type !== 'distribution' && scanResult.type !== 'item_or_location' && (
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
