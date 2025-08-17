'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Home, 
  Package, 
  Archive, 
  Folder,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

interface WizardWelcomeProps {
  onContinue: () => void
  onSkipTutorial: (skipPermanently: boolean) => void
}

export function WizardWelcome({ onContinue, onSkipTutorial }: WizardWelcomeProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      icon: Home,
      title: "Start med rom",
      description: "Opprett rom som Soverom, Kjøkken, eller Stue",
      color: "text-blue-600"
    },
    {
      icon: Package,
      title: "Legg til møbler",
      description: "Skap, reoler og andre oppbevaringsmøbler",
      color: "text-green-600"
    },
    {
      icon: Archive,
      title: "Organiser med bokser",
      description: "Hyller, skuffer, bokser og poser",
      color: "text-purple-600"
    },
    {
      icon: Sparkles,
      title: "Automatisk navngivning",
      description: "Systemet genererer logiske navn som A1, B2, etc.",
      color: "text-orange-600"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [steps.length])

  const handleContinue = () => {
    if (dontShowAgain) {
      onSkipTutorial(true)
    }
    onContinue()
  }

  const handleSkip = () => {
    onSkipTutorial(dontShowAgain)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Home className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Velkommen til Lokasjonswizard! 🏠
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Her kan du enkelt bygge opp hvordan hjemmet ditt er organisert
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Animated Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all duration-500 ${
                    isActive 
                      ? 'border-blue-300 bg-blue-50 scale-105' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon className={`h-6 w-6 ${isActive ? step.color : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
                        {step.description}
                      </p>
                    </div>
                    {isActive && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600 animate-pulse" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Key Benefits */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Hovedfordeler:</h3>
            <ul className="space-y-1 text-sm text-green-800">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Trykk på + for å legge til nye elementer</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Navngivning skjer automatisk (A1, B2, etc.)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Du kan alltid endre navn senere!</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>QR-koder genereres automatisk for alle lokasjoner</span>
              </li>
            </ul>
          </div>

          {/* Example Hierarchy */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Eksempel hierarki:</h3>
            <div className="space-y-1 text-sm font-mono text-gray-700">
              <div className="flex items-center space-x-2">
                <Home className="h-4 w-4 text-blue-600" />
                <span>Gjesterom</span>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Package className="h-4 w-4 text-green-600" />
                <span>├── Skap A</span>
              </div>
              <div className="flex items-center space-x-2 ml-8">
                <Folder className="h-4 w-4 text-purple-600" />
                <span>│   ├── Hylle A1</span>
              </div>
              <div className="flex items-center space-x-2 ml-12">
                <Archive className="h-4 w-4 text-orange-600" />
                <span>│   │   ├── Boks A1-1</span>
              </div>
              <div className="flex items-center space-x-2 ml-16">
                <ShoppingBag className="h-4 w-4 text-pink-600" />
                <span>│   │   │   └── Pose A1-1-a</span>
              </div>
              <div className="flex items-center space-x-2 ml-8">
                <Folder className="h-4 w-4 text-purple-600" />
                <span>│   └── Hylle A2</span>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Package className="h-4 w-4 text-green-600" />
                <span>└── Skap B</span>
              </div>
            </div>
          </div>

          {/* Don't show again checkbox */}
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Checkbox 
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(!!checked)}
            />
            <label 
              htmlFor="dont-show-again" 
              className="text-sm text-yellow-800 cursor-pointer"
            >
              Ikke vis denne forklaringen igjen
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Hopp over tutorial
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Kom i gang
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}