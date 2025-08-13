'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  FileText, 
  Search, 
  Filter,
  Eye,
  Download,
  Upload,
  Plus,
  Grid3x3,
  Loader2
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamisk import for å unngå SSR problemer
const PDFViewer = dynamic(
  () => import('@/components/pdf/PDFViewer').then(mod => ({ default: mod.PDFViewer })),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }
)

const YarnPatternViewer = dynamic(
  () => import('@/components/pdf/PDFViewer').then(mod => ({ default: mod.YarnPatternViewer })),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }
)
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

// Mock data for demonstration
const mockPatterns = [
  {
    id: '1',
    name: 'Enkelt sjal mønster',
    description: 'Et vakkert og enkelt sjal som passer for begynnere',
    pdfUrl: '/examples/pattern1.pdf',
    difficulty: 'Lett',
    yarnWeight: 'DK',
    needleSize: '4.5mm',
    category: 'Sjal',
    tags: ['begynner', 'sjal', 'strikking'],
    itemId: 'item1',
    itemName: 'Alpakka garn - blå',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Avansert genser mønster',
    description: 'Tradisjonell norsk genser med komplekse mønstre',
    pdfUrl: '/examples/pattern2.pdf',
    difficulty: 'Avansert',
    yarnWeight: 'Sport',
    needleSize: '3.5mm',
    category: 'Genser',
    tags: ['avansert', 'genser', 'norsk', 'tradisjonell'],
    itemId: 'item2',
    itemName: 'Ullgarn - naturhvit',
    createdAt: new Date('2024-02-10')
  },
  {
    id: '3',
    name: 'Heklet teppe mønster',
    description: 'Fargerikt teppe i granny square teknikk',
    pdfUrl: '/examples/pattern3.pdf',
    difficulty: 'Middels',
    yarnWeight: 'Worsted',
    needleSize: '5.0mm',
    category: 'Teppe',
    tags: ['middels', 'teppe', 'hekling', 'granny square'],
    itemId: 'item3',
    itemName: 'Bomullsgarn mix',
    createdAt: new Date('2024-03-05')
  }
]

export default function PatternsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedPattern, setSelectedPattern] = useState<any>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // In a real app, these would come from tRPC
  const patterns = mockPatterns
  const isLoading = false

  // Filter patterns
  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pattern.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || pattern.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || pattern.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const handleViewPattern = (pattern: any) => {
    setSelectedPattern(pattern)
    setIsViewerOpen(true)
  }

  const handleDownloadPattern = (pattern: any) => {
    // In a real app, this would download the actual PDF
    toast.success(`Laster ned ${pattern.name}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'lett':
        return 'bg-green-100 text-green-800'
      case 'middels':
        return 'bg-yellow-100 text-yellow-800'
      case 'avansert':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isClient || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="ml-2 text-muted-foreground">Laster mønster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page container mx-auto px-4 py-8 cq">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 cq">
        <div>
          <h1 className="text-3xl font-bold title">Mønster og oppskrifter</h1>
          <p className="text-muted-foreground secondary-text">
            Se og administrer PDF-oppskrifter for garn og håndverk
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Last opp mønster
        </Button>
      </div>

      {/* Stats */}
      <div className="cq-grid dashboard-grid gap-6 mb-8" style={{"--card-min":"220px"} as any}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale mønstre</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patterns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategorier</CardTitle>
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(patterns.map(p => p.category)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lett nivå</CardTitle>
            <Badge className="h-4 w-4 bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patterns.filter(p => p.difficulty === 'Lett').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avansert nivå</CardTitle>
            <Badge className="h-4 w-4 bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patterns.filter(p => p.difficulty === 'Avansert').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 cq">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Søk i mønstre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle kategorier</SelectItem>
            <SelectItem value="Sjal">Sjal</SelectItem>
            <SelectItem value="Genser">Genser</SelectItem>
            <SelectItem value="Teppe">Teppe</SelectItem>
            <SelectItem value="Lue">Lue</SelectItem>
            <SelectItem value="Sokker">Sokker</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Vanskelighet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle nivåer</SelectItem>
            <SelectItem value="Lett">Lett</SelectItem>
            <SelectItem value="Middels">Middels</SelectItem>
            <SelectItem value="Avansert">Avansert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Patterns Grid */}
      <div className="cq-grid items-grid gap-6" style={{"--card-min":"280px"} as any}>
        {filteredPatterns.map((pattern) => (
          <Card key={pattern.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{pattern.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {pattern.description}
                  </CardDescription>
                </div>
                <Badge className={getDifficultyColor(pattern.difficulty)}>
                  {pattern.difficulty}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Pattern Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Kategori:</span>
                  <Badge variant="outline">{pattern.category}</Badge>
                </div>
                
                {pattern.yarnWeight && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Garntyngde:</span>
                    <span>{pattern.yarnWeight}</span>
                  </div>
                )}
                
                {pattern.needleSize && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pinner:</span>
                    <span>{pattern.needleSize}</span>
                  </div>
                )}
                
                {pattern.itemName && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tilknyttet garn:</span>
                    <span className="text-blue-600 font-medium">{pattern.itemName}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {pattern.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {pattern.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => handleViewPattern(pattern)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Se mønster
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadPattern(pattern)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredPatterns.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">
                Ingen mønstre funnet
              </p>
              <p className="text-gray-500 mb-4">
                Prøv å endre søkekriteriene dine
              </p>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Last opp ditt første mønster
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Mønster visning</DialogTitle>
          </DialogHeader>
          
          {selectedPattern && (
            <div className="flex-1 overflow-hidden">
              <YarnPatternViewer
                patternUrl={selectedPattern.pdfUrl}
                patternName={selectedPattern.name}
                difficulty={selectedPattern.difficulty}
                yarnWeight={selectedPattern.yarnWeight}
                needleSize={selectedPattern.needleSize}
                height={600}
                className="h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
