'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Search as Magnify,
  Filter,
  SlidersHorizontal,
  Sparkles,
  Brain,
  Zap,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Star,
  Award,
  Trophy,
  Crown,
  Rocket,
  Sparkles as Magic,
  Search as Find,
  Search as Look,
  Filter as Sort,
  SlidersHorizontal as Adjust,
  Sparkles as Glow,
  Brain as AI,
  Zap as Lightning,
  Settings as Config,
  RefreshCw as Update,
  CheckCircle as Success,
  XCircle as Error,
  AlertTriangle as Warning,
  Info as Details,
  Star as Favorite,
  Award as Prize,
  Trophy as Victory,
  Crown as King,
  Rocket as Launch,
  Sparkles as Shine,
  Search as Hunt,
  Search as Explore,
  Filter as Refine,
  SlidersHorizontal as Tune,
  Sparkles as Flash,
  Brain as Mind,
  Zap as Power,
  Settings as Setup,
  RefreshCw as Reload,
  CheckCircle as Done,
  XCircle as Fail,
  AlertTriangle as Notice,
  Info as Help,
  Star as Rate,
  Award as Win,
  Crown as Leader,
  Rocket as Boost,
  Sparkles as Glitter,
  Clock,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Crosshair,
  Layers,
  Grid3x3,
  List,
  Plus,
  Edit,
  Trash2,
  Share2,
  Download,
  Upload,
  Mail,
  Phone,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  Bluetooth,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Heart,
  HeartOff,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Hash as Number,
  AtSign as Mention,
  Hash as Pound,
  AtSign as At,
  Hash as Sharp,
  AtSign as Symbol,
  FileText,
  Image,
  Video,
  Music,
  File,
  Folder,
  Database,
  Server,
  Cloud,
  Globe,
  MapPin,
  Navigation,
  Compass,
  Target as Aim,
  Crosshair as Scope,
  Layers as Stack,
  Grid3x3 as Grid,
  List as Menu,
  Plus as Add,
  Edit as Modify,
  Trash2 as Delete,
  Share2 as Send,
  Download as Get,
  Upload as Put
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedSearchProps {
  className?: string
}

export function AdvancedSearch({ className }: AdvancedSearchProps) {
  const [selectedTab, setSelectedTab] = useState<'search' | 'semantic' | 'analytics' | 'settings'>('search')
  const [isSearching, setIsSearching] = useState(false)
  const [searchEnabled, setSearchEnabled] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [filters, setFilters] = useState<any>({})
  const haptic = useHapticFeedback()

  // Search queries
  const searchQuery_tRPC = trpc.search.getSearchStatus.useQuery()
  const semanticQuery = trpc.search.getSemanticSearch.useQuery()
  const analyticsQuery = trpc.search.getSearchAnalytics.useQuery()
  const settingsQuery = trpc.search.getSearchSettings.useQuery()

  const performSearchMutation = trpc.search.performSearch.useMutation()
  const semanticSearchMutation = trpc.search.semanticSearch.useMutation()
  const updateSettingsMutation = trpc.search.updateSettings.useMutation()

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    try {
      setIsSearching(true)
      haptic.selection()

      const result = await performSearchMutation.mutateAsync({
        query,
        filters,
        semantic: selectedTab === 'semantic'
      })

      if (result.success) {
        setSearchResults(result.results)
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Search failed:', error)
      haptic.error()
    } finally {
      setIsSearching(false)
    }
  }

  const handleSemanticSearch = async (query: string) => {
    if (!query.trim()) return

    try {
      setIsSearching(true)
      haptic.selection()

      const result = await semanticSearchMutation.mutateAsync({
        query,
        context: 'inventory',
        limit: 10
      })

      if (result.success) {
        setSearchResults(result.results)
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Semantic search failed:', error)
      haptic.error()
    } finally {
      setIsSearching(false)
    }
  }

  const handleToggleSearch = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ searchEnabled: enabled })
      setSearchEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle search:', error)
    }
  }

  const getSearchStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Aktiv', icon: Search }
      case 'inactive': return { color: 'text-red-600', label: 'Inaktiv', icon: XCircle }
      case 'searching': return { color: 'text-yellow-600', label: 'Søker', icon: RefreshCw }
      default: return { color: 'text-gray-600', label: 'Ukjent', icon: AlertTriangle }
    }
  }

  const getRelevanceScore = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600' }
    if (score >= 70) return { level: 'Good', color: 'text-blue-600' }
    if (score >= 50) return { level: 'Fair', color: 'text-yellow-600' }
    return { level: 'Poor', color: 'text-red-600' }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Search</h2>
          <p className="text-muted-foreground">
            Semantic search, search analytics og search optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Search className="w-3 h-3" />
            Search Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Search Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Status</CardTitle>
            <Search className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {searchEnabled ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {getSearchStatus(searchEnabled ? 'active' : 'inactive').label}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indexed Items</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {searchQuery_tRPC.data?.indexedItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Items in search index
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Accuracy</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analyticsQuery.data?.searchAccuracy || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Search accuracy rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Speed</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analyticsQuery.data?.averageSpeed || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average search time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'search' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('search')}
          className="flex-1"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button
          variant={selectedTab === 'semantic' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('semantic')}
          className="flex-1"
        >
          <Brain className="w-4 h-4 mr-2" />
          Semantic
        </Button>
        <Button
          variant={selectedTab === 'analytics' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('analytics')}
          className="flex-1"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Analytics
        </Button>
        <Button
          variant={selectedTab === 'settings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('settings')}
          className="flex-1"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Search Tab */}
      {selectedTab === 'search' && (
        <div className="space-y-4">
          {/* Search Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Advanced Search
              </CardTitle>
              <CardDescription>
                Powerful search with filters og advanced options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for items, categories, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchQuery)
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleSearch(searchQuery)}
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    {isSearching ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Search Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Filters</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <Filter className="w-5 h-5" />
                      <span className="text-sm">Category</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <MapPin className="w-5 h-5" />
                      <span className="text-sm">Location</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <Tag className="w-5 h-5" />
                      <span className="text-sm">Tags</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm">Date</span>
                    </Button>
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search Results ({searchResults.length})</label>
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{result.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {result.description}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm font-medium">{result.relevance}%</div>
                              <div className="text-xs text-muted-foreground">
                                {getRelevanceScore(result.relevance).level}
                              </div>
                            </div>
                            
                            <Badge variant={result.type === 'item' ? 'default' : 'secondary'}>
                              {result.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Search Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchQuery_tRPC.data?.searchStatus?.map((status) => (
                  <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Search className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{status.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {status.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{status.status}</div>
                        <div className="text-xs text-muted-foreground">
                          {status.lastUpdate}
                        </div>
                      </div>
                      
                      <Badge variant={status.isActive ? 'default' : 'secondary'}>
                        {status.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Semantic Tab */}
      {selectedTab === 'semantic' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Semantic Search
              </CardTitle>
              <CardDescription>
                AI-powered semantic search with natural language understanding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Semantic Search Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask in natural language: 'Find all wool items in the living room'"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSemanticSearch(searchQuery)
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleSemanticSearch(searchQuery)}
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    {isSearching ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Semantic Features */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semantic Features</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-sm">AI Understanding</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <Zap className="w-5 h-5" />
                      <span className="text-sm">Smart Suggestions</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <Target className="w-5 h-5" />
                      <span className="text-sm">Context Aware</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <Brain className="w-5 h-5" />
                      <span className="text-sm">Learning</span>
                    </Button>
                  </div>
                </div>

                {/* Semantic Results */}
                {semanticQuery.data?.semanticResults?.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Brain className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{result.query}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.interpretation}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{result.confidence}%</div>
                        <div className="text-xs text-muted-foreground">
                          Confidence
                        </div>
                      </div>
                      
                      <Badge variant={result.confidence > 80 ? 'default' : 'secondary'}>
                        {result.confidence > 80 ? 'High' : 'Medium'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Semantic Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Semantic Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {semanticQuery.data?.capabilities?.map((capability) => (
                  <div key={capability.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <capability.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="font-medium">{capability.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {capability.accuracy}% accuracy
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Search Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsQuery.data?.metrics?.map((metric) => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className="text-sm font-medium">{metric.value}</span>
                      </div>
                      <Progress value={metric.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Search Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsQuery.data?.trends?.map((trend) => (
                    <div key={trend.id} className="flex items-start gap-2 p-3 border rounded-lg">
                      <trend.icon className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{trend.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {trend.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Search History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsQuery.data?.searchHistory?.map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Search className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{search.query}</div>
                        <div className="text-sm text-muted-foreground">
                          {search.results} results • {search.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{search.duration}ms</div>
                        <div className="text-xs text-muted-foreground">
                          Search time
                        </div>
                      </div>
                      
                      <Badge variant={search.type === 'semantic' ? 'default' : 'secondary'}>
                        {search.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === 'settings' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Search Settings
              </CardTitle>
              <CardDescription>
                Configure search preferences og optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.settings?.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <setting.icon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{setting.name}</span>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(enabled) => {
                        if (setting.key === 'searchEnabled') {
                          handleToggleSearch(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Search Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.preferences?.map((preference) => (
                  <div key={preference.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{preference.name}</span>
                      <span className="text-sm font-medium">{preference.value}</span>
                    </div>
                    <Progress value={preference.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Raske handlinger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Search className="w-5 h-5" />
              <span className="text-sm">Search</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Brain className="w-5 h-5" />
              <span className="text-sm">Semantic</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">Analytics</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
