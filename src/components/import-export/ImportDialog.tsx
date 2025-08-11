'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Upload, 
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Package,
  MapPin,
  Grid3x3,
  Copy,
  Eye,
  X
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface ImportDialogProps {
  trigger?: React.ReactNode
  type: 'items' | 'locations' | 'categories'
  onImportComplete?: () => void
}

export function ImportDialog({ trigger, type, onImportComplete }: ImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState<'upload' | 'validate' | 'preview' | 'import' | 'complete'>('upload')
  const [importProgress, setImportProgress] = useState(0)
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: true,
    updateExisting: false,
    createMissingReferences: true,
    dryRun: false
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mutations
  const validateFile = trpc.importExport.validateImportFile.useMutation({
    onSuccess: (result) => {
      setValidationResult(result)
      setImportPreview(result.data.slice(0, 10)) // Show first 10 rows
      setCurrentStep('preview')
    },
    onError: (error) => {
      toast.error('Valideringsfeil: ' + error.message)
    }
  })

  const executeImport = trpc.importExport.executeImport.useMutation({
    onSuccess: (result) => {
      setCurrentStep('complete')
      toast.success(`Import fullført! ${result.created} opprettet, ${result.updated} oppdatert`)
      onImportComplete?.()
    },
    onError: (error) => {
      toast.error('Import feilet: ' + error.message)
    }
  })

  const generateTemplate = trpc.importExport.generateImportTemplate.useMutation({
    onSuccess: (result) => {
      // Download template
      const link = document.createElement('a')
      link.href = `data:${result.mimeType};base64,${result.content}`
      link.download = result.filename
      link.click()
      toast.success('Mal lastet ned!')
    }
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const validExtensions = ['.csv', '.xlsx', '.xls']
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      
      if (!validExtensions.includes(extension)) {
        toast.error('Kun CSV og Excel-filer (.csv, .xlsx, .xls) støttes')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Filen er for stor (maks 10MB)')
        return
      }

      setSelectedFile(file)
      setCurrentStep('validate')
    }
  }

  const handleValidation = async () => {
    if (!selectedFile) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64Content = btoa(e.target?.result as string)
      
      validateFile.mutate({
        type,
        fileContent: base64Content,
        fileName: selectedFile.name,
        options: { ...importOptions, dryRun: true }
      })
    }
    
    reader.readAsBinaryString(selectedFile)
  }

  const handleImport = () => {
    if (!validationResult?.data) return

    executeImport.mutate({
      type,
      data: validationResult.data,
      options: { ...importOptions }
    })
  }

  const downloadTemplate = (format: 'csv' | 'xlsx') => {
    generateTemplate.mutate({ type, format })
  }

  const resetDialog = () => {
    setSelectedFile(null)
    setValidationResult(null)
    setImportPreview([])
    setCurrentStep('upload')
    setImportProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getTypeInfo = () => {
    switch (type) {
      case 'items':
        return {
          title: 'Importer Gjenstander',
          description: 'Last opp en CSV- eller Excel-fil med gjenstander',
          icon: Package,
          color: 'text-blue-600'
        }
      case 'locations':
        return {
          title: 'Importer Lokasjoner',
          description: 'Last opp en CSV- eller Excel-fil med lokasjoner',
          icon: MapPin,
          color: 'text-green-600'
        }
      case 'categories':
        return {
          title: 'Importer Kategorier',
          description: 'Last opp en CSV- eller Excel-fil med kategorier',
          icon: Grid3x3,
          color: 'text-purple-600'
        }
    }
  }

  const typeInfo = getTypeInfo()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetDialog()
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importer {type}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <typeInfo.icon className={`w-5 h-5 ${typeInfo.color}`} />
            {typeInfo.title}
          </DialogTitle>
          <DialogDescription>
            {typeInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between text-sm">
            {['upload', 'validate', 'preview', 'import', 'complete'].map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${
                  currentStep === step ? 'text-blue-600' : 
                  ['upload', 'validate', 'preview', 'import', 'complete'].indexOf(currentStep) > index 
                    ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2 ${
                  currentStep === step ? 'border-blue-600 bg-blue-50' :
                  ['upload', 'validate', 'preview', 'import', 'complete'].indexOf(currentStep) > index
                    ? 'border-green-600 bg-green-50' : 'border-gray-300'
                }`}>
                  {['upload', 'validate', 'preview', 'import', 'complete'].indexOf(currentStep) > index ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="capitalize">
                  {step === 'upload' ? 'Last opp' :
                   step === 'validate' ? 'Valider' :
                   step === 'preview' ? 'Forhåndsvis' :
                   step === 'import' ? 'Importer' : 'Fullført'}
                </span>
              </div>
            ))}
          </div>

          <Tabs value={currentStep} className="w-full">
            {/* Upload Step */}
            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">1. Velg fil</CardTitle>
                  <CardDescription>
                    Last opp en CSV- eller Excel-fil med dine data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* File upload area */}
                    <div className="space-y-4">
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                          Klikk for å velge fil eller dra og slipp
                        </p>
                        <p className="text-xs text-gray-500">
                          CSV, XLSX eller XLS (maks 10MB)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>

                      {selectedFile && (
                        <Alert>
                          <FileSpreadsheet className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Valgt fil:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Download template */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Har du ikke en fil ennå?</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Last ned en mal for å komme i gang raskt
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadTemplate('csv')}
                          disabled={generateTemplate.isPending}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          CSV-mal
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadTemplate('xlsx')}
                          disabled={generateTemplate.isPending}
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-1" />
                          Excel-mal
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Import options */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Importinnstillinger</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="skipDuplicates"
                          checked={importOptions.skipDuplicates}
                          onCheckedChange={(checked) => 
                            setImportOptions(prev => ({ ...prev, skipDuplicates: !!checked }))
                          }
                        />
                        <label htmlFor="skipDuplicates" className="text-sm font-medium">
                          Hopp over duplikater
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="updateExisting"
                          checked={importOptions.updateExisting}
                          onCheckedChange={(checked) => 
                            setImportOptions(prev => ({ ...prev, updateExisting: !!checked }))
                          }
                        />
                        <label htmlFor="updateExisting" className="text-sm font-medium">
                          Oppdater eksisterende
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="createMissing"
                          checked={importOptions.createMissingReferences}
                          onCheckedChange={(checked) => 
                            setImportOptions(prev => ({ ...prev, createMissingReferences: !!checked }))
                          }
                        />
                        <label htmlFor="createMissing" className="text-sm font-medium">
                          Opprett manglende referanser (kategorier/lokasjoner)
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleValidation}
                      disabled={!selectedFile || validateFile.isPending}
                    >
                      {validateFile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Valider fil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Step */}
            <TabsContent value="preview" className="space-y-4">
              {validationResult && (
                <div className="space-y-4">
                  {/* Validation Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">2. Valideringsresultat</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{validationResult.summary.totalRows}</div>
                          <div className="text-sm text-gray-600">Totalt rader</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{validationResult.summary.validRows}</div>
                          <div className="text-sm text-gray-600">Gyldige</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{validationResult.summary.invalidRows}</div>
                          <div className="text-sm text-gray-600">Ugyldige</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{validationResult.summary.duplicates}</div>
                          <div className="text-sm text-gray-600">Duplikater</div>
                        </div>
                      </div>

                      {validationResult.errors.length > 0 && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Feil funnet:</strong>
                            <ul className="mt-2 space-y-1">
                              {validationResult.errors.slice(0, 5).map((error: any, index: number) => (
                                <li key={index} className="text-sm">
                                  Rad {error.row}: {error.message}
                                </li>
                              ))}
                              {validationResult.errors.length > 5 && (
                                <li className="text-sm">... og {validationResult.errors.length - 5} flere</li>
                              )}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* Data Preview */}
                  {importPreview.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          Forhåndsvisning
                        </CardTitle>
                        <CardDescription>
                          Viser de første {importPreview.length} radene
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                {Object.keys(importPreview[0] || {}).map(key => (
                                  <th key={key} className="text-left p-2 font-medium">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {importPreview.map((row, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                  {Object.values(row).map((value, cellIndex) => (
                                    <td key={cellIndex} className="p-2">
                                      {String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                      Tilbake
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={validationResult.summary.validRows === 0 || executeImport.isPending}
                    >
                      {executeImport.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Start Import ({validationResult.summary.validRows} rader)
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Complete Step */}
            <TabsContent value="complete" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                    <h3 className="text-lg font-semibold mb-2">Import Fullført!</h3>
                    <p className="text-gray-600 mb-4">
                      Dataene dine har blitt importert til systemet.
                    </p>
                    <Button onClick={() => setIsOpen(false)}>
                      Lukk
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

