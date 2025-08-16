'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'
import { Input } from '../../../../components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../../components/ui/select'
import { 
  QrCode, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Copy, 
  Trash2,
  Download,
  Share
} from 'lucide-react'
import { trpc } from '../../../../lib/trpc/client'
import Link from 'next/link'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu'

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSize, setFilterSize] = useState<string>('all')
  const [showSystemTemplates, setShowSystemTemplates] = useState(true)

  // Build filters for the query
  const filters = {
    search: searchQuery || undefined,
    type: filterType !== 'all' ? [filterType as any] : undefined,
    size: filterSize !== 'all' ? [filterSize as any] : undefined,
    isSystemDefault: showSystemTemplates ? undefined : false
  }

  const { data: templates, isLoading, refetch } = trpc.printing.listTemplates.useQuery(filters)

  const deleteTemplateMutation = trpc.printing.deleteTemplate.useMutation({
    onSuccess: () => {
      refetch()
    }
  })

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Er du sikker på at du vil slette denne malen?')) {
      await deleteTemplateMutation.mutateAsync({ id: templateId })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'QR': return 'bg-blue-100 text-blue-800'
      case 'BARCODE': return 'bg-green-100 text-green-800'
      case 'CUSTOM': return 'bg-purple-100 text-purple-800'
      case 'DYNAMIC': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'SMALL': return 'bg-yellow-100 text-yellow-800'
      case 'STANDARD': return 'bg-blue-100 text-blue-800'
      case 'LARGE': return 'bg-red-100 text-red-800'
      case 'CUSTOM': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Etikettmaler</h1>
          <p className="text-muted-foreground">
            Administrer og opprett etikettmaler for utskrift
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/printing/templates/new">
              <Plus className="h-4 w-4 mr-2" />
              Ny mal
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/printing/templates/marketplace">
              <Download className="h-4 w-4 mr-2" />
              Marketplace
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtrer maler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Søk maler..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle typer</SelectItem>
                <SelectItem value="QR">QR-kode</SelectItem>
                <SelectItem value="BARCODE">Strekkode</SelectItem>
                <SelectItem value="CUSTOM">Tilpasset</SelectItem>
                <SelectItem value="DYNAMIC">Dynamisk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSize} onValueChange={setFilterSize}>
              <SelectTrigger>
                <SelectValue placeholder="Størrelse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle størrelser</SelectItem>
                <SelectItem value="SMALL">Liten</SelectItem>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="LARGE">Stor</SelectItem>
                <SelectItem value="CUSTOM">Tilpasset</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="system-templates"
                checked={showSystemTemplates}
                onChange={(e) => setShowSystemTemplates(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="system-templates" className="text-sm">
                Vis systemmaler
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))
        ) : templates && templates.length > 0 ? (
          templates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description || 'Ingen beskrivelse tilgjengelig'}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/printing/templates/${template.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Vis detaljer
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/printing/templates/${template.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Rediger
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/printing/templates/${template.id}/duplicate`}>
                          <Copy className="h-4 w-4 mr-2" />
                          Dupliser
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Share className="h-4 w-4 mr-2" />
                        Del mal
                      </DropdownMenuItem>
                      {!template.isSystemDefault && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Slett
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getTypeColor(template.type)}>
                    {template.type}
                  </Badge>
                  <Badge className={getSizeColor(template.size)}>
                    {template.size}
                  </Badge>
                  {template.isSystemDefault && (
                    <Badge variant="outline">
                      System
                    </Badge>
                  )}
                  {template.complexity && (
                    <Badge variant="secondary">
                      {template.complexity}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      {template.usageCount} ganger brukt
                    </span>
                    {template.lastUsedAt && (
                      <span>
                        Sist: {new Date(template.lastUsedAt).toLocaleDateString('nb-NO')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs">
                    v{template.version}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/printing/wizard?template=${template.id}`}>
                      <QrCode className="h-3 w-3 mr-1" />
                      Bruk mal
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/printing/templates/${template.id}`}>
                      <Eye className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Ingen maler funnet</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 
                'Prøv å endre søkekriteriene eller opprett en ny mal.' :
                'Kom i gang ved å opprette din første mal.'
              }
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link href="/printing/templates/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Opprett mal
                </Link>
              </Button>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Nullstill søk
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {templates && templates.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Viser {templates.length} maler</span>
              <div className="flex gap-4">
                <span>QR: {templates.filter(t => t.type === 'QR').length}</span>
                <span>Strekkode: {templates.filter(t => t.type === 'BARCODE').length}</span>
                <span>Tilpasset: {templates.filter(t => t.type === 'CUSTOM').length}</span>
                <span>System: {templates.filter(t => t.isSystemDefault).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}