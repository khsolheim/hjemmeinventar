'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, Package, Settings, Layers } from 'lucide-react'

interface RuleSet {
  name: string
  rules: Array<{
    parentType: string
    childType: string
    isAllowed: boolean
    description?: string
  }>
}

interface RulePresetsProps {
  ruleSets: RuleSet[]
  onApplyRuleSet: (ruleSetName: string) => void
  currentRuleSetName?: string
  isLoading?: boolean
}

export function RulePresets({ 
  ruleSets, 
  onApplyRuleSet, 
  currentRuleSetName, 
  isLoading = false 
}: RulePresetsProps) {
  const getRuleSetDescription = (name: string) => {
    switch (name) {
      case 'minimal':
        return {
          title: 'Minimal',
          description: 'Enkel organisering for mindre husholdninger',
          icon: Package,
          features: [
            'Få nivåer for oversiktlighet',
            'Enkel å forstå og bruke',
            'Passer små hjem og leiligheter'
          ]
        }
      case 'standard':
        return {
          title: 'Standard',
          description: 'Balansert fleksibilitet for de fleste husholdninger',
          icon: Settings,
          features: [
            'God balanse mellom fleksibilitet og struktur',
            'Passer de fleste hjem',
            'Støtter vanlige organisasjonsmønstre'
          ]
        }
      case 'extended':
        return {
          title: 'Utvidet',
          description: 'Maksimal fleksibilitet for komplekse behov',
          icon: Layers,
          features: [
            'Alle kombinasjoner tillatt',
            'For avanserte brukere',
            'Krever mer planlegging'
          ]
        }
      default:
        return {
          title: name,
          description: 'Egendefinert regel-sett',
          icon: Settings,
          features: []
        }
    }
  }

  const getPreviewRules = (rules: RuleSet['rules']) => {
    // Group rules by parent type for easier reading
    const grouped = rules
      .filter(r => r.isAllowed)
      .reduce((acc, rule) => {
        if (!acc[rule.parentType]) {
          acc[rule.parentType] = []
        }
        acc[rule.parentType]!.push(rule.childType)
        return acc
      }, {} as Record<string, string[]>)

    return Object.entries(grouped)
      .slice(0, 3) // Show only first 3 for preview
      .map(([parent, children]) => ({
        parent,
        children: children.slice(0, 3) // Show only first 3 children
      }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Velg standard regel-sett</h3>
        <p className="text-muted-foreground text-sm">
          Start med et ferdig regel-sett som passer for din type organisering
        </p>
      </div>

      {/* Rule Set Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ruleSets.map((ruleSet) => {
          const info = getRuleSetDescription(ruleSet.name)
          const IconComponent = info.icon
          const isActive = currentRuleSetName === ruleSet.name
          const previewRules = getPreviewRules(ruleSet.rules)
          const totalRules = ruleSet.rules.filter(r => r.isAllowed).length

          return (
            <Card 
              key={ruleSet.name} 
              className={`relative transition-all duration-200 hover:shadow-md ${
                isActive 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {isActive && (
                <div className="absolute -top-2 -right-2">
                  <CheckCircle className="h-6 w-6 text-green-600 bg-white rounded-full" />
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                  <Badge variant="outline" className="ml-auto">
                    {totalRules} regler
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {info.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                {info.features.length > 0 && (
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {info.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-primary">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Rule Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Eksempel-regler:</p>
                  <div className="space-y-1">
                    {previewRules.map(({ parent, children }, index) => (
                      <div key={index} className="text-xs">
                        <span className="font-medium">{parent}</span>
                        <span className="text-muted-foreground"> → </span>
                        <span className="text-blue-600">
                          {children.join(', ')}
                          {children.length >= 3 && '...'}
                        </span>
                      </div>
                    ))}
                    {previewRules.length >= 3 && (
                      <div className="text-xs text-muted-foreground">
                        ... og {totalRules - previewRules.reduce((sum, r) => sum + r.children.length, 0)} flere
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant={isActive ? "secondary" : "default"}
                  className="w-full"
                  onClick={() => onApplyRuleSet(ruleSet.name)}
                  disabled={isLoading || isActive}
                >
                  {isActive 
                    ? 'Aktivt regel-sett' 
                    : `Aktiver ${info.title.toLowerCase()}`
                  }
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Viktig:</strong> Når du aktiverer et nytt regel-sett, vil alle eksisterende 
          hierarki-regler bli erstattet. Eksisterende lokasjoner påvirkes ikke, men nye 
          lokasjoner må følge de nye reglene.
        </AlertDescription>
      </Alert>
    </div>
  )
}
