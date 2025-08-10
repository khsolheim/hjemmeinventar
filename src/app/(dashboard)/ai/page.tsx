'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Sparkles, 
  Wand2,
  Search,
  Target,
  MapPin,
  Tag,
  Copy,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Zap,
  TestTube,
  BookOpen,
  Loader2,
  CheckCircle,
  Send
} from 'lucide-react'
import { AIInsightsDashboard } from '@/components/ai/AIInsightsDashboard'
import { SmartSuggestions } from '@/components/ai/SmartSuggestions'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

export default function AIPage() {
  const [testItemName, setTestItemName] = useState('')
  const [testDescription, setTestDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [enhancedQuery, setEnhancedQuery] = useState('')

  // AI status
  const { data: aiStatus } = trpc.ai.isEnabled.useQuery()

  // Search enhancement
  const enhanceSearch = trpc.ai.enhanceSearchQuery.useMutation({
    onSuccess: (enhanced) => {
      setEnhancedQuery(enhanced)
      toast.success('Søkequery forbedret!')
    },
    onError: (error) => {
      toast.error('Feil: ' + error.message)
    }
  })

  const handleSearchEnhancement = () => {
    if (searchQuery.trim()) {
      enhanceSearch.mutate({
        query: searchQuery.trim(),
        context: 'Inventarsøk'
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Kopiert til utklippstavle!')
  }

  if (!aiStatus?.enabled) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-3xl font-bold text-gray-500 mb-2">AI-Funksjoner</h1>
          <p className="text-muted-foreground mb-6">
            Intelligente features for smartere inventarhåndtering
          </p>
        </div>

        <Alert className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-center">
            <strong>AI-funksjoner er ikke aktivert.</strong><br />
            For å aktivere AI-features, legg til din OpenAI API-nøkkel i miljøvariablene:<br />
            <code className="bg-muted px-2 py-1 rounded text-sm mt-2 inline-block">
              OPENAI_API_KEY=your_openai_api_key
            </code>
          </AlertDescription>
        </Alert>

        {/* Feature Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto">
          {[
            {
              icon: Target,
              title: 'Smart Kategorisering',
              description: 'AI foreslår automatisk den beste kategorien for nye gjenstander',
              color: 'text-blue-600'
            },
            {
              icon: MapPin,
              title: 'Optimal Lokasjon',
              description: 'Få forslag til hvor gjenstander bør oppbevares basert på type og bruk',
              color: 'text-green-600'
            },
            {
              icon: Tag,
              title: 'Intelligente Tags',
              description: 'Automatisk generering av relevante tags basert på gjenstandens egenskaper',
              color: 'text-purple-600'
            },
            {
              icon: AlertTriangle,
              title: 'Duplikat-deteksjon',
              description: 'Identifiser potensielle duplikater før du legger til nye gjenstander',
              color: 'text-orange-600'
            },
            {
              icon: TrendingUp,
              title: 'Prediktive Innsikter',
              description: 'Analyser og forutsi forbruksmønstre i inventaret ditt',
              color: 'text-red-600'
            },
            {
              icon: Search,
              title: 'Smart Søk',
              description: 'Forbedret søkefunksjonalitet med AI-drevne query-forbedringer',
              color: 'text-indigo-600'
            }
          ].map((feature, index) => (
            <Card key={index} className="text-center border-dashed opacity-60">
              <CardContent className="pt-6">
                <feature.icon className={`w-12 h-12 mx-auto mb-4 ${feature.color}`} />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">AI-Funksjoner</h1>
          <Badge variant="default" className="bg-green-600">
            <Sparkles className="w-3 h-3 mr-1" />
            Aktivt
          </Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Intelligente features drevet av OpenAI som gjør inventarhåndtering smartere og mer effektiv
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <TrendingUp className="w-4 h-4 mr-2" />
            Innsikter
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Wand2 className="w-4 h-4 mr-2" />
            Forslag
          </TabsTrigger>
          <TabsTrigger value="tools">
            <TestTube className="w-4 h-4 mr-2" />
            Verktøy
          </TabsTrigger>
          <TabsTrigger value="learn">
            <BookOpen className="w-4 h-4 mr-2" />
            Lær mer
          </TabsTrigger>
        </TabsList>

        {/* AI Insights Dashboard */}
        <TabsContent value="dashboard">
          <AIInsightsDashboard />
        </TabsContent>

        {/* Smart Suggestions Testing */}
        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                Test AI-Forslag
              </CardTitle>
              <CardDescription>
                Test hvordan AI-systemet fungerer med ulike gjenstander
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Gjenstandsnavn</label>
                  <Input
                    placeholder="F.eks. 'iPhone 15 Pro Max'"
                    value={testItemName}
                    onChange={(e) => setTestItemName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Beskrivelse (valgfritt)</label>
                  <Input
                    placeholder="F.eks. 'Svart, 256GB, med deksel'"
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                  />
                </div>
              </div>

              {testItemName && (
                <SmartSuggestions
                  itemName={testItemName}
                  description={testDescription}
                  onCategorySuggestion={(categoryId, categoryName) => {
                    toast.success(`Kategori-forslag: ${categoryName}`)
                  }}
                  onLocationSuggestion={(locationId, locationName) => {
                    toast.success(`Lokasjon-forslag: ${locationName}`)
                  }}
                  onTagsSuggestion={(tags) => {
                    toast.success(`Tags-forslag: ${tags.join(', ')}`)
                  }}
                  onDuplicateWarning={(duplicates) => {
                    toast.warning(`${duplicates.length} mulige duplikater funnet`)
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tools */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Enhancement Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Smart Søk
                </CardTitle>
                <CardDescription>
                  Forbedre søkequeries med AI for bedre resultater
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Opprinnelig søkequery</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="F.eks. 'rød garn ull'"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button
                      onClick={handleSearchEnhancement}
                      disabled={enhanceSearch.isPending || !searchQuery.trim()}
                    >
                      {enhanceSearch.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {enhancedQuery && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Forbedret query:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(enhancedQuery)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-green-700 font-mono">{enhancedQuery}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Future Tools Placeholder */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Kommende Verktøy
                </CardTitle>
                <CardDescription>
                  Flere AI-verktøy kommer snart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-center text-muted-foreground">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Lightbulb className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Automatisk Organisering</p>
                    <p className="text-xs">AI foreslår optimal organisering av hele inventaret</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Forbruksprediksjon</p>
                    <p className="text-xs">Forutsi når du trenger å fylle på lageret</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Target className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Personlige Anbefalinger</p>
                    <p className="text-xs">Tilpassede tips basert på dine vaner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Learn More */}
        <TabsContent value="learn" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                Hvordan AI-funksjonene fungerer
              </CardTitle>
              <CardDescription>
                Lær mer om de intelligente funksjonene og hvordan de hjelper deg
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-blue-600" />
                    Smart Kategorisering
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    AI analyserer gjenstandsnavnet og beskrivelsen for å foreslå den mest passende kategorien basert på:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Gjenstandstype og egenskaper</li>
                    <li>Vanlige bruksområder</li>
                    <li>Eksisterende kategorier i systemet</li>
                    <li>Bransjestandarder og beste praksis</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-green-600" />
                    Optimal Lokasjon
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    AI vurderer flere faktorer for å foreslå beste oppbevaringssted:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Temperatur og fuktighetskrav</li>
                    <li>Bruksfrekvens og tilgjengelighet</li>
                    <li>Størrelse og oppbevaringsbehov</li>
                    <li>Sikkerhet og organisering</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-purple-600" />
                    Intelligente Tags
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    AI genererer relevante tags automatisk basert på:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Merke og modell</li>
                    <li>Farge og materiale</li>
                    <li>Størrelse og tilstand</li>
                    <li>Bruksområde og funksjon</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Duplikat-deteksjon
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    AI sammenligner nye gjenstander med eksisterende for å finne:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Navn-likhet og synonymer</li>
                    <li>Beskrivelse-likhet</li>
                    <li>Samme kategori og type</li>
                    <li>Merke og modell-matching</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tips:</strong> Jo mer detaljert informasjon du gir om gjenstander (navn, beskrivelse, egenskaper), 
                  jo bedre og mer nøyaktige AI-forslag vil du få. AI-systemet lærer kontinuerlig og blir bedre over tid.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

