'use client'

import { LabelTemplateEditor } from '@/components/printing/LabelTemplateEditor'

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ny etikettmal</h1>
        <p className="text-muted-foreground">
          Opprett en ny mal for etikettutskrift
        </p>
      </div>
      
      <LabelTemplateEditor mode="create" />
    </div>
  )
}