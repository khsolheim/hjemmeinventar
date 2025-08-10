'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { 
  Download, 
  FileSpreadsheet,
  FileJson,
  FileText,
  Filter,
  Settings,
  Package,
  Shield,
  Clock,
  MapPin,
  UserCheck,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface ExportDialogProps {
  trigger?: React.ReactNode
}

export function ExportDialog({ trigger }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'xlsx' | 'json'>('csv')
  const [filters, setFilters] = useState({
    categoryId: '',
    locationId: '',
    dateRange: { start: undefined as Date | undefined, end: undefined as Date | undefined },
    minValue: '',
    maxValue: '',
    condition: '',
    priority: ''
  })

  // Get export templates
  const { data: templates } = trpc.importExport.getExportTemplates.useQuery()
  const { data: exportStats } = trpc.importExport.getExportStats.useQuery()
  const { data: categories } = trpc.categories.getAll.useQuery()
  const { data: locations } = trpc.locations.getAll.useQuery()

  // Export mutation
  const exportData = trpc.importExport.exportData.useMutation({
    onSuccess: (result) => {
      // Download file
      const link = document.createElement('a')
      link.href = `data:${result.mimeType};base64,${result.content}`
      link.download = result.filename
      link.click()
      
      toast.success('Export fullført!')
      setIsOpen(false)
    },
    onError: (error) => {
      toast.error('Export feilet: ' + error.message)
    }
  })

  const handleExport = () => {
    if (!selectedTemplate) {
      toast.error('Velg en exportmal')
      return
    }

    const exportFilters: any = {}
    
    if (filters.categoryId) exportFilters.categoryId = filters.categoryId
    if (filters.locationId) exportFilters.locationId = filters.locationId
    if (filters.dateRange.start || filters.dateRange.end) {
      exportFilters.dateRange = filters.dateRange
    }
    if (filters.minValue) exportFilters.minValue = Number(filters.minValue)
    if (filters.maxValue) exportFilters.maxValue = Number(filters.maxValue)
    if (filters.condition) exportFilters.condition = filters.condition
    if (filters.priority) exportFilters.priority = filters.priority

    exportData.mutate({
      template: selectedTemplate as any,
      format: selectedFormat,
      filters: exportFilters
    })
  }

  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'INVENTORY_FULL': return Package
      case 'INSURANCE': return Shield
      case 'EXPIRY_TRACKING': return Clock
      case 'LOCATION_SUMMARY': return MapPin
      case 'LOAN_TRACKING': return UserCheck
      default: return FileText
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return FileText
      case 'xlsx': return FileSpreadsheet
      case 'json': return FileJson
      default: return FileText
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Eksporter Data
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Eksporter Data
          </DialogTitle>
          <DialogDescription>
            Generer rapporter og eksporter data i ulike formater
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Mal</TabsTrigger>
            <TabsTrigger value="filters">Filtre</TabsTrigger>
            <TabsTrigger value="settings">Innstillinger</TabsTrigger>
          </TabsList>

          {/* Template Selection */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Velg Exportmal</CardTitle>
                <CardDescription>
                  Ferdigkonfigurerte maler for vanlige rapporter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates?.map((template) => {
                    const Icon = getTemplateIcon(template.id)
                    return (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedTemplate === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Icon className="w-6 h-6 text-blue-600 mt-1" />
                            <div className="flex-1">
                              <h4 className="font-medium">{template.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {template.description}
                              </p>
                              <Badge variant="outline" className="mt-2">
                                {template.fieldCount} felter
                              </Badge>
                            </div>
                            {selectedTemplate === template.id && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {exportStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tilgjengelig Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{exportStats.totalItems}</div>
                      <div className="text-sm text-gray-600">Gjenstander</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{exportStats.totalLocations}</div>
                      <div className="text-sm text-gray-600">Lokasjoner</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{exportStats.totalCategories}</div>
                      <div className="text-sm text-gray-600">Kategorier</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{exportStats.activeLoans}</div>
                      <div className="text-sm text-gray-600">Aktive utlån</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{exportStats.expiringItems}</div>
                      <div className="text-sm text-gray-600">Utløper snart</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Filters */}
          <TabsContent value="filters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtrer Data
                </CardTitle>
                <CardDescription>
                  Begrens eksporten til spesifikke data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Filter */}
                  <div>
                    <Label htmlFor="category-filter">Kategori</Label>
                    <Select value={filters.categoryId} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, categoryId: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Alle kategorier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Alle kategorier</SelectItem>
                        {categories?.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon && <span className="mr-2">{category.icon}</span>}
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <Label htmlFor="location-filter">Lokasjon</Label>
                    <Select value={filters.locationId} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, locationId: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Alle lokasjoner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Alle lokasjoner</SelectItem>
                        {locations?.map(location => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Value Range */}
                  <div>
                    <Label>Minimumsverdi (NOK)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minValue}
                      onChange={(e) => setFilters(prev => ({ ...prev, minValue: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Maksimumsverdi (NOK)</Label>
                    <Input
                      type="number"
                      placeholder="Ubegrenset"
                      value={filters.maxValue}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxValue: e.target.value }))}
                    />
                  </div>

                  {/* Condition Filter */}
                  <div>
                    <Label>Tilstand</Label>
                    <Select value={filters.condition} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, condition: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Alle tilstander" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Alle tilstander</SelectItem>
                        <SelectItem value="NEW">Ny</SelectItem>
                        <SelectItem value="USED">Brukt</SelectItem>
                        <SelectItem value="DAMAGED">Skadet</SelectItem>
                        <SelectItem value="REPAIR">Til reparasjon</SelectItem>
                        <SelectItem value="DISPOSED">Kastet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <Label>Prioritet</Label>
                    <Select value={filters.priority} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, priority: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Alle prioriteter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Alle prioriteter</SelectItem>
                        <SelectItem value="LOW">Lav</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">Høy</SelectItem>
                        <SelectItem value="CRITICAL">Kritisk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Datoperiode (opprettelsesdato)</Label>
                  <div className="flex gap-2 items-center">
                    <DatePicker
                      value={filters.dateRange.start}
                      onChange={(date) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, start: date } 
                      }))}
                      placeholder="Fra dato"
                    />
                    <span>til</span>
                    <DatePicker
                      value={filters.dateRange.end}
                      onChange={(date) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, end: date } 
                      }))}
                      placeholder="Til dato"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      categoryId: '',
                      locationId: '',
                      dateRange: { start: undefined, end: undefined },
                      minValue: '',
                      maxValue: '',
                      condition: '',
                      priority: ''
                    })}
                  >
                    Fjern alle filtre
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Eksportinnstillinger
                </CardTitle>
                <CardDescription>
                  Velg format og andre innstillinger
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Format Selection */}
                <div>
                  <Label className="text-base font-medium">Filformat</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {(['csv', 'xlsx', 'json'] as const).map((format) => {
                      const Icon = getFormatIcon(format)
                      return (
                        <Card
                          key={format}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedFormat === format ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedFormat(format)}
                        >
                          <CardContent className="p-4 text-center">
                            <Icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <div className="font-medium">{format.toUpperCase()}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {format === 'csv' && 'Kommaseparerte verdier'}
                              {format === 'xlsx' && 'Excel arbeidsbok'}
                              {format === 'json' && 'JavaScript Object Notation'}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Format-specific options */}
                {selectedFormat === 'csv' && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">CSV-innstillinger</h4>
                    <p className="text-sm text-gray-600">
                      CSV-filen bruker komma som separator og UTF-8 encoding.
                      Passende for Excel og andre regneark.
                    </p>
                  </div>
                )}

                {selectedFormat === 'xlsx' && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Excel-innstillinger</h4>
                    <p className="text-sm text-gray-600">
                      Excel-fil med formatering og kolonnebredder optimalisert for visning.
                      Kan åpnes direkte i Microsoft Excel eller lignende.
                    </p>
                  </div>
                )}

                {selectedFormat === 'json' && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">JSON-innstillinger</h4>
                    <p className="text-sm text-gray-600">
                      Strukturert data i JSON-format med metadata.
                      Ideell for systemintegrasjoner og backup.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sammendrag</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Mal:</span>
                    <span className="font-medium">
                      {selectedTemplate ? templates?.find(t => t.id === selectedTemplate)?.title : 'Ikke valgt'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span className="font-medium">{selectedFormat.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filtre:</span>
                    <span className="font-medium">
                      {Object.values(filters).some(v => v && (typeof v === 'string' ? v : v.start || v.end)) 
                        ? 'Aktive' : 'Ingen'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Avbryt
          </Button>
          <Button
            onClick={handleExport}
            disabled={!selectedTemplate || exportData.isPending}
          >
            {exportData.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Eksporter Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

