'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Copy, 
  Edit, 
  Trash2, 
  QrCode, 
  BarChart3, 
  FileText,
  Clock,
  User
} from 'lucide-react'

// Mock data for demo templates
const mockTemplates = [
  {
    id: '1',
    name: 'Standard HMS Etikett',
    description: 'QR-kode med gjenstandsnavn og lokasjon',
    type: 'QR' as const,
    size: 'STANDARD' as const,
    category: 'Standard',
    thumbnail: null,
    usageCount: 45,
    lastUsed: new Date('2024-01-15'),
    createdBy: 'Deg',
    isSystemDefault: true
  },
  {
    id: '2',
    name: 'Kompakt Etikett',
    description: 'Minimal QR-kode for små gjenstander',
    type: 'QR' as const,
    size: 'SMALL' as const,
    category: 'Kompakt',
    thumbnail: null,
    usageCount: 23,
    lastUsed: new Date('2024-01-12'),
    createdBy: 'Deg',
    isSystemDefault: false
  },
  {
    id: '3',
    name: 'Detaljert Inventar',
    description: 'QR + tekst + logo for viktige gjenstander',
    type: 'CUSTOM' as const,
    size: 'LARGE' as const,
    category: 'Detaljert',
    thumbnail: null,
    usageCount: 12,
    lastUsed: new Date('2024-01-10'),
    createdBy: 'Deg',
    isSystemDefault: false
  },
  {
    id: '4',
    name: 'Strekkode Etikett',
    description: 'Tradisjonell strekkode med produktnummer',
    type: 'BARCODE' as const,
    size: 'STANDARD' as const,
    category: 'Strekkode',
    thumbnail: null,
    usageCount: 8,
    lastUsed: new Date('2024-01-08'),
    createdBy: 'Deg',
    isSystemDefault: false
  }
]

const typeIcons = {
  QR: QrCode,
  BARCODE: BarChart3,
  CUSTOM: FileText
}

const sizeLabels = {
  SMALL: '30x15mm',
  STANDARD: '54x25mm',
  LARGE: '89x36mm'
}

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSize, setFilterSize] = useState<string>('all')
  
  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || template.type === filterType
    const matchesSize = filterSize === 'all' || template.size === filterSize
    
    return matchesSearch && matchesType && matchesSize
  })

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'I dag'
    if (diffInDays === 1) return 'I går'
    if (diffInDays < 7) return `${diffInDays} dager siden`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} uker siden`
    return `${Math.floor(diffInDays / 30)} måneder siden`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Etikettmaler</h1>
          <p className="text-muted-foreground">
            Administrer og opprett maler for etikettutskrift
          </p>
        </div>
        <Link href="/printing/templates/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ny mal
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Søk etter maler..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle typer</SelectItem>
                <SelectItem value="QR">QR-kode</SelectItem>
                <SelectItem value="BARCODE">Strekkode</SelectItem>
                <SelectItem value="CUSTOM">Tilpasset</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSize} onValueChange={setFilterSize}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Størrelse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle størrelser</SelectItem>
                <SelectItem value="SMALL">Liten</SelectItem>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="LARGE">Stor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => {
          const IconComponent = typeIcons[template.type]
          
          return (
            <Card key={template.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      {template.isSystemDefault && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Standard
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Thumbnail/Preview */}
                <div className="aspect-[2/1] bg-muted rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <IconComponent className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-xs">Forhåndsvisning</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>

                {/* Metadata */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <IconComponent className="h-3 w-3" />
                      {template.type}
                    </span>
                    <span>{sizeLabels[template.size]}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(template.lastUsed)}
                    </span>
                    <span>{template.usageCount} utskrifter</span>
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    Opprettet av {template.createdBy}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/printing/editor?template=${template.id}&mode=edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rediger
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  {!template.isSystemDefault && (
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Ingen maler funnet</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterType !== 'all' || filterSize !== 'all' 
                ? 'Prøv å justere søkekriteriene eller filtrene.'
                : 'Kom i gang ved å opprette din første etikettmal.'
              }
            </p>
            {(!searchQuery && filterType === 'all' && filterSize === 'all') && (
              <Button asChild>
                <Link href="/printing/templates/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Opprett mal
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{mockTemplates.length}</div>
              <div className="text-sm text-muted-foreground">Totalt maler</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {mockTemplates.reduce((sum, t) => sum + t.usageCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Totalt utskrifter</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {mockTemplates.filter(t => t.type === 'QR').length}
              </div>
              <div className="text-sm text-muted-foreground">QR-maler</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {mockTemplates.filter(t => t.isSystemDefault).length}
              </div>
              <div className="text-sm text-muted-foreground">Standard maler</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}