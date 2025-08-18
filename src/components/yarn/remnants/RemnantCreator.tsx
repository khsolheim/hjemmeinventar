'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Scissors, Loader2 } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

const remnantFormSchema = z.object({
  originalBatchId: z.string().min(1, 'Du må velge en original batch'),
  remainingAmount: z.number().positive('Mengde må være større enn 0'),
  unit: z.enum(['g', 'm', 'nøste', 'gram', 'meter']),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Tangled', 'Needs sorting']),
  sourceProjectId: z.string().optional(),
  notes: z.string().optional(),
})

type RemnantFormData = z.infer<typeof remnantFormSchema>

interface RemnantCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  preSelectedBatchId?: string
  preSelectedProjectId?: string
}

const conditionLabels = {
  'Excellent': 'Utmerket',
  'Good': 'God',
  'Fair': 'OK',
  'Tangled': 'Floket',
  'Needs sorting': 'Trenger sortering'
}

const conditionDescriptions = {
  'Excellent': 'Som nytt, klar til bruk',
  'Good': 'God kvalitet, lett å bruke',
  'Fair': 'Brukbar, men kan ha mindre feil',
  'Tangled': 'Floket, trenger utredning',
  'Needs sorting': 'Trenger sortering og organisering'
}

export function RemnantCreator({
  open,
  onOpenChange,
  onSuccess,
  preSelectedBatchId,
  preSelectedProjectId
}: RemnantCreatorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RemnantFormData>({
    resolver: zodResolver(remnantFormSchema),
    defaultValues: {
      originalBatchId: preSelectedBatchId || '',
      remainingAmount: 0,
      unit: 'g',
      condition: 'Good',
      sourceProjectId: preSelectedProjectId || '',
      notes: ''
    }
  })

  // Get yarn batches for selection
  const { data: yarnData } = trpc.yarn.getYarns.useQuery({
    limit: 100,
    includeEmptyBatches: true
  })

  // Get projects for selection
  const { data: projectsData } = trpc.yarn.getProjects.useQuery({
    limit: 50
  })

  const createRemnantMutation = trpc.yarn.createRemnant.useMutation({
    onSuccess: () => {
      toast.success('Garnrest opprettet!')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(`Feil ved opprettelse: ${error.message}`)
    }
  })

  const onSubmit = async (data: RemnantFormData) => {
    setIsSubmitting(true)
    try {
      await createRemnantMutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get selected batch info
  const selectedBatchId = form.watch('originalBatchId')
  const selectedBatch = yarnData?.items.find(item => item.id === selectedBatchId)
  const selectedBatchData = selectedBatch?.categoryData 
    ? JSON.parse(selectedBatch.categoryData) 
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            <DialogTitle>Opprett garnrest</DialogTitle>
          </div>
          <DialogDescription>
            Registrer en rest av garn som kan brukes i fremtidige prosjekter.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Original Batch Selection */}
            <FormField
              control={form.control}
              name="originalBatchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original garnbatch</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg original batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {yarnData?.items.map((item) => {
                        const data = item.categoryData ? JSON.parse(item.categoryData) : null
                        return (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex items-center gap-2">
                              {data?.colorCode && (
                                <div 
                                  className="w-3 h-3 rounded border" 
                                  style={{ backgroundColor: data.colorCode }}
                                />
                              )}
                              <span>{item.name}</span>
                              {data?.color && <Badge variant="outline">{data.color}</Badge>}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Batch Info */}
            {selectedBatch && selectedBatchData && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Valgt batch:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedBatchData.producer && (
                    <div>
                      <span className="text-muted-foreground">Produsent:</span>{' '}
                      {selectedBatchData.producer}
                    </div>
                  )}
                  {selectedBatchData.composition && (
                    <div>
                      <span className="text-muted-foreground">Sammensetning:</span>{' '}
                      {selectedBatchData.composition}
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Tilgjengelig:</span>{' '}
                    {selectedBatch.availableQuantity}{selectedBatch.unit}
                  </div>
                </div>
              </div>
            )}

            {/* Amount and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="remainingAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restmengde</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enhet</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="g">gram (g)</SelectItem>
                        <SelectItem value="m">meter (m)</SelectItem>
                        <SelectItem value="nøste">nøster</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Condition */}
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tilstand</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(conditionLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex flex-col">
                            <span>{label}</span>
                            <span className="text-xs text-muted-foreground">
                              {conditionDescriptions[value as keyof typeof conditionDescriptions]}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Source Project */}
            <FormField
              control={form.control}
              name="sourceProjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kilde prosjekt (valgfritt)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg prosjekt hvis relevant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Ingen prosjekt</SelectItem>
                      {projectsData?.projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <span>{project.name}</span>
                            <Badge variant="outline">{project.status}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Prosjektet resten kommer fra, hvis relevant
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notater (valgfritt)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="F.eks. 'Rest fra ermer' eller 'Trenger utredning'"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ekstra informasjon om resten
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Opprett garnrest
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}