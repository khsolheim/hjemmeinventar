'use client'

import { useState, useEffect, useRef } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, Save, Eye, Download, Upload, Plus, Minus, Move, RotateCw, Type, Square, Circle, QrCode, BarChart3, Image, Layers, Grid, Palette, Settings, History, Undo, Redo } from 'lucide-react'
import type { LabelTemplate, LabelSize, LabelType } from '@prisma/client'

interface CanvasElement {
  id: string
  type: 'text' | 'qr' | 'barcode' | 'image' | 'shape'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  properties: Record<string, any>
}

interface TemplateEditorProps {
  templateId?: string
  onSave?: (template: LabelTemplate) => void
  onCancel?: () => void
  readonly?: boolean
}

export function LabelTemplateEditor({ 
  templateId, 
  onSave, 
  onCancel, 
  readonly = false 
}: TemplateEditorProps) {
  const [template, setTemplate] = useState<Partial<LabelTemplate>>({
    name: 'Ny mal',
    type: 'QR' as LabelType,
    size: 'LABEL_30334' as LabelSize,
    description: '',
    fields: [],
    settings: {},
    isSystemTemplate: false
  })
  
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [currentTool, setCurrentTool] = useState<string>('select')
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 300 })
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [history, setHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // tRPC queries and mutations
  const { data: existingTemplate, isLoading } = trpc.printing.getTemplate.useQuery(
    { id: templateId!, options: { includeInheritanceChain: true } },
    { enabled: !!templateId }
  )

  const { data: labelMedia } = trpc.printing.listLabelMedia.useQuery()

  const upsertTemplateMutation = trpc.printing.upsertTemplate.useMutation({
    onSuccess: (data) => {
      onSave?.(data as LabelTemplate)
    }
  })

  const validateTemplateMutation = trpc.printing.validateTemplate.useMutation()

  // Initialize template
  useEffect(() => {
    if (existingTemplate) {
      setTemplate(existingTemplate)
      setCanvasElements(existingTemplate.design?.elements || [])
      
      // Set canvas size based on label media
      const media = labelMedia?.find(m => m.size === existingTemplate.size)
      if (media) {
        setCanvasSize({
          width: media.widthMm * 2, // Scale for display
          height: media.heightMm * 2
        })
      }
    }
  }, [existingTemplate, labelMedia])

  // Canvas size effect
  useEffect(() => {
    if (template.size && labelMedia) {
      const media = labelMedia.find(m => m.size === template.size)
      if (media) {
        setCanvasSize({
          width: media.widthMm * 2,
          height: media.heightMm * 2
        })
      }
    }
  }, [template.size, labelMedia])

  // History management
  const addToHistory = (action: any) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(action)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      // Apply previous state
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      // Apply next state
    }
  }

  // Canvas interaction handlers
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (readonly) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((e.clientX - rect.left) / (zoom / 100))
    const y = ((e.clientY - rect.top) / (zoom / 100))

    if (currentTool !== 'select') {
      addElement(currentTool, x, y)
    } else {
      // Check if clicked on element
      const clickedElement = canvasElements.find(el => 
        x >= el.x && x <= el.x + el.width &&
        y >= el.y && y <= el.y + el.height
      )
      setSelectedElement(clickedElement?.id || null)
    }
  }

  const addElement = (type: string, x: number, y: number) => {
    const newElement: CanvasElement = {
      id: `${type}_${Date.now()}`,
      type: type as any,
      x: snapToGrid ? Math.round(x / 10) * 10 : x,
      y: snapToGrid ? Math.round(y / 10) * 10 : y,
      width: 80,
      height: type === 'text' ? 20 : 80,
      rotation: 0,
      properties: getDefaultProperties(type)
    }

    setCanvasElements([...canvasElements, newElement])
    setSelectedElement(newElement.id)
    addToHistory({ type: 'add', element: newElement })
  }

  const getDefaultProperties = (type: string) => {
    switch (type) {
      case 'text':
        return {
          text: 'Tekst',
          fontSize: 12,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          color: '#000000',
          align: 'left'
        }
      case 'qr':
        return {
          data: 'https://example.com',
          size: 80,
          errorCorrection: 'M'
        }
      case 'barcode':
        return {
          data: '123456789',
          format: 'CODE128',
          showText: true
        }
      case 'image':
        return {
          src: '',
          alt: 'Bilde',
          fit: 'contain'
        }
      case 'shape':
        return {
          shape: 'rectangle',
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 1
        }
      default:
        return {}
    }
  }

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    setCanvasElements(elements =>
      elements.map(el => el.id === id ? { ...el, ...updates } : el)
    )
    addToHistory({ type: 'update', elementId: id, updates })
  }

  const deleteElement = (id: string) => {
    setCanvasElements(elements => elements.filter(el => el.id !== id))
    setSelectedElement(null)
    addToHistory({ type: 'delete', elementId: id })
  }

  const handleSave = async () => {
    try {
      const templateData = {
        ...template,
        design: {
          elements: canvasElements,
          canvasSize,
          settings: {
            showGrid,
            snapToGrid,
            zoom
          }
        }
      }

      await upsertTemplateMutation.mutateAsync({
        id: templateId,
        ...templateData
      })
    } catch (error) {
      console.error('Feil ved lagring:', error)
    }
  }

  const handleValidate = async () => {
    if (templateId) {
      await validateTemplateMutation.mutateAsync({ templateId })
    }
  }

  const selectedElementData = canvasElements.find(el => el.id === selectedElement)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            value={template.name || ''}
            onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
            className="text-lg font-semibold border-none shadow-none p-0 h-auto"
            placeholder="Mal navn"
            readOnly={readonly}
          />
          <Badge variant="outline">
            {template.type} • {template.size}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0 || readonly}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1 || readonly}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Rediger' : 'Forhåndsvis'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={validateTemplateMutation.isLoading}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Valider
          </Button>
          {!readonly && (
            <Button
              onClick={handleSave}
              disabled={upsertTemplateMutation.isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {upsertTemplateMutation.isLoading ? 'Lagrer...' : 'Lagre'}
            </Button>
          )}
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              {readonly ? 'Lukk' : 'Avbryt'}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        {!readonly && !isPreviewMode && (
          <div className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-2">
            <Button
              variant={currentTool === 'select' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('select')}
              className="w-10 h-10 p-0"
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTool === 'text' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('text')}
              className="w-10 h-10 p-0"
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTool === 'qr' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('qr')}
              className="w-10 h-10 p-0"
            >
              <QrCode className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTool === 'barcode' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('barcode')}
              className="w-10 h-10 p-0"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTool === 'image' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('image')}
              className="w-10 h-10 p-0"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTool === 'shape' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('shape')}
              className="w-10 h-10 p-0"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1">
          {/* Canvas area */}
          <div className="flex-1 flex flex-col">
            {/* Canvas controls */}
            {!isPreviewMode && (
              <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="zoom" className="text-sm">Zoom:</Label>
                    <Select value={zoom.toString()} onValueChange={(value) => setZoom(parseInt(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="75">75%</SelectItem>
                        <SelectItem value="100">100%</SelectItem>
                        <SelectItem value="125">125%</SelectItem>
                        <SelectItem value="150">150%</SelectItem>
                        <SelectItem value="200">200%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id="grid"
                      checked={showGrid}
                      onCheckedChange={setShowGrid}
                    />
                    <Label htmlFor="grid" className="text-sm">Rutenett</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id="snap"
                      checked={snapToGrid}
                      onCheckedChange={setSnapToGrid}
                    />
                    <Label htmlFor="snap" className="text-sm">Fest til rutenett</Label>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {canvasSize.width/2}mm × {canvasSize.height/2}mm
                </div>
              </div>
            )}

            {/* Canvas */}
            <div className="flex-1 overflow-auto bg-gray-100 p-8">
              <div className="flex items-center justify-center min-h-full">
                <div
                  ref={canvasRef}
                  className="bg-white shadow-lg relative cursor-crosshair"
                  style={{
                    width: canvasSize.width * (zoom / 100),
                    height: canvasSize.height * (zoom / 100),
                    backgroundImage: showGrid ? 
                      `radial-gradient(circle, #ccc 1px, transparent 1px)` : 'none',
                    backgroundSize: showGrid ? 
                      `${10 * (zoom / 100)}px ${10 * (zoom / 100)}px` : 'none'
                  }}
                  onClick={handleCanvasClick}
                >
                  {/* Render canvas elements */}
                  {canvasElements.map((element) => (
                    <div
                      key={element.id}
                      className={`absolute border-2 ${
                        selectedElement === element.id 
                          ? 'border-blue-500 border-dashed' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{
                        left: element.x * (zoom / 100),
                        top: element.y * (zoom / 100),
                        width: element.width * (zoom / 100),
                        height: element.height * (zoom / 100),
                        transform: `rotate(${element.rotation}deg)`
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!readonly) setSelectedElement(element.id)
                      }}
                    >
                      {/* Element content based on type */}
                      {element.type === 'text' && (
                        <div
                          className="w-full h-full flex items-center"
                          style={{
                            fontSize: element.properties.fontSize * (zoom / 100),
                            fontFamily: element.properties.fontFamily,
                            fontWeight: element.properties.fontWeight,
                            color: element.properties.color,
                            textAlign: element.properties.align
                          }}
                        >
                          {element.properties.text}
                        </div>
                      )}
                      
                      {element.type === 'qr' && (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                          QR: {element.properties.data}
                        </div>
                      )}
                      
                      {element.type === 'barcode' && (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                          BC: {element.properties.data}
                        </div>
                      )}
                      
                      {element.type === 'image' && (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                          Bilde
                        </div>
                      )}
                      
                      {element.type === 'shape' && (
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundColor: element.properties.fill,
                            border: `${element.properties.strokeWidth}px solid ${element.properties.stroke}`
                          }}
                        />
                      )}

                      {/* Selection handles */}
                      {selectedElement === element.id && !readonly && (
                        <>
                          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 cursor-nw-resize"></div>
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 cursor-ne-resize"></div>
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 cursor-sw-resize"></div>
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 cursor-se-resize"></div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Properties panel */}
          {!isPreviewMode && (
            <div className="w-80 bg-white border-l flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Egenskaper</h3>
              </div>

              <div className="flex-1 overflow-auto">
                <Tabs defaultValue="template" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="template">Mal</TabsTrigger>
                    <TabsTrigger value="element" disabled={!selectedElementData}>Element</TabsTrigger>
                  </TabsList>

                  <TabsContent value="template" className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Navn</Label>
                      <Input
                        id="template-name"
                        value={template.name || ''}
                        onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                        readOnly={readonly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-description">Beskrivelse</Label>
                      <Textarea
                        id="template-description"
                        value={template.description || ''}
                        onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                        readOnly={readonly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-type">Type</Label>
                      <Select 
                        value={template.type || ''} 
                        onValueChange={(value) => setTemplate(prev => ({ ...prev, type: value as LabelType }))}
                        disabled={readonly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="QR">QR-kode</SelectItem>
                          <SelectItem value="BARCODE">Strekkode</SelectItem>
                          <SelectItem value="TEXT">Tekst</SelectItem>
                          <SelectItem value="SHIPPING">Frakt</SelectItem>
                          <SelectItem value="PRODUCT">Produkt</SelectItem>
                          <SelectItem value="CUSTOM">Tilpasset</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-size">Størrelse</Label>
                      <Select 
                        value={template.size || ''} 
                        onValueChange={(value) => setTemplate(prev => ({ ...prev, size: value as LabelSize }))}
                        disabled={readonly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {labelMedia?.map((media) => (
                            <SelectItem key={media.size} value={media.size}>
                              {media.size} ({media.widthMm}×{media.heightMm}mm)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="element" className="p-4 space-y-4">
                    {selectedElementData && (
                      <>
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium capitalize">{selectedElementData.type}</h4>
                          {!readonly && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteElement(selectedElementData.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Position and size */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">X</Label>
                            <Input
                              type="number"
                              value={selectedElementData.x}
                              onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                              readOnly={readonly}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Y</Label>
                            <Input
                              type="number"
                              value={selectedElementData.y}
                              onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) || 0 })}
                              readOnly={readonly}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Bredde</Label>
                            <Input
                              type="number"
                              value={selectedElementData.width}
                              onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) || 0 })}
                              readOnly={readonly}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Høyde</Label>
                            <Input
                              type="number"
                              value={selectedElementData.height}
                              onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 0 })}
                              readOnly={readonly}
                            />
                          </div>
                        </div>

                        {/* Element-specific properties */}
                        {selectedElementData.type === 'text' && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>Tekst</Label>
                              <Input
                                value={selectedElementData.properties.text || ''}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  properties: { ...selectedElementData.properties, text: e.target.value }
                                })}
                                readOnly={readonly}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Skriftstørrelse</Label>
                              <Slider
                                value={[selectedElementData.properties.fontSize || 12]}
                                onValueChange={([value]) => updateElement(selectedElementData.id, {
                                  properties: { ...selectedElementData.properties, fontSize: value }
                                })}
                                min={8}
                                max={72}
                                step={1}
                                disabled={readonly}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Farge</Label>
                              <Input
                                type="color"
                                value={selectedElementData.properties.color || '#000000'}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  properties: { ...selectedElementData.properties, color: e.target.value }
                                })}
                                readOnly={readonly}
                              />
                            </div>
                          </div>
                        )}

                        {selectedElementData.type === 'qr' && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>QR Data</Label>
                              <Input
                                value={selectedElementData.properties.data || ''}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  properties: { ...selectedElementData.properties, data: e.target.value }
                                })}
                                readOnly={readonly}
                              />
                            </div>
                          </div>
                        )}

                        {selectedElementData.type === 'barcode' && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>Strekkode Data</Label>
                              <Input
                                value={selectedElementData.properties.data || ''}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  properties: { ...selectedElementData.properties, data: e.target.value }
                                })}
                                readOnly={readonly}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Format</Label>
                              <Select
                                value={selectedElementData.properties.format || 'CODE128'}
                                onValueChange={(value) => updateElement(selectedElementData.id, {
                                  properties: { ...selectedElementData.properties, format: value }
                                })}
                                disabled={readonly}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CODE128">CODE128</SelectItem>
                                  <SelectItem value="CODE39">CODE39</SelectItem>
                                  <SelectItem value="EAN13">EAN13</SelectItem>
                                  <SelectItem value="UPC">UPC</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Validation results */}
      {validateTemplateMutation.data && (
        <Dialog open={!!validateTemplateMutation.data} onOpenChange={() => validateTemplateMutation.reset()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Valideringsresultat</DialogTitle>
              <DialogDescription>
                Resultatet av mal-validering
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {validateTemplateMutation.data.isValid ? (
                <div className="flex items-center gap-2 text-green-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>Malen er gyldig og klar for bruk!</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-red-700 mb-3">
                    <AlertCircle className="h-4 w-4" />
                    <span>Malen har valideringsfeil:</span>
                  </div>
                  <ul className="space-y-1 text-sm text-red-600">
                    {validateTemplateMutation.data.errors?.map((error: string, index: number) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}