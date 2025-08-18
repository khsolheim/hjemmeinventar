import dynamic from 'next/dynamic'

const PrintWizardWireframe = dynamic(() => import('@/components/printing/PrintWizard').then(mod => ({ default: mod.PrintWizardWireframe })), {
  loading: () => <div className="flex items-center justify-center p-8 text-muted-foreground">Laster utskrifts veiviser...</div>
})

export default function PrintWizardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Utskriftsveiviser</h1>
      <PrintWizardWireframe />
    </div>
  )
}