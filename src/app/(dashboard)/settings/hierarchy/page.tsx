'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, Info, Settings, RefreshCw, Check } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { HierarchyMatrix } from '@/components/settings/HierarchyMatrix'
import { RulePresets } from '@/components/settings/RulePresets'

export default function HierarchySettingsPage() {
  const [selectedRuleSet, setSelectedRuleSet] = useState<string>('')
  const [isApplying, setIsApplying] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  // TODO: Get actual household ID from context/session
  const householdId = 'temp-household-id'

  // Fetch current hierarchy rules
  const { 
    data: currentMatrix, 
    isLoading: loadingMatrix,
    refetch: refetchMatrix 
  } = trpc.hierarchy.getMatrix.useQuery({ householdId })

  // Fetch available rule sets
  const { 
    data: defaultRuleSets, 
    isLoading: loadingRuleSets 
  } = trpc.hierarchy.getDefaultRuleSets.useQuery()

  // Mutation for applying default rule set
  const applyRuleSetMutation = trpc.hierarchy.applyDefaultRuleSet.useMutation({
    onSuccess: () => {
      setSuccessMessage('Regel-sett ble aktivert!')
      setIsApplying(false)
      refetchMatrix()
      setTimeout(() => setSuccessMessage(''), 3000)
    },
    onError: (error) => {
      console.error('Failed to apply rule set:', error)
      setIsApplying(false)
    }
  })

  // Mutation for updating custom rules
  const updateRulesMutation = trpc.hierarchy.updateRules.useMutation({
    onSuccess: () => {
      setSuccessMessage('Egendefinerte regler ble lagret!')
      refetchMatrix()
      setTimeout(() => setSuccessMessage(''), 3000)
    },
    onError: (error) => {
      console.error('Failed to update rules:', error)
    }
  })

  const handleApplyRuleSet = async () => {
    if (!selectedRuleSet) return
    
    setIsApplying(true)
    applyRuleSetMutation.mutate({
      householdId,
      ruleSetName: selectedRuleSet as 'minimal' | 'standard' | 'extended'
    })
  }

  const handleCustomRulesUpdate = (rules: Array<{
    parentType: any
    childType: any
    isAllowed: boolean
  }>) => {
    updateRulesMutation.mutate({
      householdId,
      rules
    })
  }

  const locationTypeLabels: Record<string, string> = {
    ROOM: 'Rom',
    SHELF: 'Reol',
    BOX: 'Boks',
    CONTAINER: 'Beholder',
    DRAWER: 'Skuff',
    CABINET: 'Skap',
    SHELF_COMPARTMENT: 'Hylle',
    BAG: 'Pose',
    SECTION: 'Avsnitt'
  }

  if (loadingMatrix || loadingRuleSets) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Laster hierarki-innstillinger...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">Hierarki-regler</h1>
          <p className="text-muted-foreground">
            Konfigurer hvordan lokasjoner kan organiseres i din husholdning
          </p>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="presets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Standard regel-sett</TabsTrigger>
          <TabsTrigger value="custom">Egendefinerte regler</TabsTrigger>
        </TabsList>

        {/* Standard Rule Sets Tab */}
        <TabsContent value="presets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Velg standard regel-sett</CardTitle>
              <CardDescription>
                Start med et ferdig regel-sett som passer for din type husholdning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rule Set Descriptions */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Minimal</CardTitle>
                    <Badge variant="outline" className="w-fit">8 regler</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enkel organisering for mindre husholdninger. Begrensede nivåer for oversiktlighet.
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Rom → Skap/Beholdere/Bokser</li>
                      <li>• Skap → Bokser/Poser</li>
                      <li>• Beholdere → Bokser/Poser</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Standard</CardTitle>
                    <Badge variant="outline" className="w-fit">18 regler</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Balansert fleksibilitet for de fleste husholdninger. Gode organisasjonsmuligheter.
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Rom → Reoler/Skap/Beholdere</li>
                      <li>• Skap → Skuffer/Hyller/Bokser</li>
                      <li>• Reoler → Hylleavdelinger/Bokser</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Utvidet</CardTitle>
                    <Badge variant="outline" className="w-fit">26 regler</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Maksimal fleksibilitet for komplekse organisasjonsbehov. Alle kombinasjoner tillatt.
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Alle lokasjonstyper kan kombineres</li>
                      <li>• Perfekt for spesialiserte behov</li>
                      <li>• Krever mer planlegging</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Rule Set Selector */}
              <div className="flex gap-4 items-end">
                <div className="flex-1 max-w-xs">
                  <label className="text-sm font-medium">Velg regel-sett</label>
                  <Select value={selectedRuleSet} onValueChange={setSelectedRuleSet}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg et regel-sett" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal (8 regler)</SelectItem>
                      <SelectItem value="standard">Standard (18 regler)</SelectItem>
                      <SelectItem value="extended">Utvidet (26 regler)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleApplyRuleSet}
                  disabled={!selectedRuleSet || isApplying}
                  className="min-w-32"
                >
                  {isApplying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Aktiverer...
                    </>
                  ) : (
                    'Aktiver regel-sett'
                  )}
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Viktig:</strong> Når du aktiverer et nytt regel-sett, vil alle eksisterende 
                  hierarki-regler bli erstattet. Eksisterende lokasjoner påvirkes ikke, men nye 
                  lokasjoner må følge de nye reglene.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Rules Tab */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Egendefinerte hierarki-regler</CardTitle>
              <CardDescription>
                Tilpass hierarki-reglene nøyaktig til dine behov. Kryss av for tillatte kombinasjoner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentMatrix && (
                <HierarchyMatrix
                  matrix={currentMatrix.matrix}
                  locationTypes={currentMatrix.locationTypes}
                  locationTypeLabels={locationTypeLabels}
                  onUpdate={handleCustomRulesUpdate}
                  isLoading={updateRulesMutation.isPending}
                />
              )}
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Tips:</strong> Reglene definerer hvilke lokasjonstyper som kan inneholde andre typer. 
              For eksempel: hvis "Skap → Boks" er krysset av, kan bokser plasseres inne i skap.
              Systemet forhindrer sirkulære avhengigheter automatisk.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}
