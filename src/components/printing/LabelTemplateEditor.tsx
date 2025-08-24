'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { 
  Save, 
  Eye, 
  Download, 
  ArrowLeft, 
  Type, 
  Image, 
  Square, 
  Circle,
  QrCode,
  BarChart3,
  Move,
  RotateCcw,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Database,
  Plus,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { LabelSizeSelector } from './LabelSizeSelector'

// Template element types
interface TemplateElement {
  id: string
  type: 'text' | 'qr' | 'barcode' | 'image' | 'shape'
  x: number
  y: number
  width: number
  height: number
  content?: string
  style?: {
    fontSize?: number
    fontWeight?: string
    color?: string
    backgroundColor?: string
    textAlign?: 'left' | 'center' | 'right'
    borderRadius?: number
    rotation?: number
  }
}

// Template data structure
interface Template {
  name: string
  description: string
  type: 'QR' | 'BARCODE' | 'CUSTOM'
  size: string // Now uses LabelSize ID
  category: string
  elements: TemplateElement[]
  variables: string[]
  canvasSettings: {
    width: number
    height: number
    backgroundColor: string
    gridEnabled: boolean
    snapToGrid: boolean
    gridSize: number
  }
}

// Props for the component
interface LabelTemplateEditorProps {
  initialName?: string
  initialType?: 'QR' | 'BARCODE' | 'CUSTOM'
  initialSize?: string
  mode?: 'new' | 'edit' | 'quick'
  quickTemplate?: string
}

// Fallback size presets (for backward compatibility)
const fallbackSizePresets = {
  SMALL: { width: 354, height: 177, label: '30x15mm' },
  STANDARD: { width: 638, height: 295, label: '54x25mm' },
  LARGE: { width: 1051, height: 425, label: '89x36mm' }
}

// Quick templates
const quickTemplateData = {
  'standard_hms_etikett': {
    elements: [
      {
        id: '1',
        type: 'qr' as const,
        x: 20,
        y: 20,
        width: 100,
        height: 100,
        content: '{{item.qrCode}}'
      },
      {
        id: '2',
        type: 'text' as const,
        x: 140,
        y: 20,
        width: 200,
        height: 30,
        content: '{{item.name}}',
        style: { fontSize: 16, fontWeight: 'bold' }
      },
      {
        id: '3',
        type: 'text' as const,
        x: 140,
        y: 55,
        width: 200,
        height: 20,
        content: '{{location.name}}',
        style: { fontSize: 12, color: '#666' }
      }
    ],
    variables: ['item.name', 'item.qrCode', 'location.name']
  }
}

export function LabelTemplateEditor({
  initialName = 'Ny etikettmal',
  initialType = 'CUSTOM',
  initialSize = '',
  mode = 'new',
  quickTemplate = ''
}: LabelTemplateEditorProps) {
  const router = useRouter()
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // Get label sizes from database
  const { data: labelSizes } = trpc.labelSizes.getAll.useQuery()
  
  // Initialize template from props
  const [template, setTemplate] = useState<Template>(() => {
    const name = initialName
    const type = initialType
    const sizeParam = initialSize || 'STANDARD'
    
    // Find default size from database or use fallback
    const defaultSize = labelSizes?.find(s => s.isDefault) || 
                       labelSizes?.[0] || 
                       { id: 'STANDARD', width: 638, height: 295 }
    
    const selectedSize = sizeParam === 'STANDARD' ? defaultSize.id : sizeParam
    
    const baseTemplate: Template = {
      name,
      description: '',
      type,
      size: selectedSize,
      category: '',
      elements: [],
      variables: [],
      canvasSettings: {
        width: defaultSize.width,
        height: defaultSize.height,
        backgroundColor: '#ffffff',
        gridEnabled: true,
        snapToGrid: true,
        gridSize: 10
      }
    }

    // Load quick template if specified
    if (quickTemplate && quickTemplate in quickTemplateData) {
      const quickData = quickTemplateData[quickTemplate as keyof typeof quickTemplateData]
      baseTemplate.elements = quickData.elements
      baseTemplate.variables = quickData.variables
    }

    return baseTemplate
  })

  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Update template when labelSizes are loaded
  useEffect(() => {
    if (labelSizes && labelSizes.length > 0) {
      const currentSize = labelSizes.find(s => s.id === template.size)
      const defaultSize = labelSizes.find(s => s.isDefault) || labelSizes[0]
      
      if (!currentSize && defaultSize) {
        setTemplate(prev => ({
          ...prev,
          size: defaultSize.id,
          canvasSettings: {
            ...prev.canvasSettings,
            width: defaultSize.width,
            height: defaultSize.height
          }
        }))
      }
    }
  }, [labelSizes, template.size])

  // Element manipulation functions
  const addElement = (type: TemplateElement['type'], content?: string) => {
    const newElement: TemplateElement = {
      id: Date.now().toString(),
      type,
      x: 50,
      y: 50,
      width: type === 'text' ? 150 : 80,
      height: type === 'text' ? 30 : 80,
      content: content || (type === 'text' ? 'Tekst' : type === 'qr' ? '{{item.qrCode}}' : '{{item.barcode}}'),
      style: type === 'text' ? { fontSize: 14, color: '#000000' } : {}
    }
    
    setTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }))
    setSelectedElement(newElement.id)
  }

  const updateElement = (id: string, updates: Partial<TemplateElement>) => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    }))
  }

  const deleteElement = (id: string) => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id)
    }))
    setSelectedElement(null)
  }

  const duplicateElement = (id: string) => {
    const element = template.elements.find(el => el.id === id)
    if (element) {
      const duplicate = {
        ...element,
        id: Date.now().toString(),
        x: element.x + 20,
        y: element.y + 20
      }
      setTemplate(prev => ({
        ...prev,
        elements: [...prev.elements, duplicate]
      }))
    }
  }

  const selectedElementData = selectedElement ? 
    template.elements.find(el => el.id === selectedElement) : null

  // Drag & Drop handlers
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const element = template.elements.find(el => el.id === elementId)
    if (!element) return
    
    setSelectedElement(elementId)
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragOffset({ 
      x: e.clientX - element.x * (zoom / 100), 
      y: e.clientY - element.y * (zoom / 100) 
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return
    
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    if (!canvasRect) return
    
    const scale = zoom / 100
    const newX = Math.max(0, (e.clientX - dragOffset.x) / scale)
    const newY = Math.max(0, (e.clientY - dragOffset.y) / scale)
    
    // Snap to grid if enabled
    const snapX = template.canvasSettings.snapToGrid ? 
      Math.round(newX / template.canvasSettings.gridSize) * template.canvasSettings.gridSize : newX
    const snapY = template.canvasSettings.snapToGrid ? 
      Math.round(newY / template.canvasSettings.gridSize) * template.canvasSettings.gridSize : newY
    
    updateElement(selectedElement, { x: snapX, y: snapY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle size change
  const handleSizeChange = (sizeId: string) => {
    const newSize = labelSizes?.find(s => s.id === sizeId)
    if (newSize) {
      setTemplate(prev => ({
        ...prev,
        size: sizeId,
        canvasSettings: {
          ...prev.canvasSettings,
          width: newSize.width,
          height: newSize.height
        }
      }))
    }
  }

  // Get current size info
  const currentSize = labelSizes?.find(s => s.id === template.size)
  const sizeLabel = currentSize ? `${currentSize.widthMm}×${currentSize.heightMm}mm` : 'Standard'

  // Global mouse event listeners for better drag experience
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && selectedElement) {
        const canvasRect = canvasRef.current?.getBoundingClientRect()
        if (!canvasRect) return
        
        const scale = zoom / 100
        const newX = Math.max(0, (e.clientX - dragOffset.x) / scale)
        const newY = Math.max(0, (e.clientY - dragOffset.y) / scale)
        
        // Snap to grid if enabled
        const snapX = template.canvasSettings.snapToGrid ? 
          Math.round(newX / template.canvasSettings.gridSize) * template.canvasSettings.gridSize : newX
        const snapY = template.canvasSettings.snapToGrid ? 
          Math.round(newY / template.canvasSettings.gridSize) * template.canvasSettings.gridSize : newY
        
        updateElement(selectedElement, { x: snapX, y: snapY })
      }
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, selectedElement, dragOffset, zoom, template.canvasSettings.snapToGrid, template.canvasSettings.gridSize])

  const handleSave = async () => {
    // TODO: Implement save to database
    console.log('Saving template:', template)
    // For now just show success
    alert('Mal lagret! (Demo)')
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting to PDF:', template)
    alert('PDF eksport kommer snart!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/printing/templates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground">
              {template.type} etikett
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="size-selector" className="text-sm">Størrelse:</Label>
            <LabelSizeSelector
              value={template.size}
              onValueChange={handleSizeChange}
              placeholder="Velg størrelse"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Eksporter
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Lagre
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Elements Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Elementer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addElement('text')}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <Type className="h-4 w-4" />
                Tekst
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addElement('qr')}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <QrCode className="h-4 w-4" />
                QR-kode
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addElement('barcode')}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <BarChart3 className="h-4 w-4" />
                Strekkode
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addElement('shape')}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <Square className="h-4 w-4" />
                Form
              </Button>
            </div>

            <Separator />

            {/* Database Fields Section */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Fra databasen
              </Label>
              <div className="space-y-2">
                {/* Item Fields */}
                <div>
                  <Label className="text-xs text-muted-foreground">Gjenstand</Label>
                  <div className="grid grid-cols-1 gap-1 mt-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{item.name}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Navn
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{item.description}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Beskrivelse
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('qr', '{{item.qrCode}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      QR-kode
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('barcode', '{{item.barcode}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Strekkode
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{item.brand}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Merke
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{item.price}} kr')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Pris
                    </Button>
                  </div>
                </div>
                
                {/* Location Fields */}
                <div>
                  <Label className="text-xs text-muted-foreground">Lokasjon</Label>
                  <div className="grid grid-cols-1 gap-1 mt-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{location.name}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Lokasjon
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{location.description}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Beskrivelse
                    </Button>
                  </div>
                </div>
                
                {/* Yarn Specific Fields */}
                <div>
                  <Label className="text-xs text-muted-foreground">Garn (hvis aktuelt)</Label>
                  <div className="grid grid-cols-1 gap-1 mt-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{yarn.color}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Farge navn
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{yarn.colorCode}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Farge ID
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{yarn.batchNumber}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Batch nummer
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{yarn.quantity}} nøster')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Antall i posen
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{yarn.producer}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Produsent
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{yarn.composition}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Sammensetning
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{yarn.pricePerSkein}} kr/nøste')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Pris per nøste
                    </Button>
                  </div>
                </div>
                
                {/* Category Fields */}
                <div>
                  <Label className="text-xs text-muted-foreground">Kategori</Label>
                  <div className="grid grid-cols-1 gap-1 mt-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{category.name}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Kategori navn
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addElement('text', '{{category.icon}}')}
                      className="justify-start text-xs h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Kategori ikon
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Element List */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Lag ({template.elements.length})</Label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {template.elements.map((element, index) => (
                  <div 
                    key={element.id}
                    className={`p-2 rounded text-sm cursor-pointer border transition-colors ${
                      selectedElement === element.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {element.type === 'text' && <Type className="h-3 w-3" />}
                        {element.type === 'qr' && <QrCode className="h-3 w-3" />}
                        {element.type === 'barcode' && <BarChart3 className="h-3 w-3" />}
                        {element.type === 'shape' && <Square className="h-3 w-3" />}
                        {element.type} {index + 1}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateElement(element.id)
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteElement(element.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Design
                {isDragging && (
                  <Badge variant="secondary" className="text-xs">
                    <Move className="h-3 w-3 mr-1" />
                    Dragging
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Zoom:</Label>
                <div className="flex items-center gap-2 w-24">
                  <Slider
                    value={[zoom]}
                    onValueChange={(value) => setZoom(value[0] || 100)}
                    min={25}
                    max={200}
                    step={25}
                  />
                  <span className="text-xs">{zoom}%</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              ref={canvasRef}
              className="relative border rounded-lg overflow-auto"
              style={{ 
                minHeight: '400px',
                backgroundImage: template.canvasSettings.gridEnabled ? 
                  `radial-gradient(circle, #ccc 1px, transparent 1px)` : 'none',
                backgroundSize: template.canvasSettings.gridEnabled ? 
                  `${template.canvasSettings.gridSize}px ${template.canvasSettings.gridSize}px` : 'auto'
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                className="relative mx-auto my-8 border shadow-sm"
                style={{
                  width: template.canvasSettings.width * (zoom / 100),
                  height: template.canvasSettings.height * (zoom / 100),
                  backgroundColor: template.canvasSettings.backgroundColor,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left'
                }}
              >
                {template.elements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute cursor-move border-2 transition-colors ${
                      selectedElement === element.id 
                        ? isDragging 
                          ? 'border-blue-600 bg-blue-100/30 shadow-lg' 
                          : 'border-blue-500 bg-blue-50/20' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      fontSize: element.style?.fontSize || 14,
                      fontWeight: element.style?.fontWeight || 'normal',
                      color: element.style?.color || '#000000',
                      backgroundColor: element.style?.backgroundColor || 'transparent',
                      textAlign: element.style?.textAlign || 'left',
                      borderRadius: element.style?.borderRadius || 0,
                      transform: `rotate(${element.style?.rotation || 0}deg)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: element.style?.textAlign === 'center' ? 'center' : 
                                   element.style?.textAlign === 'right' ? 'flex-end' : 'flex-start',
                      padding: element.type === 'text' ? '4px' : '0'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                    onClick={(e) => {
                      if (!isDragging) {
                        setSelectedElement(element.id)
                      }
                    }}
                  >
                    {element.type === 'text' && (
                      <span style={{ 
                        wordBreak: 'break-word',
                        textDecoration: element.style?.fontWeight === 'underline' ? 'underline' : 'none'
                      }}>
                        {element.content || 'Tekst'}
                      </span>
                    )}
                    {element.type === 'qr' && (
                      <div className="w-full h-full bg-black flex items-center justify-center text-white text-xs">
                        QR
                      </div>
                    )}
                    {element.type === 'barcode' && (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <div className="flex gap-px h-full">
                          {Array.from({length: 8}).map((_, i) => (
                            <div key={i} className="bg-white flex-1"></div>
                          ))}
                        </div>
                      </div>
                    )}
                    {element.type === 'shape' && (
                      <div 
                        className="w-full h-full"
                        style={{ 
                          backgroundColor: element.style?.backgroundColor || '#cccccc',
                          borderRadius: element.style?.borderRadius || 0
                        }}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Egenskaper</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedElementData ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    {selectedElementData.type.charAt(0).toUpperCase() + selectedElementData.type.slice(1)} element
                  </Label>
                  <Badge variant="secondary" className="ml-2">
                    {selectedElementData.id}
                  </Badge>
                </div>

                {/* Content */}
                {(selectedElementData.type === 'text' || selectedElementData.type === 'qr' || selectedElementData.type === 'barcode') && (
                  <div>
                    <Label>Innhold</Label>
                    <Textarea
                      value={selectedElementData.content || ''}
                      onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                      placeholder="Skriv innhold..."
                      rows={2}
                    />
                  </div>
                )}

                {/* Position & Size */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>X</Label>
                    <Input
                      type="number"
                      value={selectedElementData.x}
                      onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Y</Label>
                    <Input
                      type="number"
                      value={selectedElementData.y}
                      onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Bredde</Label>
                    <Input
                      type="number"
                      value={selectedElementData.width}
                      onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Høyde</Label>
                    <Input
                      type="number"
                      value={selectedElementData.height}
                      onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Text Styling */}
                {selectedElementData.type === 'text' && (
                  <>
                    <Separator />
                    <div>
                      <Label>Tekststørrelse</Label>
                      <Input
                        type="number"
                        value={selectedElementData.style?.fontSize || 14}
                        onChange={(e) => updateElement(selectedElementData.id, { 
                          style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) || 14 }
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label>Tekstfarge</Label>
                      <Input
                        type="color"
                        value={selectedElementData.style?.color || '#000000'}
                        onChange={(e) => updateElement(selectedElementData.id, { 
                          style: { ...selectedElementData.style, color: e.target.value }
                        })}
                      />
                    </div>

                    <div>
                      <Label>Justering</Label>
                      <div className="flex gap-1">
                        {['left', 'center', 'right'].map((align) => (
                          <Button
                            key={align}
                            variant={selectedElementData.style?.textAlign === align ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedElementData.id, { 
                              style: { ...selectedElementData.style, textAlign: align as any }
                            })}
                          >
                            {align === 'left' && <AlignLeft className="h-4 w-4" />}
                            {align === 'center' && <AlignCenter className="h-4 w-4" />}
                            {align === 'right' && <AlignRight className="h-4 w-4" />}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={selectedElementData.style?.fontWeight === 'bold'}
                        onCheckedChange={(checked) => updateElement(selectedElementData.id, { 
                          style: { ...selectedElementData.style, fontWeight: checked ? 'bold' : 'normal' }
                        })}
                      />
                      <Label>Fet skrift</Label>
                    </div>
                  </>
                )}

                {/* Background for shapes */}
                {selectedElementData.type === 'shape' && (
                  <>
                    <Separator />
                    <div>
                      <Label>Bakgrunnsfarge</Label>
                      <Input
                        type="color"
                        value={selectedElementData.style?.backgroundColor || '#cccccc'}
                        onChange={(e) => updateElement(selectedElementData.id, { 
                          style: { ...selectedElementData.style, backgroundColor: e.target.value }
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label>Hjørneradius</Label>
                      <Input
                        type="number"
                        value={selectedElementData.style?.borderRadius || 0}
                        onChange={(e) => updateElement(selectedElementData.id, { 
                          style: { ...selectedElementData.style, borderRadius: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  </>
                )}

                <Separator />
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => duplicateElement(selectedElementData.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteElement(selectedElementData.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Velg et element for å redigere egenskaper</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Innstillinger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Canvas</Label>
              <div className="space-y-3 mt-2">
                <div>
                  <Label className="text-xs">Bakgrunnsfarge</Label>
                  <Input
                    type="color"
                    value={template.canvasSettings.backgroundColor}
                    onChange={(e) => setTemplate(prev => ({
                      ...prev,
                      canvasSettings: {
                        ...prev.canvasSettings,
                        backgroundColor: e.target.value
                      }
                    }))}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={template.canvasSettings.gridEnabled}
                    onCheckedChange={(checked) => setTemplate(prev => ({
                      ...prev,
                      canvasSettings: {
                        ...prev.canvasSettings,
                        gridEnabled: checked
                      }
                    }))}
                  />
                  <Label className="text-xs">Vis rutenett</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={template.canvasSettings.snapToGrid}
                    onCheckedChange={(checked) => setTemplate(prev => ({
                      ...prev,
                      canvasSettings: {
                        ...prev.canvasSettings,
                        snapToGrid: checked
                      }
                    }))}
                  />
                  <Label className="text-xs">Snap til rutenett</Label>
                </div>
                
                <div>
                  <Label className="text-xs">Rutenett-størrelse (px)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="50"
                    value={template.canvasSettings.gridSize}
                    onChange={(e) => setTemplate(prev => ({
                      ...prev,
                      canvasSettings: {
                        ...prev.canvasSettings,
                        gridSize: parseInt(e.target.value) || 10
                      }
                    }))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Variables */}
      {template.variables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Variabler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {template.variables.map((variable, index) => (
                <Badge key={index} variant="outline">
                  {`{{${variable}}}`}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Disse variablene vil bli erstattet med faktiske data når etiketten skrives ut.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Default export for backward compatibility
export default LabelTemplateEditor