'use client'

import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { LabelTemplateEditor } from '@/components/printing/LabelTemplateEditor'

const DynamicLabelTemplateEditor = dynamic(() => import('@/components/printing/LabelTemplateEditor').then(mod => ({ default: mod.LabelTemplateEditor })), {
  loading: () => <div className="flex items-center justify-center p-8 text-muted-foreground">Laster etikett editor...</div>
})

export default function LabelEditorPage() {
  const searchParams = useSearchParams()
  
  // Extract parameters from URL
  const name = searchParams.get('name') || 'Ny etikettmal'
  const type = searchParams.get('type') || 'CUSTOM'
  const size = searchParams.get('size') || ''
  const mode = searchParams.get('mode') || 'new'
  const template = searchParams.get('template') || ''
  
  return (
    <DynamicLabelTemplateEditor 
      initialName={name}
      initialType={type as 'QR' | 'BARCODE' | 'CUSTOM'}
      initialSize={size}
      mode={mode as 'new' | 'edit' | 'quick'}
      quickTemplate={template}
    />
  )
}