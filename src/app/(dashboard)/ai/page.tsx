'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PredictiveMaintenance } from '@/components/predictive/PredictiveMaintenance'
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Brain,
  Target,
  Zap
} from 'lucide-react'

export default function AIPage() {
  const [activeTab, setActiveTab] = useState('maintenance')
  const aiEnabled = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY

  if (!aiEnabled) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">AI-assistent</h1>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            AI-funksjoner er ikke aktivert. Kontakt administrator for å aktivere OpenAI-integrasjon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 cq">
        <div>
          <h1 className="text-3xl font-bold title flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            AI-assistent
          </h1>
          <p className="text-muted-foreground secondary-text">
            Smarte verktøy for bedre organisering og vedlikehold
          </p>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <h3 className="font-medium">Smart kategorisering</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI foreslår beste kategorier og lagringsplasser for nye ting
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-green-600" />
              <h3 className="font-medium">Prediktive råd</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Få varsler om ting som utløper eller går tom snart
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-6 h-6 text-purple-600" />
              <h3 className="font-medium">Organiseringsråd</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Personlige tips for bedre hjemmeorganisering
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <h3 className="font-medium">Bruksmønstre</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Analyse av hvordan og når du bruker tingene dine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="maintenance" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Vedlikehold
          </TabsTrigger>
          <TabsTrigger value="categorization" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Kategorisering
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Innsikter
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Analyse
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="mt-6">
          <PredictiveMaintenance />
        </TabsContent>

        <TabsContent value="categorization" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Smart kategorisering
              </CardTitle>
              <CardDescription>
                AI hjelper deg å kategorisere og organisere nye ting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Kommer snart</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Smart kategorisering er integrert i Quick-Add arbeidsflyten.
                    Gå til "Legg til gjenstand" for å prøve det nå!
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Automatisk kategorisering</h4>
                      <p className="text-sm text-muted-foreground">
                        Basert på navn, beskrivelse og eksisterende mønstre
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Lokasjon forslag</h4>
                      <p className="text-sm text-muted-foreground">
                        Smarte råd om hvor ting bør lagres
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI-innsikter
              </CardTitle>
              <CardDescription>
                Personlige råd for bedre organisering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Innsikter kommer</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  AI-innsikter genereres automatisk basert på din bruk og er tilgjengelige
                  i "Vedlikehold"-fanen når du har lagt til flere ting.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Bruksanalyse
              </CardTitle>
              <CardDescription>
                Forstå hvordan du bruker hjemmet ditt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Analyse kommer</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Detaljert analyse av bruksmønstre og effektivitet kommer snart.
                  Dette vil inkludere tidspunkt for aktivitet, mest brukte kategorier,
                  og optimaliseringsforslag.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}