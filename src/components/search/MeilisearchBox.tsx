'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Search, 
  Package, 
  MapPin, 
  Grid3x3, 
  Clock,
  Loader2,
  Filter,
  X,
  TrendingUp,
  Sparkles,
  Wand2
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface SearchResult {
  id: string
  type: 'item' | 'location' | 'category'
  name: string
  description?: string
  categoryName?: string
  locationName?: string
  price?: number
  quantity?: number
  _formatted?: any
}

interface SearchFilters {
  type?: 'item' | 'location' | 'category'
  categoryName?: string
  locationName?: string
  priceRange?: [number, number]
  hasImage?: boolean
  hasBarcode?: boolean
}

export function MeilisearchBox({ 
  placeholder = "Søk i inventar...",
  className = "",
  onResultSelect,
  showFilters = true,
  autoFocus = false
}: {
  placeholder?: string
  className?: string
  onResultSelect?: (result: SearchResult) => void
  showFilters?: boolean
  autoFocus?: boolean
}) {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularItems, setPopularItems] = useState<SearchResult[]>([])
  const [aiEnhanced, setAiEnhanced] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // AI search enhancement
  const { data: aiStatus } = trpc.ai.isEnabled.useQuery()
  const enhanceSearch = trpc.ai.enhanceSearchQuery.useMutation({
    onSuccess: (enhanced) => {
      setQuery(enhanced)
      setAiEnhanced(true)
      toast.success('Søket ble forbedret med AI!')
      inputRef.current?.focus()
    },
    onError: (error) => {
      toast.error('AI-forbedring feilet: ' + error.message)
    }
  })

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hjemmeinventar-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const updated = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5)
    
    setRecentSearches(updated)
    localStorage.setItem('hjemmeinventar-recent-searches', JSON.stringify(updated))
  }, [recentSearches])

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!session?.user?.id || !searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/search/meilisearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          filters,
          limit: 10
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.hits || [])
      } else {
        console.error('Search failed:', await response.text())
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id, filters])

  // Debounced search effect
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery)
    } else {
      setResults([])
    }
  }, [debouncedQuery, performSearch])

  // Get popular items when no query
  useEffect(() => {
    if (!query && isOpen && session?.user?.id) {
      // This would typically fetch popular/recent items
      // For now, we'll keep it empty
      setPopularItems([])
    }
  }, [query, isOpen, session?.user?.id])

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query)
    
    if (onResultSelect) {
      onResultSelect(result)
    } else {
      // Navigate to the result
      const [type, id] = result.id.split('_')
      switch (type) {
        case 'item':
          router.push(`/items?highlight=${id}`)
          break
        case 'location':
          router.push(`/locations?highlight=${id}`)
          break
        case 'category':
          router.push(`/categories?highlight=${id}`)
          break
      }
    }
    
    setIsOpen(false)
    setQuery('')
  }

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery)
    inputRef.current?.focus()
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('hjemmeinventar-recent-searches')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'item': return <Package className="h-4 w-4" />
      case 'location': return <MapPin className="h-4 w-4" />
      case 'category': return <Grid3x3 className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'item': return 'Gjenstand'
      case 'location': return 'Lokasjon'
      case 'category': return 'Kategori'
      default: return 'Ukjent'
    }
  }

  const formatPrice = (price?: number) => {
    if (!price) return null
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK'
    }).format(price)
  }

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setAiEnhanced(false) // Reset AI enhanced flag when user types
              }}
              onFocus={() => setIsOpen(true)}
              className={`pl-9 ${aiStatus?.enabled && query ? 'pr-20' : 'pr-4'}`}
              autoFocus={autoFocus}
            />
            
            {/* AI Enhancement Button */}
            {aiStatus?.enabled && query && !isLoading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => enhanceSearch.mutate({ query, context: 'Inventarsøk' })}
                disabled={enhanceSearch.isPending}
                className="absolute right-8 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                title="Forbedr søket med AI"
              >
                {enhanceSearch.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : aiEnhanced ? (
                  <Sparkles className="h-3 w-3 text-blue-600" />
                ) : (
                  <Wand2 className="h-3 w-3 text-blue-500" />
                )}
              </Button>
            )}
            
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[400px] p-0" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-[400px]">
              {/* Search Results */}
              {query && results.length > 0 && (
                <CommandGroup heading="Søkeresultater">
                  {results.map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleResultClick(result)}
                      className="flex items-center gap-3 p-3"
                    >
                      <div className="flex items-center gap-2">
                        {getTypeIcon(result.type)}
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(result.type)}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {result._formatted?.name ? (
                            <span dangerouslySetInnerHTML={{ __html: result._formatted.name }} />
                          ) : (
                            result.name
                          )}
                        </div>
                        
                        {result.description && (
                          <div className="text-sm text-muted-foreground truncate">
                            {result._formatted?.description ? (
                              <span dangerouslySetInnerHTML={{ __html: result._formatted.description }} />
                            ) : (
                              result.description
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-1">
                          {result.categoryName && (
                            <Badge variant="secondary" className="text-xs">
                              {result.categoryName}
                            </Badge>
                          )}
                          {result.locationName && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {result.locationName}
                            </Badge>
                          )}
                          {result.price && (
                            <Badge variant="outline" className="text-xs">
                              {formatPrice(result.price)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* No Results */}
              {query && !isLoading && results.length === 0 && (
                <CommandEmpty>
                  <div className="py-6 text-center">
                    <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Ingen resultater for "{query}"
                    </p>
                  </div>
                </CommandEmpty>
              )}

              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <>
                  <CommandGroup 
                    heading={
                      <div className="flex items-center justify-between">
                        <span>Nylige søk</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="h-auto p-1 text-xs"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    }
                  >
                    {recentSearches.map((recentQuery, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleRecentSearchClick(recentQuery)}
                        className="flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{recentQuery}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Popular Items */}
              {!query && popularItems.length > 0 && (
                <CommandGroup heading="Populære gjenstander">
                  {popularItems.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleResultClick(item)}
                      className="flex items-center gap-3"
                    >
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.locationName && (
                          <div className="text-sm text-muted-foreground">
                            {item.locationName}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Empty State */}
              {!query && recentSearches.length === 0 && popularItems.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>Begynn å skrive for å søke...</p>
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
