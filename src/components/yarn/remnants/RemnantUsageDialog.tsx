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
import { Package, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

const usageFormSchema = z.object({
  projectId: z.string().min(1, 'Du må velge et prosjekt'),
  amountUsed: z.number().positive('Mengde må være større enn 0'),
  notes: z.string().optional(),
})

type UsageFormData = z.infer<typeof usageFormSchema>

interface RemnantUsageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  remnant?: {
    id: string
    name: string
    availableQuantity: number
    unit: string
    categoryData?: string | null
  } | null
  onSuccess?: () => void
}

export function RemnantUsageDialog({
  open,
  onOpenChange,
  remnant,
  onSuccess
}: RemnantUsageDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UsageFormData>({
    resolver: zodResolver(usageFormSchema),
    defaultValues: {
      projectId: '',
      amountUsed: 0,
      notes: ''
    }
  })

  // Get projects for selection
  const { data: projectsData } = trpc.yarn.getProjects.useQuery({
    limit: 50,
    status: 'IN_PROGRESS' // Only show active projects
  })

  const useRemnantMutation = trpc.yarn.useRemnant.useMutation({
    onSuccess: () => {
      toast.success('Garnrest brukt i prosjekt!')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(`Feil ved bruk: ${error.message}`)
    }
  })

  const onSubmit = async (data: UsageFormData) => {
    if (!remnant) return
    
    setIsSubmitting(true)
    try {
      await useRemnantMutation.mutateAsync({
        remnantId: remnant.id,
        ...data
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const amountUsed = form.watch('amountUsed')
  const remainingAfterUse = remnant ? remnant.availableQuantity - amountUsed : 0
  const willExceedAvailable = amountUsed > (remnant?.availableQuantity || 0)

  const remnantData = remnant?.categoryData ? (remnant.categoryData as any) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <DialogTitle>Bruk garnrest i prosjekt</DialogTitle>
          </div>
          <DialogDescription>
            Registrer bruk av garnrest i et prosjekt og oppdater tilgjengelig mengde.
          </DialogDescription>
        </DialogHeader>

        {remnant && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="font-medium mb-2">{remnant.name}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Tilgjengelig:</span>{' '}
                <span className="font-medium">
                  {remnant.availableQuantity}{remnant.unit}
                </span>
              </div>
              {remnantData?.originalColor && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Farge:</span>
                  {remnantData.originalColorCode && (
                    <div 
                      className="w-3 h-3 rounded border" 
                      style={{ backgroundColor: remnantData.originalColorCode }}
                    />
                  )}
                  <span className="font-medium">{remnantData.originalColor}</span>
                </div>
              )}
              {remnantData?.condition && (
                <div>
                  <span className="text-muted-foreground">Tilstand:</span>{' '}
                  <Badge variant="outline" className="text-xs">
                    {remnantData.condition}
                  </Badge>
                </div>
              )}
              {remnantData?.originalProducer && (
                <div>
                  <span className="text-muted-foreground">Produsent:</span>{' '}
                  <span className="font-medium">{remnantData.originalProducer}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Selection */}
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prosjekt</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg prosjekt" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectsData?.projects.map((project: any) => (
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
                    Prosjektet du vil bruke garnresten i
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount Used */}
            <FormField
              control={form.control}
              name="amountUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mengde brukt ({remnant?.unit})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max={remnant?.availableQuantity}
                      placeholder="10"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Hvor mye av garnresten du vil bruke
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount calculation display */}
            {amountUsed > 0 && remnant && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bruker:</span>
                    <span className="font-medium">{amountUsed}{remnant.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gjenstår:</span>
                    <span className={`font-medium ${remainingAfterUse < 0 ? 'text-red-600' : ''}`}>
                      {remainingAfterUse}{remnant.unit}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Warning for exceeding available amount */}
            {willExceedAvailable && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Du kan ikke bruke mer enn tilgjengelig mengde ({remnant?.availableQuantity}{remnant?.unit}).
                </AlertDescription>
              </Alert>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notater (valgfritt)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="F.eks. 'Brukt til kanter' eller 'Til prøvelapp'"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Beskrivelse av hvordan garnresten ble brukt
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
              <Button 
                type="submit" 
                disabled={isSubmitting || willExceedAvailable || !remnant}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Bruk garnrest
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}