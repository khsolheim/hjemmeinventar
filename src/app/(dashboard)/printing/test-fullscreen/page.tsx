'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PrintWizardFullscreen } from '@/components/printing/PrintWizardFullscreen'

export default function TestFullscreenPage() {
  const [showWizard, setShowWizard] = useState(false)

  if (showWizard) {
    return <PrintWizardFullscreen onClose={() => setShowWizard(false)} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Test: Fullskjerm Modal Wizard</h1>
        <p className="text-muted-foreground">
          Dette eksemplet viser en fullskjerm modal tilnærming til printing wizard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fullskjerm Modal Design</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Fordeler:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Mest fokusert opplevelse - ingen distraksjoner</li>
              <li>• Maksimal skjermplassutnyttelse</li>
              <li>• Tydelig progress og navigasjon</li>
              <li>• Fast header og footer for konsistent UX</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Egnet for:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Komplekse arbeidsflyter som krever fokus</li>
              <li>• Når du vil isolere brukeren fra andre elementer</li>
              <li>• Mobile enheter og små skjermer</li>
            </ul>
          </div>

          <Button onClick={() => setShowWizard(true)} className="w-full">
            Test Fullskjerm Modal Wizard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
