'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Mic, 
  Sparkles,
  MapPin,
  Package,
  Clock,
  TrendingUp,
  Filter,
  X,
  Loader2
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useDebounce } from '@/hooks/useDebounce'
import { VoiceCommand } from '@/components/ui/voice-command'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface SmartSearchProps {
  onResultSelect?: (item: any) => void
  className?: string
}

export function SmartSearch({ onResultSelect, className }: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<any[]>([])
  const [voiceMode, setVoiceMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const haptic = useHapticFeedback()

  const debouncedQuery = useDebounce(query, 300)

  // Search queries
  const searchQuery = trpc.items.search.useQuery(
    { query: debouncedQuery, limit: 10 },
    { enabled: debouncedQuery.length > 2 }
  )

  const suggestionsQuery = trpc.search.getSuggestions.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length > 1 }
  )

  const popularItemsQuery = trpc.items.getPopular.useQuery(
    { limit: 5 },
    { enabled: !debouncedQuery }
  )

  // Process natural language query
  const processNaturalQuery = async (query: string) => {
    setIsSearching(true)
    haptic.light()

    try {
      const result = await trpc.search.processNaturalQuery.mutate({ query })
      return result
    } catch (error) {
      console.error('Natural query processing failed:', error)
      return null
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Add to search history
    setSearchHistory(prev => {
      const newHistory = [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 10)
      localStorage.setItem('search-history', JSON.stringify(newHistory))
      return newHistory
    })

    // Process natural language query
    const naturalResult = await processNaturalQuery(searchQuery)
    
    if (naturalResult) {
      haptic.success()
      setShowSuggestions(false)
    }
  }

  const handleVoiceSearch = (command: string) => {
    setQuery(command)
    handleSearch(command)
  }

  const handleQuickSearch = (quickQuery: string) => {
    setQuery(quickQuery)
    handleSearch(quickQuery)
  }

  const handleResultSelect = (item: any) => {
    haptic.selection()
    if (onResultSelect) {
      onResultSelect(item)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Load search history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('search-history')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Show suggestions when query changes
  useEffect(() => {
    setShowSuggestions(query.length > 0)
  }, [query])

  const quickSearches = [
    { label: 'Hvor er strikkepinnene?', query: 'strikkepinner', icon: Package },
    { label: 'Kjøkkenutstyr', query: 'kjøkken', icon: MapPin },
    { label: 'Sist brukt', query: 'sist brukt', icon: Clock },
    { label: 'Populære gjenstander', query: 'populære', icon: TrendingUp }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Søk naturlig: 'Hvor er strikkepinnene?' eller 'Vis kjøkkenutstyr'"
              className="pl-10 pr-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(query)
                }
              }}
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <Button
            onClick={() => setVoiceMode(!voiceMode)}
            variant={voiceMode ? "default" : "outline"}
            size="icon"
            className="w-10 h-10"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>

        {/* Voice Command */}
        {voiceMode && (
          <div className="mt-2">
            <VoiceCommand
              onCommand={(result) => {
                if (result.query) {
                  handleVoiceSearch(result.query)
                }
              }}
              onError={(error) => {
                console.error('Voice search error:', error)
              }}
            />
          </div>
        )}
      </div>

      {/* Quick Searches */}
      {!query && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Raske søk</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickSearches.map((quickSearch) => (
              <Button
                key={quickSearch.query}
                variant="outline"
                onClick={() => handleQuickSearch(quickSearch.query)}
                className="justify-start h-auto p-3"
              >
                <quickSearch.icon className="w-4 h-4 mr-2" />
                <span className="text-sm">{quickSearch.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Search History */}
      {!query && searchHistory.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Søkehistorikk</h3>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 5).map((historyItem, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => handleQuickSearch(historyItem)}
              >
                {historyItem}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search Suggestions */}
      {showSuggestions && suggestionsQuery.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Smart forslag
            </CardTitle>
            <CardDescription>
              Basert på din søkeforespørsel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestionsQuery.data.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  onClick={() => handleQuickSearch(suggestion.query)}
                  className="w-full justify-start h-auto p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <suggestion.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{suggestion.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchQuery.data && searchQuery.data.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Søkeresultater</CardTitle>
            <CardDescription>
              {searchQuery.data.items.length} gjenstander funnet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searchQuery.data.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleResultSelect(item)}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.location?.name} • {item.category}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {item.availableQuantity || 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Items */}
      {!query && popularItemsQuery.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Populære gjenstander
            </CardTitle>
            <CardDescription>
              Basert på bruksmønster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {popularItemsQuery.data.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleResultSelect(item)}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Brukt {item.usageCount} ganger
                    </div>
                  </div>
                  <Badge variant="secondary">
                    Populær
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Analyserer søkeforespørsel...</span>
        </div>
      )}
    </div>
  )
}
