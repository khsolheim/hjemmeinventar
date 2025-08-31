'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MeilisearchBox } from './MeilisearchBox'
import { Sparkles, Search, Lightbulb, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface NaturalLanguageSearchProps {
  className?: string
}

export function NaturalLanguageSearch({ className = '' }: NaturalLanguageSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const exampleSearches = [
    {
      query: "hvor er mine røde sokker?",
      description: "Finn spesifikke gjenstander med farge og type"
    },
    {
      query: "strikketøy i stuen",
      description: "Søk etter kategori i et spesifikt rom"
    },
    {
      query: "nye ting denne måneden",
      description: "Se nylig registrerte gjenstander"
    },
    {
      query: "hva har jeg i kjøleskapet?",
      description: "Alt som er lagret i kjøleskap"
    },
    {
      query: "mine verktøy",
      description: "Alle gjenstander i verktøy-kategorien"
    },
    {
      query: "utløper snart",
      description: "Gjenstander som nærmer seg utløpsdato"
    }
  ]

  return (
    <div className={className}>
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Naturlig språk søk</CardTitle>
                <CardDescription>
                  Søk på norsk som om du spør en venn
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Skjul' : 'Se eksempler'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Main Search Box */}
          <div className="space-y-2">
            <MeilisearchBox
              placeholder="Skriv naturlig: 'hvor er mine røde sokker?' eller 'strikketøy i stuen'"
              naturalLanguageMode={true}
              className="w-full"
            />
          </div>

          {/* Quick Examples */}
          {isExpanded && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                <Lightbulb className="w-4 h-4" />
                Prøv disse naturlige søkene:
              </div>

              <div className="grid gap-2">
                {exampleSearches.map((example, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white/60 rounded-lg border border-blue-100 hover:bg-white/80 transition-colors cursor-pointer"
                    onClick={() => {
                      // This would trigger the search with the example query
                      toast.info(`Søker etter: "${example.query}"`)
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-blue-900">
                          "{example.query}"
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {example.description}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="p-3 bg-white/60 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <Search className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">Tips for naturlig søk</div>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Spør som om du snakker med en person</li>
                  <li>• Inkluder farger, størrelser eller merker</li>
                  <li>• Nevn rom eller lokasjoner</li>
                  <li>• Bruk ord som "mine", "nye", "siste"</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Compact version for header/sidebar
export function NaturalLanguageSearchCompact({ onSearch }: { onSearch?: (query: string) => void }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && onSearch) {
      onSearch(query.trim())
      setQuery('')
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Naturlig søk..."
            className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" size="sm" disabled={!query.trim()}>
          <Search className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
