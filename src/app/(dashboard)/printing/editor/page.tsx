'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { LabelTemplateEditor } from '@/components/printing/LabelTemplateEditor'
import { toast } from 'sonner'
import type { LabelTemplate } from '@prisma/client'

export default function TemplateEditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')

  const handleSave = (template: LabelTemplate) => {
    toast.success('Mal lagret!', {
      description: `Malen "${template.name}" ble lagret.`,
      action: {
        label: 'Se mal',
        onClick: () => router.push(`/printing/templates`)
      }
    })
  }

  const handleCancel = () => {
    router.push('/printing/templates')
  }

  return (
    <LabelTemplateEditor
      templateId={templateId || undefined}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}