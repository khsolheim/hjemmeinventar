'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const OnboardingWizard = dynamic(() => import('@/components/onboarding/OnboardingWizard').then(mod => ({ default: mod.OnboardingWizard })), {
  loading: () => <div className="flex items-center justify-center p-8 text-muted-foreground">Laster onboarding veiviser...</div>
})

const QuickStartWizard = dynamic(() => import('@/components/onboarding/QuickStartWizard').then(mod => ({ default: mod.QuickStartWizard })), {
  loading: () => <div className="flex items-center justify-center p-8 text-muted-foreground">Laster rask oppstart...</div>
})
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, ArrowRight, Home, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OnboardingPage() {
  const [showWizard, setShowWizard] = useState(false)
  const [wizardMode, setWizardMode] = useState<'quick' | 'full' | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()

  const handleComplete = () => {
    setIsCompleted(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  if (isCompleted) {
    return (
      <div className="page cq min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle>Takk for at du fullførte onboardingen!</CardTitle>
            <CardDescription>
              Du blir sendt til dashboard om et øyeblikk...
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-24" />
        </Card>
      </div>
    )
  }

  if (!showWizard) {
    return (
      <div className="page cq min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Velkommen til HMS! 🏠
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              La oss hjelpe deg å komme i gang med ditt personlige inventarsystem. 
              Det tar bare noen få minutter!
            </p>
          </div>

          <div className="cq-grid items-grid gap-6 mb-8" style={{"--card-min":"280px"} as any}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  5-minutters oppsett
                </CardTitle>
                <CardDescription>
                  Rask oppstart med smarte standarder
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-40">
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>• Auto-generer vanlige lokasjoner</li>
                  <li>• Smart kategorisering</li>
                  <li>• Legg til din første gjenstand</li>
                  <li>• Kom i gang på 5 minutter</li>
                </ul>
                <Button 
                  onClick={() => {
                    setWizardMode('quick')
                    setShowWizard(true)
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Start raskt (5 min)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Full oppsett
                </CardTitle>
                <CardDescription>
                  Tilpass systemet til dine behov
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-40">
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>• Tilpass systemet til dine behov</li>
                  <li>• Opprett din første lokasjon</li>
                  <li>• Registrer en prøve-gjenstand</li>
                  <li>• Sett opp dine preferanser</li>
                </ul>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setWizardMode('full')
                    setShowWizard(true)
                  }}
                  className="w-full"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Start full oppsett
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Hopp direkte til dashboard
                </CardTitle>
                <CardDescription>
                  Utforsk på egen hånd og sett opp senere
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-40">
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>• Kom i gang med en gang</li>
                  <li>• Utforsk alle funksjoner</li>
                  <li>• Sett opp når du vil</li>
                  <li>• Kan kjøre oppsettet senere</li>
                </ul>
                <Button 
                  variant="outline" 
                  onClick={handleSkip}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Gå til dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Du kan alltid komme tilbake til dette oppsettet senere fra innstillingene
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page cq min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      {wizardMode === 'quick' ? (
        <QuickStartWizard 
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      ) : (
        <OnboardingWizard 
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      )}
    </div>
  )
}
