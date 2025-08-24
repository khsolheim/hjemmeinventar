'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Wand2, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { LabelSizeSelector } from '@/components/printing/LabelSizeSelector'

export default function NewTemplatePage() {
  const router = useRouter()
  const { data: labelSizes } = trpc.labelSizes.getAll.useQuery()
  
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    type: 'QR' as 'QR' | 'BARCODE' | 'CUSTOM',
    size: '',
    category: ''
  })

  const templateTypes = [
    { value: 'QR', label: 'QR-kode etikett', icon: '📱' },
    { value: 'BARCODE', label: 'Strekkode etikett', icon: '🏷️' },
    { value: 'CUSTOM', label: 'Tilpasset design', icon: '🎨' }
  ]

  // Get default size for quick templates
  const defaultSize = labelSizes?.find(s => s.isDefault) || labelSizes?.[0]
  
  const quickTemplates = [
    { 
      name: 'Standard HMS Etikett', 
      type: 'QR', 
      size: defaultSize?.id || 'STANDARD',
      description: 'QR-kode med gjenstandsnavn og lokasjon'
    },
    { 
      name: 'Kompakt Etikett', 
      type: 'QR', 
      size: labelSizes?.find(s => s.name === 'Liten')?.id || 'SMALL',
      description: 'Minimal QR-kode for små gjenstander'
    },
    { 
      name: 'Detaljert Etikett', 
      type: 'CUSTOM', 
      size: labelSizes?.find(s => s.name === 'Stor')?.id || 'LARGE',
      description: 'QR + tekst + logo for viktige gjenstander'
    }
  ]



  const handleCreateFromScratch = () => {
    const params = new URLSearchParams({
      name: template.name,
      type: template.type,
      size: template.size,
      mode: 'new'
    })
    router.push(`/printing/editor?${params.toString()}`)
  }

  const handleUseQuickTemplate = (quickTemplate: typeof quickTemplates[0]) => {
    const params = new URLSearchParams({
      name: quickTemplate.name,
      type: quickTemplate.type,
      size: quickTemplate.size,
      mode: 'quick',
      template: quickTemplate.name.toLowerCase().replace(/\s+/g, '_')
    })
    router.push(`/printing/editor?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Header med tilbake-knapp */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/printing/templates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til maler
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Opprett ny etikettmal</h1>
          <p className="text-muted-foreground">
            Velg en hurtigmal eller lag fra bunnen av
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Hurtigmaler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Hurtigmaler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Kom raskt i gang med forhåndsdefinerte maler
            </p>
            
            {quickTemplates.map((quickTemplate, index) => (
              <Card key={index} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{quickTemplate.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {quickTemplate.description}
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {quickTemplate.type}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {quickTemplate.size}
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleUseQuickTemplate(quickTemplate)}
                  >
                    Bruk mal
                  </Button>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Tilpasset mal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tilpasset mal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Lag din egen mal fra bunnen av
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Navn på mal</Label>
                <Input 
                  id="name"
                  value={template.name}
                  onChange={(e) => setTemplate({...template, name: e.target.value})}
                  placeholder="F.eks. Mine bokmerker"
                />
              </div>

              <div>
                <Label htmlFor="description">Beskrivelse (valgfritt)</Label>
                <Textarea 
                  id="description"
                  value={template.description}
                  onChange={(e) => setTemplate({...template, description: e.target.value})}
                  placeholder="Hva skal denne malen brukes til?"
                  rows={2}
                />
              </div>

              <div>
                <Label>Type</Label>
                <Select 
                  value={template.type} 
                  onValueChange={(value: any) => setTemplate({...template, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg type" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Størrelse</Label>
                <LabelSizeSelector
                  value={template.size}
                  onValueChange={(value) => setTemplate(prev => ({ ...prev, size: value }))}
                  placeholder="Velg størrelse"
                />
              </div>

              <div>
                <Label htmlFor="category">Kategori (valgfritt)</Label>
                <Input 
                  id="category"
                  value={template.category}
                  onChange={(e) => setTemplate({...template, category: e.target.value})}
                  placeholder="F.eks. Hjemme, Kontor, Hobbyrom"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateFromScratch}
                  disabled={!template.name.trim()}
                  className="flex-1"
                >
                  Opprett mal
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              💡
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Tips for gode etiketter</h4>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• Bruk korte, beskrivende navn</li>
                <li>• QR-koder fungerer best for rask skanning</li>
                <li>• Standard størrelse passer til de fleste gjenstander</li>
                <li>• Test utskrift før du lager mange etiketter</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
