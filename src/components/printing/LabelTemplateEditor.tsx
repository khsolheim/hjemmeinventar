'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  Code, 
  Settings, 
  QrCode,
  BarChart3,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { LabelType, LabelSizeType, TemplateComplexity } from '@prisma/client'

interface LabelTemplateEditorProps {
  mode: 'create' | 'edit'
  templateId?: string
  initialData?: any
}

const typeIcons = {
  QR: QrCode,
  BARCODE: BarChart3,
  CUSTOM: FileText,
  TEXT: FileText
}

const sizeLabels = {
  SMALL: '25x12mm',      // Mindre etikett
  STANDARD: '50x20mm',   // Mindre standard
  LARGE: '75x30mm',      // Mindre stor etikett
  CUSTOM: 'Tilpasset'
}

const defaultXmlTemplates = {
  QR: `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" />
  </DrawCommands>
  <ObjectInfo>
    <QRCodeObject>
      <Name>QR_CODE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>{{item.qrCode}}</Text>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText />
    </QRCodeObject>
    <TextObject>
      <Name>ITEM_NAME</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>{{item.name}}</String>
          <Attributes>
            <Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <TextObject>
      <Name>LOCATION_NAME</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>{{location.name}}</String>
          <Attributes>
            <Font Family="Arial" Size="10" Bold="False" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
  </ObjectInfo>
</DieCutLabel>`,
  BARCODE: `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" />
  </DrawCommands>
  <ObjectInfo>
    <BarcodeObject>
      <Name>BARCODE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>{{item.barcode}}</Text>
      <Type>Code128Auto</Type>
      <Size>Medium</Size>
      <TextPosition>Bottom</TextPosition>
      <TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
      <CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
      <TextColor Alpha="255" Red="0" Green="0" Blue="0" />
      <CheckSumColor Alpha="255" Red="0" Green="0" Blue="0" />
    </BarcodeObject>
  </ObjectInfo>
</DieCutLabel>`,
  TEXT: `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" />
  </DrawCommands>
  <ObjectInfo>
    <TextObject>
      <Name>MAIN_TEXT</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>{{item.name}}</String>
          <Attributes>
            <Font Family="Arial" Size="14" Bold="True" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
  </ObjectInfo>
</DieCutLabel>`
}

export function LabelTemplateEditor({ mode, templateId, initialData }: LabelTemplateEditorProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')
  
  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: (initialData?.type as LabelType) || 'QR' as LabelType,
    size: (initialData?.size as LabelSizeType) || 'STANDARD' as LabelSizeType,
    category: initialData?.category || '',
    xml: initialData?.xml || '',
    fieldMapping: initialData?.fieldMapping || '',
    complexity: (initialData?.complexity as TemplateComplexity) || 'SIMPLE' as TemplateComplexity,
    estimatedRenderTime: initialData?.estimatedRenderTime || 100
  })

  // Set default XML when type changes
  useEffect(() => {
    if (mode === 'create' && !formData.xml) {
      setFormData(prev => ({
        ...prev,
        xml: defaultXmlTemplates[formData.type] || defaultXmlTemplates.QR
      }))
    }
  }, [formData.type, mode])

  // tRPC mutations
  const createMutation = trpc.labelTemplates.create.useMutation({
    onSuccess: () => {
      toast.success('Mal opprettet')
      router.push('/printing/templates')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const updateMutation = trpc.labelTemplates.update.useMutation({
    onSuccess: () => {
      toast.success('Mal oppdatert')
      router.push('/printing/templates')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Navn er påkrevd')
      return
    }
    
    if (!formData.xml.trim()) {
      toast.error('XML-mal er påkrevd')
      return
    }

    if (mode === 'create') {
      if (formData.createBothOrientations) {
        // Lag begge orienteringer når checkbox er aktivert
        const { createBothOrientations, ...templateData } = formData
        const horizontalTemplate = {
          ...templateData,
          name: `${formData.name} (Horisontal)`,
          orientation: 'landscape',
          width: formData.width,
          height: formData.height
        }
        
        const verticalTemplate = {
          ...templateData,
          name: `${formData.name} (Vertikal)`,
          orientation: 'portrait',
          width: formData.height, // Bytt dimensjoner
          height: formData.width  // Bytt dimensjoner
        }
        
        try {
          // Opprett horisontal versjon først
          await createMutation.mutateAsync(horizontalTemplate)
          // Deretter vertikal versjon
          await createMutation.mutateAsync(verticalTemplate)
          toast.success('Begge orienteringer opprettet!')
        } catch (error) {
          toast.error('Feil ved oppretting av maler')
        }
      } else {
        // Lag kun den valgte orienteringen
        createMutation.mutate(formData)
      }
    } else if (mode === 'edit' && templateId) {
      updateMutation.mutate({
        id: templateId,
        ...formData
      })
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake
          </Button>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveTab('preview')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Forhåndsvisning
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
            <Save className="h-4 w-4 mr-2" />
            )}
            {mode === 'create' ? 'Opprett mal' : 'Lagre endringer'}
          </Button>
        </div>
      </div>

      {/* Main Editor */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Grunnleggende</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="advanced">Avansert</TabsTrigger>
          <TabsTrigger value="preview">Forhåndsvisning</TabsTrigger>
        </TabsList>

        {/* Basic Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
          <CardHeader>
              <CardTitle>Grunnleggende informasjon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Navn *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="F.eks. Standard HMS Etikett"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="F.eks. Standard, Kompakt"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Beskrivelse</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Beskriv hva denne malen brukes til..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleInputChange('type', value as LabelType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QR">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          QR-kode
                        </div>
                      </SelectItem>
                      <SelectItem value="BARCODE">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Strekkode
                        </div>
                      </SelectItem>
                      <SelectItem value="TEXT">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Kun tekst
                        </div>
                      </SelectItem>
                      <SelectItem value="CUSTOM">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Tilpasset
                  </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Størrelse</Label>
                  <Select 
                    value={formData.size} 
                    onValueChange={(value) => handleInputChange('size', value as LabelSizeType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMALL">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-2 border border-current rounded-sm"></div>
                          Liten (25x12mm)
                        </div>
                      </SelectItem>
                      <SelectItem value="STANDARD">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-3 border border-current rounded-sm"></div>
                          Standard (54x25mm)
                        </div>
                      </SelectItem>
                      <SelectItem value="LARGE">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-4 border border-current rounded-sm"></div>
                          Stor (89x36mm)
                        </div>
                      </SelectItem>
                      <SelectItem value="CUSTOM">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Tilpasset
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Kompleksitet</Label>
                  <Select 
                    value={formData.complexity} 
                    onValueChange={(value) => handleInputChange('complexity', value as TemplateComplexity)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIMPLE">Enkel</SelectItem>
                      <SelectItem value="MEDIUM">Middels</SelectItem>
                      <SelectItem value="COMPLEX">Kompleks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                XML-mal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="xml">DYMO Label XML *</Label>
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm" 
                      onClick={() => handleInputChange('xml', defaultXmlTemplates[formData.type])}
                    >
                      Last standard mal
                    </Button>
              </div>
            </div>

                <Textarea
                  id="xml"
                  value={formData.xml}
                  onChange={(e) => handleInputChange('xml', e.target.value)}
                  placeholder="Lim inn DYMO label XML her..."
                  rows={20}
                  className="font-mono text-sm"
                  required
                />
                
                <div className="text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Bruk variabler som {'{{item.name}}'}, {'{{location.name}}'}, {'{{item.qrCode}}'} osv.
              </div>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
          <CardHeader>
              <CardTitle>Avanserte innstillinger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                <div>
                <Label htmlFor="fieldMapping">Feltmapping (JSON)</Label>
                    <Textarea
                  id="fieldMapping"
                  value={formData.fieldMapping}
                  onChange={(e) => handleInputChange('fieldMapping', e.target.value)}
                  placeholder='{"item.name": "ITEM_NAME", "location.name": "LOCATION_NAME"}'
                  rows={5}
                  className="font-mono text-sm"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  Definer hvordan datafelter mappes til XML-objekter
                </div>
                    </div>
                    
                    <div>
                <Label htmlFor="estimatedRenderTime">Estimert renderingstid (ms)</Label>
                      <Input
                  id="estimatedRenderTime"
                  type="number"
                  value={formData.estimatedRenderTime}
                  onChange={(e) => handleInputChange('estimatedRenderTime', parseInt(e.target.value) || 100)}
                  min={50}
                  max={5000}
                      />
                    </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Forhåndsvisning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
                <div className="text-center space-y-4">
                  {formData.type === 'QR' ? (
                    <div className="space-y-3">
                      <div className="w-20 h-20 bg-gray-800 mx-auto rounded grid grid-cols-5 gap-1 p-2">
                        {[...Array(25)].map((_, i) => (
                          <div key={i} className={`${i % 3 === 0 ? 'bg-white' : 'bg-gray-800'} rounded-sm`}></div>
                        ))}
                      </div>
                      <div className="font-bold text-sm">Eksempel gjenstand</div>
                      <div className="text-xs text-muted-foreground">Stue - Hylle A</div>
                    </div>
                  ) : formData.type === 'BARCODE' ? (
                    <div className="space-y-3">
                      <div className="flex space-x-1 justify-center">
                        {[...Array(20)].map((_, i) => (
                          <div key={i} className={`w-1 bg-gray-800 ${i % 2 === 0 ? 'h-12' : 'h-8'}`}></div>
                        ))}
                      </div>
                      <div className="font-mono text-xs">1234567890123</div>
                      <div className="text-xs text-muted-foreground">Eksempel produkt</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-24 h-16 bg-gradient-to-br from-blue-100 to-blue-200 mx-auto rounded flex items-center justify-center">
                        <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                      <div className="font-bold text-sm">Eksempel gjenstand</div>
                      <div className="text-xs text-muted-foreground">Tilpasset layout</div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium">Type:</span> {formData.type}
                </div>
                      <div>
                        <span className="font-medium">Størrelse:</span> {sizeLabels[formData.size]}
              </div>
                      <div>
                        <span className="font-medium">Kompleksitet:</span> {formData.complexity}
              </div>
            <div>
                        <span className="font-medium">Renderingstid:</span> {formData.estimatedRenderTime}ms
                </div>
                </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}