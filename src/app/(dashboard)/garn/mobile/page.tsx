'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Search, BarChart3, Camera, Menu, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { trpc } from '@/lib/trpc/client'
import { MobileYarnCard } from '@/components/yarn/mobile/MobileYarnCard'
import { MobileYarnWizard } from '@/components/yarn/mobile/MobileYarnWizard'
import { MobileBatchView } from '@/components/yarn/mobile/MobileBatchView'
import { MobileYarnStats } from '@/components/yarn/mobile/MobileYarnStats'
import Link from 'next/link'

export default function MobileYarnPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMaster, setSelectedMaster] = useState<any>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [view, setView] = useState<'grid' | 'batches'>('grid')

  // Fetch yarn masters
  const { data: mastersData, isLoading, refetch } = trpc.yarn.getAllMasters.useQuery({
    limit: 50,
    offset: 0,
    search: searchQuery || undefined
  })

  const masters = mastersData?.masters || []

  // Quick stats
  const totalMasters = masters.length
  const totalValue = masters.reduce((sum, master) => sum + (master.totals?.totalValue || 0), 0)
  const lowStockCount = masters.filter(master => 
    master.totals?.totalAvailableQuantity && master.totals.totalAvailableQuantity <= 2
  ).length

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link href="/garn">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Garn Mobile</h1>
              <p className="text-xs text-muted-foreground">
                {totalMasters} garntyper
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowStats(true)}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex gap-4 text-xs">
            <div className="text-center">
              <div className="font-semibold text-green-600">{totalValue.toFixed(0)} kr</div>
              <div className="text-muted-foreground">Verdi</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{totalMasters}</div>
              <div className="text-muted-foreground">Typer</div>
            </div>
            {lowStockCount > 0 && (
              <div className="text-center">
                <div className="font-semibold text-amber-600">{lowStockCount}</div>
                <div className="text-muted-foreground">Lav</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Søk garn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : masters.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-4">🧶</div>
              <h3 className="text-lg font-semibold mb-2">Ingen garn ennå</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Start med å registrere ditt første garn
              </p>
              <Button onClick={() => setShowWizard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrer Garn
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(masters || []).map((master) => (
              <MobileYarnCard
                key={master.id}
                master={master}
                onClick={() => setSelectedMaster(master)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-4 flex flex-col gap-3">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setShowWizard(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
        
        <Button
          variant="secondary"
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <Camera className="h-6 w-6" />
        </Button>
      </div>

      {/* Master Detail Sheet */}
      {selectedMaster && (
        <Dialog open={!!selectedMaster} onOpenChange={() => setSelectedMaster(null)}>
          <DialogContent className="h-[90vh] max-w-full m-0 rounded-t-lg rounded-b-none">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-left">{selectedMaster.name}</DialogTitle>
              <DialogDescription className="text-left">
                {selectedMaster.totals?.numberOfBatches || 0} batches • 
                {selectedMaster.totals?.totalQuantity || 0} nøster totalt
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto">
              <MobileBatchView masterId={selectedMaster.id} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Wizard Dialog */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="h-[90vh] max-w-full m-0 rounded-t-lg rounded-b-none">
          <DialogHeader>
            <DialogTitle>Registrer Nytt Garn</DialogTitle>
            <DialogDescription>
              Legg til ny garntype eller batch
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <MobileYarnWizard 
              onComplete={() => {
                setShowWizard(false)
                refetch()
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="h-[90vh] max-w-full m-0 rounded-t-lg rounded-b-none">
          <DialogHeader>
            <DialogTitle>Garn Statistikk</DialogTitle>
            <DialogDescription>
              Oversikt over beholdning og bruk
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <MobileYarnStats />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
