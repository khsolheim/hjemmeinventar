'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, FileText, Table, Shield, Loader2 } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'



interface TRPCError {
  message: string
}

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const [exportType, setExportType] = useState<'inventory' | 'insurance' | 'analytics'>('inventory')
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv')
  const [includeImages, setIncludeImages] = useState(false)
  const [includePrivateData, setIncludePrivateData] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const exportData = trpc.importExport.exportData.useMutation({
    onSuccess: (data: { content: string; filename: string; mimeType: string; }) => {
      generateAndDownloadFile(data)
      setIsGenerating(false)
      toast.success('Eksport fullført')
      onClose()
    },
    onError: (error: TRPCError) => {
      toast.error(`Eksport feilet: ${error.message}`)
      setIsGenerating(false)
    }
  })

  const generateAndDownloadFile = (data: { content: string; filename: string; mimeType: string; }) => {
    // Create and download file
    const blob = new Blob([data.content], { type: data.mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = data.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }






  const handleExport = () => {
    setIsGenerating(true)
    exportData.mutate({
      template: 'INVENTORY_FULL',
      format: 'json' // Always request JSON from backend
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Eksporter data
          </DialogTitle>
          <DialogDescription>
            Generer rapporter og eksporter inventardata
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Rapport type</Label>
            <Select value={exportType} onValueChange={(value: typeof exportType) => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inventory">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Inventar oversikt
                  </div>
                </SelectItem>
                <SelectItem value="insurance">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Forsikringsrapport
                  </div>
                </SelectItem>
                <SelectItem value="analytics">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Analytics rapport
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(value: typeof format) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Kommaseparert)</SelectItem>
                <SelectItem value="excel">Excel format</SelectItem>
                <SelectItem value="pdf">PDF rapport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeImages" 
                checked={includeImages}
                onCheckedChange={(checked) => setIncludeImages(!!checked)}
              />
              <Label htmlFor="includeImages">Inkluder bilde-URLer</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includePrivateData" 
                checked={includePrivateData}
                onCheckedChange={(checked) => setIncludePrivateData(!!checked)}
              />
              <Label htmlFor="includePrivateData">Inkluder alle detaljer</Label>
            </div>
          </div>

          {exportType === 'insurance' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">🛡️ Forsikringsrapport</h4>
              <p className="text-sm text-blue-700">
                Denne rapporten inneholder fullstendig dokumentasjon for forsikringsformål, 
                inkludert verdiestimat og kategorisering av gjenstander.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button onClick={handleExport} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Genererer...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Eksporter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
