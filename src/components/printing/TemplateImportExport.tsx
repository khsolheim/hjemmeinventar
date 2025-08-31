'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  X
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface TemplateImportExportProps {
  selectedTemplateIds?: string[]
}

export function TemplateImportExport({ selectedTemplateIds = [] }: TemplateImportExportProps) {
  const [includeSystemDefaults, setIncludeSystemDefaults] = useState(false)
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResults, setImportResults] = useState<{
    imported: number
    skipped: number
    errors: string[]
  } | null>(null)

  // Export query
  const exportQuery = trpc.labelTemplates.exportTemplates.useQuery(
    {
      templateIds: selectedTemplateIds.length > 0 ? selectedTemplateIds : undefined,
      includeSystemDefaults
    },
    { enabled: false }
  )

  // Import mutation
  const importMutation = trpc.labelTemplates.importTemplates.useMutation({
    onSuccess: (results) => {
      setImportResults(results)
      if (results.imported > 0) {
        toast.success(`${results.imported} maler importert`)
      }
      if (results.skipped > 0) {
        toast.info(`${results.skipped} maler hoppet over`)
      }
      if (results.errors.length > 0) {
        toast.error(`${results.errors.length} feil oppstod`)
      }
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleExport = async () => {
    try {
      const data = await exportQuery.refetch()
      if (data.data) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `etikettmaler-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Maler eksportert')
      }
    } catch (error) {
      toast.error('Feil ved eksport')
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Velg en fil å importere')
      return
    }

    try {
      const text = await importFile.text()
      const data = JSON.parse(text)
      
      if (!data.templates || !Array.isArray(data.templates)) {
        toast.error('Ugyldig filformat')
        return
      }

      await importMutation.mutateAsync({
        templates: data.templates,
        overwriteExisting
      })
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('Ugyldig JSON-fil')
      } else {
        toast.error('Feil ved import')
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        toast.error('Kun JSON-filer er støttet')
        return
      }
      setImportFile(file)
      setImportResults(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Eksporter maler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeSystemDefaults"
                checked={includeSystemDefaults}
                onCheckedChange={(checked) => setIncludeSystemDefaults(checked as boolean)}
              />
              <Label htmlFor="includeSystemDefaults" className="text-sm">
                Inkluder systemmaler
              </Label>
            </div>
            
            {selectedTemplateIds.length > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">Valgte maler:</div>
                <div className="text-sm text-muted-foreground">
                  {selectedTemplateIds.length} mal(er) valgt
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={handleExport}
            disabled={exportQuery.isFetching}
            className="w-full"
          >
            {exportQuery.isFetching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Eksporter som JSON
          </Button>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importer maler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="importFile">Velg JSON-fil</Label>
              <Input
                id="importFile"
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>

            {importFile && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{importFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setImportFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="overwriteExisting"
                checked={overwriteExisting}
                onCheckedChange={(checked) => setOverwriteExisting(checked as boolean)}
              />
              <Label htmlFor="overwriteExisting" className="text-sm">
                Overskriv eksisterende maler
              </Label>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                disabled={!importFile || importMutation.isPending}
                className="w-full"
              >
                {importMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Importer maler
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bekreft import</AlertDialogTitle>
                <AlertDialogDescription>
                  Er du sikker på at du vil importere maler fra "{importFile?.name}"?
                  {overwriteExisting && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Eksisterende maler vil bli overskrevet.
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction onClick={handleImport}>
                  Importer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Import Results */}
          {importResults && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Importresultat:</div>
              <div className="space-y-1">
                {importResults.imported > 0 && (
                  <Badge variant="default" className="mr-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {importResults.imported} importert
                  </Badge>
                )}
                {importResults.skipped > 0 && (
                  <Badge variant="secondary" className="mr-2">
                    {importResults.skipped} hoppet over
                  </Badge>
                )}
                {importResults.errors.length > 0 && (
                  <Badge variant="destructive" className="mr-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {importResults.errors.length} feil
                  </Badge>
                )}
              </div>
              
              {importResults.errors.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-sm font-medium text-red-800 mb-2">Feil:</div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
