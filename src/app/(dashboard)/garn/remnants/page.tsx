'use client'

import { useState } from 'react'
import { RemnantGrid } from '@/components/yarn/remnants/RemnantGrid'
import { RemnantCreator } from '@/components/yarn/remnants/RemnantCreator'
import { RemnantUsageDialog } from '@/components/yarn/remnants/RemnantUsageDialog'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RemnantsPage() {
  const [showRemnantCreator, setShowRemnantCreator] = useState(false)
  const [showRemnantUsage, setShowRemnantUsage] = useState(false)
  const [selectedRemnant, setSelectedRemnant] = useState<any>(null)

  // Fetch remnants
  const { data: remnantsData, isLoading, refetch } = trpc.yarn.getRemnants.useQuery({
    limit: 100,
    offset: 0
  })

  // Delete remnant mutation
  const deleteRemnantMutation = trpc.yarn.deleteRemnant.useMutation({
    onSuccess: () => {
      toast.success('Garnrest slettet!')
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil ved sletting: ${error.message}`)
    }
  })

  const handleCreateNew = () => {
    setShowRemnantCreator(true)
  }

  const handleEdit = (id: string) => {
    // TODO: Implement edit functionality
    toast.info('Redigering kommer snart!')
  }

  const handleDelete = async (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne garnresten?')) {
      await deleteRemnantMutation.mutateAsync(id)
    }
  }

  const handleUseInProject = (id: string) => {
    const remnant = remnantsData?.remnants.find(r => r.id === id)
    if (remnant) {
      setSelectedRemnant(remnant)
      setShowRemnantUsage(true)
    }
  }

  const handleViewOriginal = (id: string) => {
    // TODO: Navigate to original batch
    toast.info('Navigering til original batch kommer snart!')
  }

  const handleSuccess = () => {
    refetch()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/garn">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake til garn
            </Button>
          </Link>
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Garnrester</h1>
          <p className="text-muted-foreground">
            Administrer og bruk garnrester effektivt for å redusere avfall.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <RemnantGrid
        remnants={remnantsData?.remnants || []}
        loading={isLoading}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUseInProject={handleUseInProject}
        onViewOriginal={handleViewOriginal}
      />

      {/* Dialogs */}
      <RemnantCreator
        open={showRemnantCreator}
        onOpenChange={setShowRemnantCreator}
        onSuccess={handleSuccess}
      />

      <RemnantUsageDialog
        open={showRemnantUsage}
        onOpenChange={setShowRemnantUsage}
        remnant={selectedRemnant}
        onSuccess={handleSuccess}
      />
    </div>
  )
}