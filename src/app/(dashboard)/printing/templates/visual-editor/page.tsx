'use client'

import { VisualTemplateEditor } from '@/components/printing/VisualTemplateEditor'
import { useRouter } from 'next/navigation'

export default function VisualEditorPage() {
  const router = useRouter()

  const handleSave = (elements: any[], xml: string) => {
    console.log('Lagrer template:', { elements, xml })
    // Her ville vi kalle tRPC mutation for å lagre
    router.push('/printing/templates')
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <VisualTemplateEditor 
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}
