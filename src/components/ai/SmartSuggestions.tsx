'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Sparkles, 
  Brain, 
  Target, 
  MapPin, 
  Tag, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Lightbulb,
  Wand2,
  Copy
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SmartSuggestionsProps {
  itemName: string
  description?: string
  onCategorySuggestion?: (categoryId: string, categoryName: string) => void
  onLocationSuggestion?: (locationId: string, locationName: string) => void
  onTagsSuggestion?: (tags: string[]) => void
  onDuplicateWarning?: (duplicates: any[]) => void
  className?: string
  disabled?: boolean
}

export function SmartSuggestions({
  itemName,
  description,
  onCategorySuggestion,
  onLocationSuggestion,
  onTagsSuggestion,
  onDuplicateWarning,
  className,
  disabled = false
}: SmartSuggestionsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Check if AI is enabled
  const { data: aiStatus } = trpc.ai.isEnabled.useQuery()
  
  // Batch suggestions mutation
  const batchSuggestions = trpc.ai.getBatchSuggestions.useMutation({
    onSuccess: (data) => {
      setSuggestions(data)
      setIsGenerating(false)
      
      // Notify parent components
      if (data.category && onCategorySuggestion) {
        onCategorySuggestion(data.category.categoryId, data.category.categoryName)
      }
      if (data.location && onLocationSuggestion) {
        onLocationSuggestion(data.location.locationId, data.location.locationName)
      }
      if (data.tags.length > 0 && onTagsSuggestion) {
        onTagsSuggestion(data.tags)
      }
      if (data.duplicates.length > 0 && onDuplicateWarning) {
        onDuplicateWarning(data.duplicates)
      }
    },
    onError: (error) => {
      setIsGenerating(false)
      toast.error('AI-forslag feilet: ' + error.message)
    }
  })

  // Auto-generate suggestions when item name changes
  useEffect(() => {
    if (itemName.length >= 3 && aiStatus?.enabled && !disabled) {
      const timer = setTimeout(() => {
        generateSuggestions()
      }, 1000) // Debounce 1 second

      return () => clearTimeout(timer)
    }
    return undefined
  }, [itemName, description, aiStatus?.enabled, disabled])

  const generateSuggestions = async () => {
    if (!itemName.trim() || isGenerating) return

    setIsGenerating(true)
    setSuggestions(null)
    
    batchSuggestions.mutate({
      itemName: itemName.trim(),
      description: description?.trim()
    })
  }

  const applySuggestion = (type: 'category' | 'location' | 'tags', data: any) => {
    switch (type) {
      case 'category':
        onCategorySuggestion?.(data.categoryId, data.categoryName)
        toast.success(`Kategori "${data.categoryName}" anvendt!`)
        break
      case 'location':
        onLocationSuggestion?.(data.locationId, data.locationName)
        toast.success(`Lokasjon "${data.locationName}" anvendt!`)
        break
      case 'tags':
        onTagsSuggestion?.(data)
        toast.success(`${data.length} tags lagt til!`)
        break
    }
  }

  if (!aiStatus?.enabled) {
    return (
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          AI-funksjoner er ikke aktivert. Sett OPENAI_API_KEY for å aktivere smarte forslag.
        </AlertDescription>
      </Alert>
    )
  }

  if (!itemName || itemName.length < 3) {
    return (
      <Card className={cn('opacity-50', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            AI-Forslag
          </CardTitle>
          <CardDescription className="text-xs">
            Skriv inn et gjenstandsnavn for å få intelligente forslag
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={cn('border-blue-200 bg-blue-50/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            AI-Forslag
            {isGenerating && <Loader2 className="w-3 h-3 animate-spin" />}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={generateSuggestions}
              disabled={isGenerating || !itemName}
            >
              <Wand2 className="w-3 h-3 mr-1" />
              Generer
            </Button>
            {suggestions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Skjul' : 'Detaljer'}
              </Button>
            )}
          </div>
        </div>
        <CardDescription className="text-xs">
          AI-baserte forslag for "{itemName}"
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Genererer intelligente forslag...
          </div>
        )}

        {suggestions && (
          <div className="space-y-3">
            {/* Category Suggestion */}
            {suggestions.category && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Kategori: {suggestions.category.categoryName}</p>
                    {showDetails && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {suggestions.category.reasoning}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applySuggestion('category', suggestions.category)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Bruk
                </Button>
              </div>
            )}

            {/* Location Suggestion */}
            {suggestions.location && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Lokasjon: {suggestions.location.locationName}</p>
                    {showDetails && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {suggestions.location.reasoning}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applySuggestion('location', suggestions.location)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Bruk
                </Button>
              </div>
            )}

            {/* Tags Suggestion */}
            {suggestions.tags && suggestions.tags.length > 0 && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">Foreslåtte tags:</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applySuggestion('tags', suggestions.tags)}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Bruk alle
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {suggestions.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Duplicate Warning */}
            {suggestions.duplicates && suggestions.duplicates.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Mulige duplikater funnet:</strong>
                  <div className="mt-2 space-y-1">
                    {suggestions.duplicates.map((dup: any, index: number) => (
                      <div key={index} className="text-sm">
                        • {dup.itemName} ({Math.round(dup.similarity * 100)}% likhet)
                        {showDetails && dup.reasons.length > 0 && (
                          <div className="ml-4 text-xs text-muted-foreground">
                            {dup.reasons.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* No suggestions */}
            {!suggestions.category && !suggestions.location && 
             suggestions.tags.length === 0 && suggestions.duplicates.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ingen forslag tilgjengelig for denne gjenstanden.</p>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={isGenerating}
            className="flex-1"
          >
            <Brain className="w-3 h-3 mr-1" />
            {isGenerating ? 'Genererer...' : 'Oppdater forslag'}
          </Button>
          
          {suggestions && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(suggestions, null, 2))
                toast.success('Forslag kopiert!')
              }}
            >
              <Copy className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Individual suggestion components for granular control
export function CategorySuggestion({ 
  itemName, 
  description, 
  onApply 
}: { 
  itemName: string
  description?: string
  onApply: (categoryId: string, categoryName: string) => void 
}) {
  const categorySuggestion = trpc.ai.suggestCategory.useMutation()

  const getSuggestion = () => {
    categorySuggestion.mutate(
      { itemName, description },
      {
        onSuccess: (data) => {
          if (data) {
            onApply(data.categoryId, data.categoryName)
          }
        }
      }
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={getSuggestion}
      disabled={categorySuggestion.isPending}
    >
      {categorySuggestion.isPending ? (
        <Loader2 className="w-3 h-3 animate-spin mr-1" />
      ) : (
        <Target className="w-3 h-3 mr-1" />
      )}
      AI-kategori
    </Button>
  )
}

export function TagsSuggestion({ 
  itemName, 
  description, 
  categoryName,
  onApply 
}: { 
  itemName: string
  description?: string
  categoryName?: string
  onApply: (tags: string[]) => void 
}) {
  const tagsSuggestion = trpc.ai.suggestTags.useMutation()

  const getSuggestion = () => {
    tagsSuggestion.mutate(
      { itemName, description, categoryName },
      {
        onSuccess: (tags) => {
          if (tags.length > 0) {
            onApply(tags)
          }
        }
      }
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={getSuggestion}
      disabled={tagsSuggestion.isPending}
    >
      {tagsSuggestion.isPending ? (
        <Loader2 className="w-3 h-3 animate-spin mr-1" />
      ) : (
        <Tag className="w-3 h-3 mr-1" />
      )}
      AI-tags
    </Button>
  )
}

