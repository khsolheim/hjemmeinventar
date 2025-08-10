'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Home, 
  Plus, 
  Users, 
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { HouseholdCard } from '@/components/households/HouseholdCard'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface CreateHouseholdForm {
  name: string
  description: string
}

export default function HouseholdsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [createForm, setCreateForm] = useState<CreateHouseholdForm>({
    name: '',
    description: ''
  })

  const { 
    data: households = [], 
    isLoading, 
    error, 
    refetch 
  } = trpc.households.getMyHouseholds.useQuery()

  const createMutation = trpc.households.create.useMutation({
    onSuccess: () => {
      toast.success('Husholdning opprettet!')
      setIsCreateDialogOpen(false)
      setCreateForm({ name: '', description: '' })
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil ved opprettelse: ${error.message}`)
    }
  })

  const leaveMutation = trpc.households.leave.useMutation({
    onSuccess: () => {
      toast.success('Du har forlatt husholdningen')
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil ved å forlate husholdningen: ${error.message}`)
    }
  })

  const deleteMutation = trpc.households.delete.useMutation({
    onSuccess: () => {
      toast.success('Husholdning slettet permanent')
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil ved sletting: ${error.message}`)
    }
  })

  const handleCreateHousehold = async () => {
    if (!createForm.name.trim()) {
      toast.error('Navn er påkrevd')
      return
    }

    createMutation.mutate({
      name: createForm.name.trim(),
      description: createForm.description.trim() || undefined
    })
  }

  const handleLeaveHousehold = async (householdId: string) => {
    const household = households.find(h => h.id === householdId)
    if (!household) return

    if (window.confirm(`Er du sikker på at du vil forlate "${household.name}"?`)) {
      leaveMutation.mutate(householdId)
    }
  }

  const handleDeleteHousehold = async (householdId: string) => {
    const household = households.find(h => h.id === householdId)
    if (!household) return

    if (window.confirm(
      `Er du sikker på at du vil slette "${household.name}" permanent? Denne handlingen kan ikke angres.`
    )) {
      deleteMutation.mutate(householdId)
    }
  }

  const filteredHouseholds = households.filter(household =>
    household.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    household.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600">Kunne ikke laste husholdninger</h2>
              <p className="text-gray-500 mb-4">{error.message}</p>
              <Button onClick={() => refetch()}>Prøv igjen</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Mine Husholdninger</h1>
            <p className="text-muted-foreground">
              Administrer familiemedlemmer og del inventaret ditt
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Opprett husholdning
          </Button>
        </div>
      </div>

      {/* Search */}
      {households.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Søk i husholdninger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {households.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Home className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ingen husholdninger ennå</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Opprett din første husholdning for å dele inventaret med familie eller mitbeboere
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Opprett din første husholdning
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Households Grid */}
      {filteredHouseholds.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHouseholds.map((household) => (
            <HouseholdCard
              key={household.id}
              household={household}
              onLeave={handleLeaveHousehold}
              onDelete={handleDeleteHousehold}
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {households.length > 0 && filteredHouseholds.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Search className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ingen resultater</h2>
            <p className="text-muted-foreground mb-6">
              Ingen husholdninger matcher søket "{searchQuery}"
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Tøm søk
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Household Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Opprett ny husholdning</DialogTitle>
            <DialogDescription>
              Lag en husholdning for å dele inventaret med familie eller mitbeboere.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Navn</Label>
              <Input
                id="name"
                placeholder="Familiens husholdning"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                maxLength={50}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Beskrivelse (valgfritt)</Label>
              <Textarea
                id="description"
                placeholder="Beskrivelse av husholdningen..."
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={createMutation.isPending}
            >
              Avbryt
            </Button>
            <Button 
              onClick={handleCreateHousehold}
              disabled={createMutation.isPending || !createForm.name.trim()}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Oppretter...
                </>
              ) : (
                <>
                  <Home className="w-4 h-4 mr-2" />
                  Opprett husholdning
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
