'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  StarOff,
  Ruler
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { LabelSizeForm } from './LabelSizeForm'

export function LabelSizeManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingSize, setEditingSize] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data: labelSizes, refetch } = trpc.labelSizes.getAll.useQuery()
  const createMutation = trpc.labelSizes.create.useMutation({
    onSuccess: () => {
      toast.success('Størrelse opprettet!')
      setIsCreateDialogOpen(false)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const updateMutation = trpc.labelSizes.update.useMutation({
    onSuccess: () => {
      toast.success('Størrelse oppdatert!')
      setIsEditDialogOpen(false)
      setEditingSize(null)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const deleteMutation = trpc.labelSizes.delete.useMutation({
    onSuccess: () => {
      toast.success('Størrelse slettet!')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const setDefaultMutation = trpc.labelSizes.setDefault.useMutation({
    onSuccess: () => {
      toast.success('Standard-størrelse oppdatert!')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleCreate = (data: any) => {
    createMutation.mutate(data)
  }

  const handleUpdate = (data: any) => {
    if (editingSize) {
      updateMutation.mutate({
        id: editingSize.id,
        ...data
      })
    }
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id })
  }

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate({ id })
  }

  const handleEdit = (size: any) => {
    setEditingSize(size)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Etikett Størrelser</h1>
          <p className="text-muted-foreground">
            Administrer størrelser for dine etiketter
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Legg til ny størrelse
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ny etikett størrelse</DialogTitle>
              <DialogDescription>
                Opprett en ny størrelse for dine etiketter
              </DialogDescription>
            </DialogHeader>
            <LabelSizeForm 
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Størrelser liste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Tilgjengelige størrelser ({labelSizes?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {labelSizes && labelSizes.length > 0 ? (
            <div className="space-y-4">
              {labelSizes.map((size) => (
                <div 
                  key={size.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {size.isDefault ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{size.name}</span>
                      {size.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Standard
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {size.widthMm} × {size.heightMm} mm
                    </div>
                    {size.description && (
                      <div className="text-sm text-muted-foreground">
                        {size.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!size.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(size.id)}
                        disabled={setDefaultMutation.isPending}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(size)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={size.isDefault}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Dette vil permanent slette størrelsen "{size.name}". 
                            Denne handlingen kan ikke angres.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(size.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Slett
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Ruler className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ingen størrelser funnet</p>
              <p className="text-sm">Legg til din første størrelse for å komme i gang</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rediger størrelse</DialogTitle>
            <DialogDescription>
              Oppdater informasjonen for denne størrelsen
            </DialogDescription>
          </DialogHeader>
          {editingSize && (
            <LabelSizeForm 
              onSubmit={handleUpdate}
              isLoading={updateMutation.isPending}
              initialData={editingSize}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
