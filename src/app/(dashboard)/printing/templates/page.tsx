'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  User,
  Loader2,
  Download,
  Upload
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { TemplateImportExport } from '@/components/printing/TemplateImportExport'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'



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
  const [duplicateName, setDuplicateName] = useState('')
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [showImportExport, setShowImportExport] = useState(false)
  
  // tRPC queries
  const { data: templates, isLoading, refetch } = trpc.labelTemplates.getAll.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutter
    cacheTime: 10 * 60 * 1000, // 10 minutter
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('❌ Error fetching templates:', error)
      toast.error('Kunne ikke laste etikettmaler')
    }
  })
  
  // tRPC mutations
  const deleteMutation = trpc.labelTemplates.delete.useMutation({
    onSuccess: () => {
      toast.success('Mal slettet')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
  
  const duplicateMutation = trpc.labelTemplates.duplicate.useMutation({
    onSuccess: () => {
      toast.success('Mal duplisert')
      refetch()
      setDuplicateName('')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
  
  // Ensure templates is always an array
  const safeTemplates = templates && Array.isArray(templates) ? templates : []
  
  const filteredTemplates = safeTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === 'all' || template.type === filterType
    const matchesSize = filterSize === 'all' || template.size === filterSize
    
    return matchesSearch && matchesType && matchesSize
  })
  
  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id })
  }
  
  const handleDuplicate = (id: string, originalName: string) => {
    const name = duplicateName || `${originalName} (kopi)`
    duplicateMutation.mutate({ id, name })
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'I dag'
    if (diffInDays === 1) return 'I går'
    if (diffInDays < 7) return `${diffInDays} dager siden`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} uker siden`
    return `${Math.floor(diffInDays / 30)} måneder siden`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Etikettmaler</h1>
            <p className="text-muted-foreground">
              Administrer og opprett maler for etikettutskrift
            </p>
          </div>
          <Button disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Laster...
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="aspect-[2/1] bg-muted rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowImportExport(!showImportExport)}
          >
            {showImportExport ? (
              <Upload className="h-4 w-4 mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Import/Eksport
          </Button>
          <Link href="/printing/templates/visual-editor">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Visuell Editor
            </Button>
          </Link>
          <Link href="/printing/templates/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Ny mal (XML)
            </Button>
          </Link>
        </div>
      </div>

      {/* Import/Export Section */}
      {showImportExport && (
        <TemplateImportExport selectedTemplateIds={selectedTemplates} />
      )}

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
                    <Checkbox
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTemplates([...selectedTemplates, template.id])
                        } else {
                          setSelectedTemplates(selectedTemplates.filter(id => id !== template.id))
                        }
                      }}
                    />
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
                <div className="aspect-[2/1] bg-white rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center p-2">
                  {template.type === 'QR' ? (
                    <div className="text-center space-y-1 scale-75">
                      <div className="w-8 h-8 bg-gray-800 mx-auto rounded grid grid-cols-3 gap-0.5 p-1">
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-gray-800"></div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-gray-800"></div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-gray-800"></div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-gray-800"></div>
                        <div className="bg-white rounded-sm"></div>
                      </div>
                      <div className="text-xs font-bold text-gray-800">Gjenstand</div>
                      <div className="text-xs text-gray-600">Lokasjon</div>
                    </div>
                  ) : template.type === 'BARCODE' ? (
                    <div className="text-center space-y-1 scale-75">
                      <div className="flex space-x-0.5 mb-1">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className={`w-0.5 bg-gray-800 ${i % 2 === 0 ? 'h-6' : 'h-4'}`}></div>
                        ))}
                      </div>
                      <div className="text-xs font-mono text-gray-800">123456789</div>
                      <div className="text-xs text-gray-600">Produkt</div>
                    </div>
                  ) : (
                    <div className="text-center space-y-1 scale-75">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 mx-auto rounded flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-xs font-bold text-gray-800">Tilpasset</div>
                      <div className="text-xs text-gray-600">Layout</div>
                    </div>
                  )}
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
                    <span>{sizeLabels[template.size] || template.size}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.lastUsedAt ? formatTimeAgo(new Date(template.lastUsedAt)) : 'Aldri brukt'}
                    </span>
                    <span>{template.usageCount} utskrifter</span>
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    Versjon {template.version}
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
                    <Link href={`/printing/templates/edit/${template.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rediger
                    </Link>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Dupliser mal</AlertDialogTitle>
                        <AlertDialogDescription>
                          Opprett en kopi av "{template.name}". Du kan gi den et nytt navn.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Input
                          placeholder={`${template.name} (kopi)`}
                          value={duplicateName}
                          onChange={(e) => setDuplicateName(e.target.value)}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDuplicate(template.id, template.name)}
                          disabled={duplicateMutation.isPending}
                        >
                          {duplicateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          Dupliser
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  {!template.isSystemDefault && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Slett mal</AlertDialogTitle>
                          <AlertDialogDescription>
                            Er du sikker på at du vil slette "{template.name}"? Denne handlingen kan ikke angres.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(template.id)}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Slett
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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


    </div>
  )
}