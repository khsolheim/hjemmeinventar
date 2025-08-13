'use client'

import { useState } from 'react'
import { Plus, Eye, Edit, Trash2, CheckCircle, Circle, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface YarnProjectIntegrationProps {
  batchId: string
  batchName: string
  availableQuantity: number
  unit: string
}

export function YarnProjectIntegration({ 
  batchId, 
  batchName, 
  availableQuantity, 
  unit 
}: YarnProjectIntegrationProps) {
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [quantityToUse, setQuantityToUse] = useState(0)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [usageNotes, setUsageNotes] = useState('')

  // New project form state
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectStatus, setNewProjectStatus] = useState<'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'>('PLANNED')

  // Fetch projects that use this yarn
  const { data: yarnUsage, refetch: refetchUsage } = trpc.yarn.getYarnUsageForItem.useQuery({ itemId: batchId })
  
  // Fetch all projects for dropdown
  const { data: allProjects } = trpc.yarn.getProjects.useQuery({ limit: 100, offset: 0 })
  const utils = trpc.useUtils()
  
  // Mutations
  const addYarnToProjectMutation = trpc.yarn.addYarnToProject.useMutation({
    onSuccess: () => {
      refetchUsage()
      setIsAddToProjectOpen(false)
      setQuantityToUse(0)
      setSelectedProjectId('')
      setUsageNotes('')
      toast.success('Garn lagt til prosjekt!')
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const removeYarnFromProjectMutation = trpc.yarn.removeYarnFromProject.useMutation({
    onSuccess: () => {
      refetchUsage()
      toast.success('Garn fjernet fra prosjekt')
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const createProjectMutation = trpc.yarn.createProject.useMutation({
    onSuccess: async (project) => {
      toast.success('Prosjekt opprettet')
      setIsCreateProjectOpen(false)
      setSelectedProjectId(project.id)
      setNewProjectName('')
      setNewProjectDescription('')
      setNewProjectStatus('PLANNED')
      await utils.yarn.getProjects.invalidate()
    },
    onError: (error) => {
      toast.error(`Kunne ikke opprette prosjekt: ${error.message}`)
    }
  })

  const handleAddToProject = async () => {
    if (!selectedProjectId || quantityToUse <= 0) {
      toast.error('Velg prosjekt og angi gyldig mengde')
      return
    }

    if (quantityToUse > availableQuantity) {
      toast.error('Ikke nok garn tilgjengelig')
      return
    }

    try {
      await addYarnToProjectMutation.mutateAsync({
        projectId: selectedProjectId,
        itemId: batchId,
        quantityUsed: quantityToUse,
        notes: usageNotes
      })
    } catch (error) {
      // Error handling is done in mutation
    }
  }

  const handleRemoveFromProject = async (projectId: string, itemId: string) => {
    try {
      await removeYarnFromProjectMutation.mutateAsync({
        projectId,
        itemId
      })
    } catch (error) {
      // Error handling is done in mutation
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'PLANNED':
        return <Circle className="h-4 w-4 text-gray-400" />
      case 'ON_HOLD':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'CANCELLED':
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default'
      case 'IN_PROGRESS':
        return 'secondary'
      case 'PLANNED':
        return 'outline'
      case 'ON_HOLD':
        return 'secondary'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Prosjekt-bruk</CardTitle>
            <CardDescription>
              Hvor dette garnet brukes eller kan brukes
            </CardDescription>
          </div>
          <Dialog open={isAddToProjectOpen} onOpenChange={setIsAddToProjectOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Legg til prosjekt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Legg til i prosjekt</DialogTitle>
                <DialogDescription>
                  Legg {batchName} til et eksisterende prosjekt
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project">Velg prosjekt</Label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg et prosjekt" />
                    </SelectTrigger>
                    <SelectContent>
                      {(allProjects?.projects || []).map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(project.status)}
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-2">
                    {!isCreateProjectOpen ? (
                      <Button variant="outline" size="sm" onClick={() => setIsCreateProjectOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Opprett nytt prosjekt
                      </Button>
                    ) : (
                      <div className="mt-2 space-y-3 border rounded-md p-3">
                        <div className="text-sm font-medium">Nytt prosjekt</div>
                        <div>
                          <Label htmlFor="new-name">Navn</Label>
                          <Input id="new-name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Prosjektnavn" />
                        </div>
                        <div>
                          <Label htmlFor="new-desc">Beskrivelse (valgfritt)</Label>
                          <Input id="new-desc" value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} placeholder="Kort beskrivelse" />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Select value={newProjectStatus} onValueChange={(v) => setNewProjectStatus(v as any)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PLANNED">Planlagt</SelectItem>
                              <SelectItem value="IN_PROGRESS">I arbeid</SelectItem>
                              <SelectItem value="COMPLETED">Ferdig</SelectItem>
                              <SelectItem value="ON_HOLD">Pauset</SelectItem>
                              <SelectItem value="CANCELLED">Kansellert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => setIsCreateProjectOpen(false)}>Avbryt</Button>
                          <Button 
                            size="sm"
                            onClick={() => createProjectMutation.mutate({ name: newProjectName.trim(), description: newProjectDescription || undefined, status: newProjectStatus })}
                            disabled={createProjectMutation.isPending || newProjectName.trim().length === 0}
                          >
                            {createProjectMutation.isPending ? 'Oppretter...' : 'Opprett'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="quantity">
                    Mengde å bruke ({availableQuantity} {unit} tilgjengelig)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max={availableQuantity}
                    step="0.1"
                    value={quantityToUse}
                    onChange={(e) => setQuantityToUse(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notater (valgfritt)</Label>
                  <Textarea
                    value={usageNotes}
                    onChange={(e) => setUsageNotes(e.target.value)}
                    placeholder="F.eks. 'Til ermer', 'Hovedfarge', etc."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleAddToProject}
                    disabled={addYarnToProjectMutation.isPending || !selectedProjectId || quantityToUse <= 0}
                    className="flex-1"
                  >
                    {addYarnToProjectMutation.isPending ? 'Legger til...' : 'Legg til'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddToProjectOpen(false)}
                  >
                    Avbryt
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {!yarnUsage || yarnUsage.length === 0 ? (
          <div className="text-center py-8">
            <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Ikke brukt i prosjekter ennå
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Dette garnet er ikke tildelt noen prosjekter ennå.
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsAddToProjectOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Legg til prosjekt
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {(yarnUsage || []).map((usage) => (
              <div 
                key={usage.id} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(usage.project.status)}
                    <h4 className="font-medium">{usage.project.name}</h4>
                    <Badge variant={getStatusBadgeVariant(usage.project.status)}>
                      {usage.project.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Bruker: <span className="font-medium">{usage.quantityUsed} {unit}</span>
                    {usage.notes && (
                      <span className="block mt-1">"{usage.notes}"</span>
                    )}
                  </div>
                  
                  {usage.project.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {usage.project.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Fjern fra prosjekt?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Er du sikker på at du vil fjerne dette garnet fra prosjektet "{usage.project.name}"? 
                          Garnet vil bli tilgjengelig igjen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleRemoveFromProject(usage.project.id, usage.item.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Fjern
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
