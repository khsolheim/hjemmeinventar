'use client'

import { useRouter } from 'next/navigation'
import { PrintWizard } from '@/components/printing/PrintWizard'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function PrintWizardPage() {
  const router = useRouter()

  const handleComplete = (jobId: string) => {
    toast.success('Print job opprettet!', {
      description: `Job-ID: ${jobId}. Utskriften er startet.`,
      action: {
        label: 'Se job',
        onClick: () => router.push(`/printing/jobs/${jobId}`)
      }
    })
    
    // Naviger tilbake til printing dashboard
    setTimeout(() => {
      router.push('/printing')
    }, 2000)
  }

  const handleCancel = () => {
    router.push('/printing')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/printing')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til Printing
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-lg font-semibold">Print Wizard</h1>
        </div>
      </div>

      <PrintWizard 
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  )
}