'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PrintWizardSidebar } from '@/components/printing/PrintWizardSidebar'

export default function TestSidebarPage() {
  return (
    <div className="h-screen -m-4 md:-m-6">
      <PrintWizardSidebar />
    </div>
  )
}
