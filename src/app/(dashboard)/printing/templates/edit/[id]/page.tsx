'use client'

import { useParams } from 'next/navigation'
import { LabelTemplateEditor } from '@/components/printing/LabelTemplateEditor'
import { trpc } from '@/lib/trpc/client'
import { Loader2 } from 'lucide-react'

export default function EditTemplatePage() {
  const params = useParams()
  const templateId = params.id as string
  
  const { data: template, isLoading, error } = trpc.labelTemplates.getById.useQuery({
    id: templateId
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Rediger etikettmal</h1>
          <p className="text-muted-foreground">
            Laster mal...
          </p>
        </div>
        
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Feil</h1>
          <p className="text-muted-foreground">
            {error?.message || 'Mal ikke funnet'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rediger etikettmal</h1>
        <p className="text-muted-foreground">
          Rediger "{template.name}"
        </p>
      </div>
      
      <LabelTemplateEditor 
        mode="edit" 
        templateId={templateId}
        initialData={template}
      />
    </div>
  )
}
