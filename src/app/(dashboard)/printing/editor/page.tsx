import dynamic from 'next/dynamic'

const LabelTemplateEditorWireframe = dynamic(() => import('@/components/printing/LabelTemplateEditor').then(mod => ({ default: mod.LabelTemplateEditorWireframe })), {
  loading: () => <div className="flex items-center justify-center p-8 text-muted-foreground">Laster etikett editor...</div>
})

export default function LabelEditorPage() {
  return (
    <LabelTemplateEditorWireframe />
  )
}