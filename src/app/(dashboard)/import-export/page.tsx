'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload,
  Download,
  Package,
  MapPin,
  Grid3x3,
  FileSpreadsheet,
  FileText,
  FileJson,
  TrendingUp,
  Shield,
  Clock,
  UserCheck,
  Zap,
  Info,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Database
} from 'lucide-react'
import { ImportDialog } from '@/components/import-export/ImportDialog'
import { ExportDialog } from '@/components/import-export/ExportDialog'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

export default function ImportExportPage() {
  const { data: exportStats } = trpc.importExport.getExportStats.useQuery()
  const { data: exportTemplates } = trpc.importExport.getExportTemplates.useQuery()
  
  const generateTemplateMutation = trpc.importExport.generateImportTemplate.useMutation({
    onSuccess: (data) => {
      // Create download link
      const byteCharacters = atob(data.content)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: data.mimeType })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Mal lastet ned!')
    },
    onError: (error) => {
      toast.error(`Kunne ikke laste ned mal: ${error.message}`)
    }
  })

  const handleDownloadTemplate = (type: 'items' | 'locations' | 'categories', format: 'csv' | 'xlsx' = 'csv') => {
    generateTemplateMutation.mutate({ type, format })
  }

  const importTypes = [
    {
      type: 'items' as const,
      title: 'Gjenstander',
      description: 'Importer gjenstander med kategorier, lokasjoner og metadata',
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/20',
      examples: ['iPhone 15 Pro', 'DROPS garn rød', 'Kaffe hele bønner'],
      fields: ['navn', 'beskrivelse', 'kategori', 'lokasjon', 'antall', 'pris', 'kjøpsdato']
    },
    {
      type: 'locations' as const,
      title: 'Lokasjoner',
      description: 'Importer oppbevaringssteder og organiseringsstrukturer',
      icon: MapPin,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      examples: ['Soverom', 'Kjøkkenskap øverst', 'Garderobe hylle 2'],
      fields: ['navn', 'beskrivelse', 'type', 'forelder', 'kapasitet']
    },
    {
      type: 'categories' as const,
      title: 'Kategorier',
      description: 'Importer kategorier for bedre organisering av gjenstander',
      icon: Grid3x3,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50 dark:bg-violet-950/20',
      borderColor: 'border-violet-200 dark:border-violet-800',
      examples: ['Elektronikk', 'Garn og strikking', 'Kjøkkenutstyr'],
      fields: ['navn', 'beskrivelse', 'ikon', 'farge']
    }
  ]

  const exportFeatures = [
    {
      id: 'INVENTORY_FULL',
      title: 'Komplett Inventarliste',
      description: 'Alle gjenstander med full informasjon for oversikt og backup',
      icon: Package,
      color: 'text-primary'
    },
    {
      id: 'INSURANCE',
      title: 'Forsikringsrapport',
      description: 'Verdifulle gjenstander med serienummer og verdianslag',
      icon: Shield,
      color: 'text-emerald-600'
    },
    {
      id: 'EXPIRY_TRACKING',
      title: 'Utløpsdato Oversikt',
      description: 'Gjenstander som utløper eller trenger vedlikehold',
      icon: Clock,
      color: 'text-amber-600'
    },
    {
      id: 'LOCATION_SUMMARY',
      title: 'Lokasjonsoversikt',
      description: 'Oversikt over oppbevaringssteder og innhold',
      icon: MapPin,
      color: 'text-violet-600'
    },
    {
      id: 'LOAN_TRACKING',
      title: 'Utlånsrapport',
      description: 'Oversikt over utlånte gjenstander og returstatus',
      icon: UserCheck,
      color: 'text-rose-600'
    }
  ]

  const supportedFormats = [
    {
      format: 'CSV',
      icon: FileText,
      description: 'Kommaseparerte verdier, kompatibel med Excel og Google Sheets',
      pros: ['Universell støtte', 'Lett å redigere', 'Minimal filstørrelse'],
      use: 'Generell datautveksling'
    },
    {
      format: 'Excel (.xlsx)',
      icon: FileSpreadsheet,
      description: 'Excel arbeidsbok med formatering og kolonnebredder',
      pros: ['Rik formatering', 'Formler støttet', 'Profesjonell utseende'],
      use: 'Rapporter og presentasjoner'
    },
    {
      format: 'JSON',
      icon: FileJson,
      description: 'Strukturert data med metadata for systemintegrasjoner',
      pros: ['Fullt strukturert', 'Metadata inkludert', 'API-vennlig'],
      use: 'Backup og systemintegrasjon'
    }
  ]

  return (
    <div className="page container mx-auto px-4 py-8 max-w-6xl cq">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-4">
          <Database className="w-8 h-8 text-primary" />
          Import & Export
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Importer data fra andre systemer eller eksporter dine data som rapporter. 
          Støtter CSV, Excel og JSON formater for maksimal kompatibilitet.
        </p>
      </div>

      <Tabs defaultValue="import" className="space-y-6 cq">
        <TabsList className="grid w-full grid-cols-4" style={{ minHeight: 44 }}>
          <TabsTrigger value="import">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </TabsTrigger>
          <TabsTrigger value="formats">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Formater
          </TabsTrigger>
          <TabsTrigger value="help">
            <BookOpen className="w-4 h-4 mr-2" />
            Hjelp
          </TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="hidden data-[state=active]:block space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Importer Data
              </CardTitle>
              <CardDescription>
                Last opp CSV- eller Excel-filer for å importere data til systemet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="cq-grid items-grid gap-6" style={{"--card-min":"260px"} as any}>
                {importTypes.map((type) => (
                  <Card key={type.type} className={`${type.borderColor} ${type.bgColor}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <type.icon className={`w-8 h-8 ${type.color}`} />
                        <div>
                          <h3 className="font-semibold text-lg">{type.title}</h3>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Eksempler:</h4>
                          <div className="space-y-1">
                            {type.examples.map((example, index) => (
                              <div key={index} className="text-xs bg-white px-2 py-1 rounded border">
                                {example}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Påkrevde felter:</h4>
                          <div className="flex flex-wrap gap-1">
                            {type.fields.map((field, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDownloadTemplate(type.type, 'csv')}
                            disabled={generateTemplateMutation.isPending}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            CSV Mal
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDownloadTemplate(type.type, 'xlsx')}
                            disabled={generateTemplateMutation.isPending}
                          >
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Excel Mal
                          </Button>
                        </div>
                        
                        <ImportDialog
                          type={type.type}
                          trigger={
                            <Button className="w-full">
                              <Upload className="w-4 h-4 mr-2" />
                              Importer {type.title}
                            </Button>
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert className="mt-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tips:</strong> Klikk på "CSV Mal" eller "Excel Mal" for å laste ned en mal med riktig format og eksempeldata. 
                  Du kan også oppdatere eksisterende data ved å merke av for "Oppdater eksisterende" under import.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="hidden data-[state=active]:block space-y-6">
          {/* Quick Stats */}
          {exportStats && (
            <Card>
              <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Tilgjengelig Data
              </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary">{exportStats.totalItems}</div>
                    <div className="text-sm text-muted-foreground">Gjenstander</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emerald-600">{exportStats.totalLocations}</div>
                    <div className="text-sm text-muted-foreground">Lokasjoner</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-violet-600">{exportStats.totalCategories}</div>
                    <div className="text-sm text-muted-foreground">Kategorier</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-600">{exportStats.activeLoans}</div>
                    <div className="text-sm text-muted-foreground">Aktive utlån</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-rose-600">{exportStats.expiringItems}</div>
                    <div className="text-sm text-muted-foreground">Utløper snart</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Eksporter Data
              </CardTitle>
              <CardDescription>
                Generer rapporter og eksporter data i ulike formater
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="cq-grid items-grid gap-4 mb-6" style={{"--card-min":"320px"} as any}>
                {exportFeatures.map((feature) => (
                  <Card key={feature.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <feature.icon className={`w-6 h-6 ${feature.color} mt-1`} />
                        <div className="flex-1">
                          <h4 className="font-semibold">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <ExportDialog
                  trigger={
                    <Button size="lg" className="px-8">
                      <Download className="w-5 h-5 mr-2" />
                      Start Export
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Formats Tab */}
        <TabsContent value="formats" className="hidden data-[state=active]:block space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Støttede Filformater</CardTitle>
              <CardDescription>
                Oversikt over tilgjengelige formater for import og export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="cq-grid items-grid gap-6" style={{"--card-min":"260px"} as any}>
                {supportedFormats.map((format) => (
                  <Card key={format.format} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <format.icon className="w-8 h-8 text-blue-600" />
                        <h3 className="font-semibold text-lg">{format.format}</h3>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{format.description}</p>

                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Fordeler:</h4>
                          <ul className="space-y-1">
                            {format.pros.map((pro, index) => (
                              <li key={index} className="text-xs flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-1">Best for:</h4>
                          <p className="text-xs text-gray-600">{format.use}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Help Tab */}
        <TabsContent value="help" className="hidden data-[state=active]:block space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Import Help */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Import Hjelp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Forberedelse:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Last ned en mal for riktig format</li>
                    <li>• Fyll ut alle påkrevde kolonner</li>
                    <li>• Sjekk at datoer er i riktig format (YYYY-MM-DD)</li>
                    <li>• Kontroller at numeriske verdier er korrekte</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Vanlige feil:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Manglende påkrevde felter</li>
                    <li>• Feil datoformat</li>
                    <li>• Ugyldige tegn i navn</li>
                    <li>• Duplikate oppføringer</li>
                  </ul>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Bruk "tørrkjøring" for å teste importen før du utfører den faktiske importen.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Export Help */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-600" />
                  Export Hjelp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Tilpasning:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Bruk filtre for å begrense data</li>
                    <li>• Velg riktig mal for ditt formål</li>
                    <li>• CSV for regnearksbruk</li>
                    <li>• Excel for rapporter</li>
                    <li>• JSON for backup/integrasjon</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Automatisering:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Sett opp periodiske eksporter</li>
                    <li>• Bruk filtre for konsistente rapporter</li>
                    <li>• Kombiner med kalender for påminnelser</li>
                  </ul>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Store eksporter kan ta litt tid. Du får beskjed når filen er klar for nedlasting.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Avanserte Funksjoner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Batch Import</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Importer flere typer data samtidig ved å bruke separate filer for hver datatype.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>1. Importer kategorier først</li>
                    <li>2. Deretter lokasjoner</li>
                    <li>3. Til slutt gjenstander</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Scheduled Exports</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Kom snart: Automatiske eksporter på fastsatte tidspunkter.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Ukentlige inventarrapporter</li>
                    <li>• Månedlige forsikringsoppdateringer</li>
                    <li>• Automatisk backup</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

