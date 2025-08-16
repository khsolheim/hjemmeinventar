import { PrintWizardWireframe } from '@/components/printing/PrintWizard'

export default function PrintWizardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Utskriftsveiviser</h1>
      <PrintWizardWireframe />
    </div>
  )
}