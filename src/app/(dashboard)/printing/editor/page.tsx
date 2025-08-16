import { LabelTemplateEditorWireframe } from '@/components/printing/LabelTemplateEditor'

export default function LabelEditorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Etikettmal-editor</h1>
      <LabelTemplateEditorWireframe />
    </div>
  )
}