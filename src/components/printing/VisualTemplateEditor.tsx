'use client'

import { useState, useCallback } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, useDroppable, useDraggable } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc/client'
import { 
  QrCode, 
  Type, 
  BarChart3, 
  Image as ImageIcon, 
  Square, 
  Minus,
  Plus,
  Trash2,
  Copy,
  Settings,
  Eye,
  Save,
  ArrowLeft,
  RotateCw
} from 'lucide-react'

// Element types som kan dras til canvas
export type ElementType = 'qr' | 'text' | 'barcode' | 'image' | 'rectangle' | 'line'

// Konvertering mellom mm og piksler (ca. 3.78 piksler per mm ved 96 DPI)
const MM_TO_PX = 3.78
const PX_TO_MM = 1 / MM_TO_PX

// Standard etikettmål i mm
const LABEL_SIZES = {
  SMALL: { width: 25, height: 12 },
  STANDARD: { width: 54, height: 25 },
  LARGE: { width: 89, height: 36 },
  CUSTOM: { width: 54, height: 25 } // Default for custom
}

export interface TemplateElement {
  id: string
  type: ElementType
  x: number // Posisjon i mm
  y: number // Posisjon i mm
  width: number // Bredde i mm
  height: number // Høyde i mm
  properties: {
    text?: string
    fontSize?: number
    fontFamily?: string
    fontWeight?: 'normal' | 'bold'
    textAlign?: 'left' | 'center' | 'right'
    color?: string
    backgroundColor?: string
    borderWidth?: number
    borderColor?: string
    dataBinding?: string // For dynamisk data som {{item.name}}
    locationId?: string // For QR-koder koblet til spesifikk lokasjon
    locationName?: string // Cached location name for display
  }
}

interface VisualTemplateEditorProps {
  onSave?: (elements: TemplateElement[], xml: string) => void
  onCancel?: () => void
  initialElements?: TemplateElement[]
}

// Palette elementer som kan dras
const PALETTE_ELEMENTS = [
  { id: 'qr', type: 'qr' as ElementType, icon: QrCode, label: 'QR-kode', color: 'bg-blue-100 text-blue-600' },
  { id: 'text', type: 'text' as ElementType, icon: Type, label: 'Tekst', color: 'bg-green-100 text-green-600' },
  { id: 'barcode', type: 'barcode' as ElementType, icon: BarChart3, label: 'Strekkode', color: 'bg-purple-100 text-purple-600' },
  { id: 'image', type: 'image' as ElementType, icon: ImageIcon, label: 'Bilde', color: 'bg-orange-100 text-orange-600' },
  { id: 'rectangle', type: 'rectangle' as ElementType, icon: Square, label: 'Rektangel', color: 'bg-gray-100 text-gray-600' },
  { id: 'line', type: 'line' as ElementType, icon: Minus, label: 'Linje', color: 'bg-red-100 text-red-600' }
]

// Draggable palette element
function PaletteElement({ element }: { element: typeof PALETTE_ELEMENTS[0] }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: element.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = element.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${element.color}`}
    >
      <div className="flex flex-col items-center gap-2">
        <Icon className="h-6 w-6" />
        <span className="text-xs font-medium">{element.label}</span>
      </div>
    </div>
  )
}

// Droppable Canvas Area
function DroppableCanvas({ children, onCanvasClick, labelSize = 'STANDARD', customSize }: { 
  children: React.ReactNode, 
  onCanvasClick?: () => void,
  labelSize?: keyof typeof LABEL_SIZES,
  customSize?: { width: number, height: number }
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas',
  })

  const canvasSize = labelSize === 'CUSTOM' && customSize ? customSize : LABEL_SIZES[labelSize]
  const canvasWidth = canvasSize.width * MM_TO_PX
  const canvasHeight = canvasSize.height * MM_TO_PX

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-sm text-muted-foreground">
        Etikett: {canvasSize.width}×{canvasSize.height}mm
      </div>
      <div
        ref={setNodeRef}
        className={`relative bg-white border-2 border-dashed rounded-lg transition-colors ${
          isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        style={{ 
          width: `${canvasWidth}px`, 
          height: `${canvasHeight}px`,
          minWidth: `${canvasWidth}px`,
          minHeight: `${canvasHeight}px`
        }}
        onClick={onCanvasClick}
      >
        {/* Rutenett for bedre presisjon */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: `${5 * MM_TO_PX}px ${5 * MM_TO_PX}px`
          }}
        />
        {children}
      </div>
    </div>
  )
}

// Canvas element som kan flyttes og redigeres
function CanvasElement({ element, isSelected, onClick }: { 
  element: TemplateElement
  isSelected: boolean
  onClick: () => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: element.id })

  const style = {
    position: 'absolute' as const,
    left: (element.x * MM_TO_PX) + (transform?.x || 0),
    top: (element.y * MM_TO_PX) + (transform?.y || 0),
    width: element.width * MM_TO_PX,
    height: element.height * MM_TO_PX,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : isSelected ? 100 : 1,
  }

  const renderElementContent = () => {
    switch (element.type) {
      case 'qr':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="bg-gray-800 rounded grid grid-cols-5 gap-1 p-1" style={{ width: '80%', height: '80%' }}>
              {[...Array(25)].map((_, i) => (
                <div key={i} className={`${i % 3 === 0 ? 'bg-white' : 'bg-gray-800'} rounded-sm`}></div>
              ))}
            </div>
            {element.properties.locationName && (
              <div className="text-xs text-center mt-1 font-medium truncate w-full">
                {element.properties.locationName}
              </div>
            )}
          </div>
        )
      case 'text':
        return (
          <div 
            className="w-full h-full flex items-center justify-center text-xs font-medium"
            style={{ 
              fontSize: element.properties.fontSize || 12,
              fontFamily: element.properties.fontFamily || 'Arial',
              fontWeight: element.properties.fontWeight || 'normal',
              textAlign: element.properties.textAlign || 'center',
              color: element.properties.color || '#000000',
              backgroundColor: element.properties.backgroundColor || 'transparent'
            }}
          >
            {element.properties.text || element.properties.dataBinding || 'Tekst'}
          </div>
        )
      case 'barcode':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex space-x-1">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`w-1 bg-gray-800 ${i % 2 === 0 ? 'h-8' : 'h-6'}`}></div>
              ))}
            </div>
          </div>
        )
      case 'image':
        return (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded">
            <ImageIcon className="h-6 w-6 text-gray-400" />
          </div>
        )
      case 'rectangle':
        return (
          <div 
            className="w-full h-full rounded"
            style={{
              backgroundColor: element.properties.backgroundColor || 'transparent',
              border: `${element.properties.borderWidth || 1}px solid ${element.properties.borderColor || '#000000'}`
            }}
          ></div>
        )
      case 'line':
        return (
          <div 
            className="w-full h-full flex items-center"
            style={{
              borderTop: `${element.properties.borderWidth || 1}px solid ${element.properties.borderColor || '#000000'}`
            }}
          ></div>
        )
      default:
        return null
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cursor-move border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'} hover:border-blue-300 transition-colors`}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <div {...attributes} {...listeners} className="w-full h-full">
        {renderElementContent()}
      </div>
    </div>
  )
}

export function VisualTemplateEditor({ onSave, onCancel, initialElements = [] }: VisualTemplateEditorProps) {
  const [elements, setElements] = useState<TemplateElement[]>(initialElements)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [labelSize, setLabelSize] = useState<keyof typeof LABEL_SIZES>('STANDARD')
  const [customSize, setCustomSize] = useState({ width: 54, height: 25 })

  // Hent lokasjoner fra database
  const { data: locationsData } = trpc.locations.getAll.useQuery()
  const locations = locationsData && Array.isArray(locationsData) ? locationsData : []

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event
    setActiveId(null)

    console.log('Drag end:', { activeId: active.id, overId: over?.id, delta })

    // Hvis vi dropper fra palette til canvas
    if (PALETTE_ELEMENTS.find(el => el.id === active.id)) {
      const paletteElement = PALETTE_ELEMENTS.find(el => el.id === active.id)
      if (paletteElement) {
        console.log('Adding new element:', paletteElement.type)
        const newElement: TemplateElement = {
          id: `${paletteElement.type}-${Date.now()}`,
          type: paletteElement.type,
          x: Math.max(1, Math.round((delta?.x || 50) * PX_TO_MM * 10) / 10), // Avrund til 0.1mm
          y: Math.max(1, Math.round((delta?.y || 50) * PX_TO_MM * 10) / 10),
          width: paletteElement.type === 'line' ? 25 : 15, // mm
          height: paletteElement.type === 'line' ? 0.5 : 10, // mm
          properties: {
            text: paletteElement.type === 'text' ? 'Ny tekst' : undefined,
            fontSize: 12,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            textAlign: 'center',
            color: '#000000',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#000000',
            dataBinding: paletteElement.type === 'text' ? '{{item.name}}' : undefined
          }
        }
        setElements(prev => [...prev, newElement])
        setSelectedElement(newElement.id) // Velg det nye elementet automatisk
      }
    }
    // Hvis vi flytter eksisterende elementer på canvas
    else if (elements.find(el => el.id === active.id) && delta) {
      const elementId = active.id as string
      setElements(prev => prev.map(el => 
        el.id === elementId 
          ? { 
              ...el, 
              x: Math.max(0, Math.round((el.x + delta.x * PX_TO_MM) * 10) / 10), // Avrund til 0.1mm
              y: Math.max(0, Math.round((el.y + delta.y * PX_TO_MM) * 10) / 10)
            }
          : el
      ))
      console.log('Moved element:', elementId, 'by delta:', delta)
    }
  }, [elements])

  const updateElementProperty = (elementId: string, property: string, value: any) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, properties: { ...el.properties, [property]: value } }
        : el
    ))
  }

  const updateElementPosition = (elementId: string, x: number, y: number) => {
    const currentLabelSize = labelSize === 'CUSTOM' ? customSize : LABEL_SIZES[labelSize]
    const maxX = Math.max(0, currentLabelSize.width - 1)
    const maxY = Math.max(0, currentLabelSize.height - 1)
    
    setElements(prev => prev.map(el => 
      el.id === elementId ? { 
        ...el, 
        x: Math.max(0, Math.min(maxX, x)), 
        y: Math.max(0, Math.min(maxY, y)) 
      } : el
    ))
  }

  const updateElementSize = (elementId: string, width: number, height: number) => {
    const currentLabelSize = labelSize === 'CUSTOM' ? customSize : LABEL_SIZES[labelSize]
    const element = elements.find(el => el.id === elementId)
    if (!element) return
    
    const maxWidth = Math.max(0.1, currentLabelSize.width - element.x)
    const maxHeight = Math.max(0.1, currentLabelSize.height - element.y)
    
    setElements(prev => prev.map(el => 
      el.id === elementId ? { 
        ...el, 
        width: Math.max(0.1, Math.min(maxWidth, width)), 
        height: Math.max(0.1, Math.min(maxHeight, height)) 
      } : el
    ))
  }

  const deleteElement = (elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId))
    setSelectedElement(null)
  }

  const duplicateElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId)
    if (element) {
      const newElement = {
        ...element,
        id: `${element.type}-${Date.now()}`,
        x: element.x + 10,
        y: element.y + 10
      }
      setElements(prev => [...prev, newElement])
    }
  }

  const rotateElement = (elementId: string) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, width: el.height, height: el.width }
        : el
    ))
  }

  const generateXML = () => {
    // Her ville vi konvertere elements til DYMO XML format
    // Dette er en forenklet versjon
    return `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>CustomTemplate</Id>
  <PaperName>Custom Label</PaperName>
  <ObjectInfo>
    ${elements.map(el => {
      switch (el.type) {
        case 'text':
          return `<TextObject>
            <Name>${el.id}</Name>
            <Text>${el.properties.dataBinding || el.properties.text || ''}</Text>
            <IsVariable>${el.properties.dataBinding ? 'True' : 'False'}</IsVariable>
          </TextObject>`
        case 'qr':
          const qrText = el.properties.locationId 
            ? `{{location.qrCode}}` 
            : (el.properties.dataBinding || '{{item.qrCode}}')
          return `<QRCodeObject>
            <Name>${el.id}</Name>
            <Text>${qrText}</Text>
            <IsVariable>True</IsVariable>
            <HorizontalAlignment>Center</HorizontalAlignment>
            <VerticalAlignment>Middle</VerticalAlignment>
          </QRCodeObject>`
        default:
          return ''
      }
    }).join('\n    ')}
  </ObjectInfo>
</DieCutLabel>`
  }

  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake
          </Button>
          <h1 className="text-xl font-semibold">Visuell Template Editor</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Etikettmål selector */}
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Etikettmål:</Label>
            <Select value={labelSize} onValueChange={(value: keyof typeof LABEL_SIZES) => setLabelSize(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SMALL">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 border border-current rounded-sm"></div>
                    Liten (25×12mm)
                  </div>
                </SelectItem>
                <SelectItem value="STANDARD">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-3 border border-current rounded-sm"></div>
                    Standard (54×25mm)
                  </div>
                </SelectItem>
                <SelectItem value="LARGE">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4 border border-current rounded-sm"></div>
                    Stor (89×36mm)
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
          
          {/* Tilpasset størrelse input */}
          {labelSize === 'CUSTOM' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  step="0.1"
                  value={customSize.width}
                  onChange={(e) => setCustomSize(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                  className="w-16 h-8"
                  placeholder="B"
                />
                <span className="text-xs text-muted-foreground">×</span>
                <Input
                  type="number"
                  step="0.1"
                  value={customSize.height}
                  onChange={(e) => setCustomSize(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                  className="w-16 h-8"
                  placeholder="H"
                />
                <span className="text-xs text-muted-foreground">mm</span>
              </div>
              
              {/* Hurtigvalg for vanlige mål */}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCustomSize({ width: 30, height: 15 })}
                  className="text-xs h-6 px-2"
                >
                  30×15
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCustomSize({ width: 70, height: 35 })}
                  className="text-xs h-6 px-2"
                >
                  70×35
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCustomSize({ width: 100, height: 50 })}
                  className="text-xs h-6 px-2"
                >
                  100×50
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Forhåndsvisning
            </Button>
            <Button onClick={() => onSave?.(elements, generateXML())}>
              <Save className="h-4 w-4 mr-2" />
              Lagre
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Element Palette */}
          <div className="w-64 border-r bg-muted/30 p-4">
            <h3 className="font-medium mb-4">Elementer</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {PALETTE_ELEMENTS.map(element => (
                <PaletteElement key={element.id} element={element} />
              ))}
            </div>
            
            {/* Hurtig-aksjon for lokasjoner */}
            {locations.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Hurtigaksjon</h4>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => {
                    // Legg til QR-koder for alle lokasjoner
                    const newElements = locations.map((location, index) => ({
                      id: `qr-location-${location.id}`,
                      type: 'qr' as ElementType,
                      x: 5 + (index % 3) * 15,
                      y: 5 + Math.floor(index / 3) * 15,
                      width: 12,
                      height: 12,
                      properties: {
                        dataBinding: '{{location.qrCode}}',
                        locationId: location.id,
                        locationName: location.name,
                        fontSize: 8,
                        fontFamily: 'Arial',
                        fontWeight: 'normal' as const,
                        textAlign: 'center' as const,
                        color: '#000000',
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: '#000000'
                      }
                    }))
                    setElements(prev => [...prev, ...newElements])
                  }}
                >
                  <QrCode className="h-3 w-3 mr-1" />
                  QR for alle lokasjoner
                </Button>
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div className="flex-1 p-4">
            <DroppableCanvas 
              labelSize={labelSize}
              customSize={customSize}
              onCanvasClick={() => setSelectedElement(null)}
            >
              {elements.map(element => (
                <CanvasElement
                  key={element.id}
                  element={element}
                  isSelected={selectedElement === element.id}
                  onClick={() => setSelectedElement(element.id)}
                />
              ))}
            </DroppableCanvas>
          </div>

          {/* Properties Panel */}
          <div className="w-80 border-l bg-muted/30 p-4">
            <h3 className="font-medium mb-4">Egenskaper</h3>
            {selectedElementData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {PALETTE_ELEMENTS.find(el => el.type === selectedElementData.type)?.label}
                  </span>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => rotateElement(selectedElementData.id)}
                      title="Roter element"
                    >
                      <RotateCw className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => duplicateElement(selectedElementData.id)}
                      title="Dupliser element"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteElement(selectedElementData.id)}
                      title="Slett element"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Position and Size */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Posisjon og størrelse</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">X (mm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={selectedElementData.x}
                        onChange={(e) => updateElementPosition(selectedElementData.id, parseFloat(e.target.value) || 0, selectedElementData.y)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Y (mm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={selectedElementData.y}
                        onChange={(e) => updateElementPosition(selectedElementData.id, selectedElementData.x, parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Bredde (mm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={selectedElementData.width}
                        onChange={(e) => updateElementSize(selectedElementData.id, parseFloat(e.target.value) || 0, selectedElementData.height)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Høyde (mm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={selectedElementData.height}
                        onChange={(e) => updateElementSize(selectedElementData.id, selectedElementData.width, parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Properties */}
                {selectedElementData.type === 'text' && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Tekst</Label>
                    <div>
                      <Label className="text-xs">Innhold</Label>
                      <Input
                        value={selectedElementData.properties.text || ''}
                        onChange={(e) => updateElementProperty(selectedElementData.id, 'text', e.target.value)}
                        placeholder="Skriv tekst..."
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Data-binding</Label>
                      <Select
                        value={selectedElementData.properties.dataBinding || ''}
                        onValueChange={(value) => updateElementProperty(selectedElementData.id, 'dataBinding', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Velg data..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="{{item.name}}">Gjenstandsnavn</SelectItem>
                          <SelectItem value="{{item.description}}">Beskrivelse</SelectItem>
                          <SelectItem value="{{location.name}}">Lokasjon</SelectItem>
                          <SelectItem value="{{category.name}}">Kategori</SelectItem>
                          <SelectItem value="{{item.barcode}}">Strekkode</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Skriftstørrelse</Label>
                        <Input
                          type="number"
                          value={selectedElementData.properties.fontSize || 12}
                          onChange={(e) => updateElementProperty(selectedElementData.id, 'fontSize', parseInt(e.target.value) || 12)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Justering</Label>
                        <Select
                          value={selectedElementData.properties.textAlign || 'center'}
                          onValueChange={(value) => updateElementProperty(selectedElementData.id, 'textAlign', value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Venstre</SelectItem>
                            <SelectItem value="center">Senter</SelectItem>
                            <SelectItem value="right">Høyre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* QR/Barcode Properties */}
                {(selectedElementData.type === 'qr' || selectedElementData.type === 'barcode') && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Data</Label>
                    <div>
                      <Label className="text-xs">Data-binding</Label>
                      <Select
                        value={selectedElementData.properties.dataBinding || ''}
                        onValueChange={(value) => updateElementProperty(selectedElementData.id, 'dataBinding', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Velg data..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="{{item.qrCode}}">QR-kode</SelectItem>
                          <SelectItem value="{{item.barcode}}">Strekkode</SelectItem>
                          <SelectItem value="{{item.id}}">Gjenstand ID</SelectItem>
                          <SelectItem value="{{location.qrCode}}">Lokasjon QR-kode</SelectItem>
                          <SelectItem value="{{location.id}}">Lokasjon ID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Lokasjon-kobling for QR-koder */}
                    {selectedElementData.type === 'qr' && (
                      <div>
                        <Label className="text-xs">Koble til lokasjon</Label>
                        <Select
                          value={selectedElementData.properties.locationId || ''}
                          onValueChange={(value) => {
                            const location = locations.find(loc => loc.id === value)
                            updateElementProperty(selectedElementData.id, 'locationId', value)
                            updateElementProperty(selectedElementData.id, 'locationName', location?.name || '')
                            // Sett automatisk data-binding til lokasjon QR-kode
                            if (value) {
                              updateElementProperty(selectedElementData.id, 'dataBinding', '{{location.qrCode}}')
                            }
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Velg lokasjon..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Ingen lokasjon</SelectItem>
                            {locations.map(location => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedElementData.properties.locationId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Koblet til: {selectedElementData.properties.locationName}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Velg et element for å redigere egenskaper</p>
            )}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="p-3 rounded-lg bg-white shadow-lg border">
                {PALETTE_ELEMENTS.find(el => el.id === activeId)?.label}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
