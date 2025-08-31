'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NaturalLanguageSearch } from '@/components/search/NaturalLanguageSearch'
import { MeilisearchBox } from '@/components/search/MeilisearchBox'
import { Badge } from '@/components/ui/badge'
import { Search, Sparkles, TrendingUp } from 'lucide-react'

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<'regular' | 'natural'>('natural')

  return (
    <div className="page container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold title flex items-center gap-3">
          <Search className="w-8 h-8" />
          Avansert søk
        </h1>
        <p className="text-muted-foreground secondary-text">
          Finn det du leter etter på flere smarte måter
        </p>
      </div>

      {/* Search Method Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'natural' ? 'default' : 'outline'}
          onClick={() => setActiveTab('natural')}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Naturlig språk søk
        </Button>
        <Button
          variant={activeTab === 'regular' ? 'default' : 'outline'}
          onClick={() => setActiveTab('regular')}
          className="gap-2"
        >
          <Search className="w-4 h-4" />
          Avansert søk
        </Button>
      </div>

      {/* Natural Language Search */}
      {activeTab === 'natural' && (
        <div className="space-y-6">
          <NaturalLanguageSearch />

          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Populære søk
              </CardTitle>
              <CardDescription>
                Ofte søkte naturlige spørsmål
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  "hvor er mine røde sokker?",
                  "strikketøy i stuen",
                  "nye ting denne måneden",
                  "hva har jeg i kjøleskapet?",
                  "mine verktøy",
                  "utløper snart"
                ].map((query, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div className="font-medium text-sm">{query}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Klikk for å søke
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Regular Advanced Search */}
      {activeTab === 'regular' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Avansert søk</CardTitle>
              <CardDescription>
                Søk med filtre og spesifikke kriterier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MeilisearchBox
                placeholder="Søk i inventar med filtre..."
                showFilters={true}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Search Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Søketips</CardTitle>
              <CardDescription>
                Få bedre søkeresultater
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Grunnleggende søk</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Søk på gjenstandsnavn</li>
                    <li>• Søk på beskrivelse</li>
                    <li>• Søk på kategori</li>
                    <li>• Søk på lokasjon</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Avanserte filtre</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Filtrer på mengde</li>
                    <li>• Filtrer på verdi</li>
                    <li>• Søk med bilde</li>
                    <li>• Søk med strekkode</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
