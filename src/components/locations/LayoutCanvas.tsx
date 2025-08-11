'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Move,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Download,
  Upload,
  Save,
  Trash2,
  Plus,
  Grid3X3,
  Image as ImageIcon,
  MousePointer,
  Square,
  Circle,
  Minus
} from 'lucide-react'

interface LayoutItem {
  id: string
  type: 'location' | 'furniture' | 'wall' | 'door' | 'window'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  color: string
  label: string
  locationId?: string
}

interface LayoutCanvasProps {
  roomId?: string
  locations: any[]
  onSave: (layout: LayoutItem[]) => void
  initialLayout?: LayoutItem[]
}

export function LayoutCanvas({ roomId, locations, onSave, initialLayout = [] }: LayoutCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [items, setItems] = useState<LayoutItem[]>(initialLayout)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [tool, setTool] = useState<'select' | 'rectangle' | 'circle' | 'line'>('select')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)

  // Canvas drawing
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context
    ctx.save()

    // Apply zoom and pan
    ctx.scale(zoom, zoom)
    ctx.translate(pan.x, pan.y)

    // Draw background image if available
    if (backgroundImage) {
      const img = new Image()
      img.onload = () => {
        ctx.globalAlpha = 0.5
        ctx.drawImage(img, 0, 0, canvas.width / zoom, canvas.height / zoom)
        ctx.globalAlpha = 1
      }
      img.src = backgroundImage
    }

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e5e5'
      ctx.lineWidth = 1
      const gridSize = 20
      
      for (let x = 0; x <= canvas.width / zoom; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height / zoom)
        ctx.stroke()
      }
      
      for (let y = 0; y <= canvas.height / zoom; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width / zoom, y)
        ctx.stroke()
      }
    }

    // Draw items
    items.forEach(item => {
      ctx.save()
      
      // Apply item transformations
      ctx.translate(item.x + item.width / 2, item.y + item.height / 2)
      ctx.rotate((item.rotation * Math.PI) / 180)
      ctx.translate(-item.width / 2, -item.height / 2)

      // Set styles based on item type
      ctx.fillStyle = item.color
      ctx.strokeStyle = selectedItem === item.id ? '#3b82f6' : '#666'
      ctx.lineWidth = selectedItem === item.id ? 3 : 1

      // Draw item based on type
      switch (item.type) {
        case 'location':
          ctx.fillRect(0, 0, item.width, item.height)
          ctx.strokeRect(0, 0, item.width, item.height)
          break
        case 'furniture':
          ctx.fillRect(0, 0, item.width, item.height)
          ctx.strokeRect(0, 0, item.width, item.height)
          break
        case 'wall':
          ctx.fillRect(0, 0, item.width, item.height)
          break
        case 'door':
          // Draw door arc
          ctx.beginPath()
          ctx.arc(0, 0, item.width, 0, Math.PI / 2)
          ctx.stroke()
          break
        case 'window':
          ctx.strokeRect(0, 0, item.width, item.height)
          ctx.beginPath()
          ctx.moveTo(0, item.height / 2)
          ctx.lineTo(item.width, item.height / 2)
          ctx.stroke()
          break
      }

      // Draw label
      if (item.label) {
        ctx.fillStyle = '#000'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(item.label, item.width / 2, item.height / 2 + 4)
      }

      ctx.restore()
    })

    // Restore context
    ctx.restore()
  }, [items, selectedItem, zoom, pan, showGrid, backgroundImage])

  // Redraw canvas when dependencies change
  useEffect(() => {
    draw()
  }, [draw])

  // Handle canvas mouse events
  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - pan.x * zoom) / zoom,
      y: (e.clientY - rect.top - pan.y * zoom) / zoom
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e)
    setDragStart(pos)

    if (tool === 'select') {
      // Find item under cursor
      const clickedItem = items.find(item => 
        pos.x >= item.x && pos.x <= item.x + item.width &&
        pos.y >= item.y && pos.y <= item.y + item.height
      )
      
      if (clickedItem) {
        setSelectedItem(clickedItem.id)
        setIsDragging(true)
      } else {
        setSelectedItem(null)
      }
    } else {
      // Start creating new item
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const pos = getMousePos(e)

    if (tool === 'select' && selectedItem) {
      // Move selected item
      const deltaX = pos.x - dragStart.x
      const deltaY = pos.y - dragStart.y

      setItems(prev => prev.map(item => 
        item.id === selectedItem 
          ? { ...item, x: item.x + deltaX, y: item.y + deltaY }
          : item
      ))
      
      setDragStart(pos)
    } else if (tool !== 'select') {
      // Drawing new item
      const width = Math.abs(pos.x - dragStart.x)
      const height = Math.abs(pos.y - dragStart.y)
      const x = Math.min(pos.x, dragStart.x)
      const y = Math.min(pos.y, dragStart.y)

      // Update preview (you could show a preview here)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (tool !== 'select' && isDragging) {
      const pos = getMousePos(e)
      const width = Math.abs(pos.x - dragStart.x)
      const height = Math.abs(pos.y - dragStart.y)
      const x = Math.min(pos.x, dragStart.x)
      const y = Math.min(pos.y, dragStart.y)

      if (width > 10 && height > 10) {
        const newItem: LayoutItem = {
          id: Math.random().toString(36).substr(2, 9),
          type: tool === 'rectangle' ? 'furniture' : 'location',
          x,
          y,
          width,
          height,
          rotation: 0,
          color: tool === 'rectangle' ? '#fbbf24' : '#3b82f6',
          label: `${tool === 'rectangle' ? 'Møbel' : 'Lokasjon'} ${items.length + 1}`
        }

        setItems(prev => [...prev, newItem])
      }
    }

    setIsDragging(false)
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3))

  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSelectedItem(null)
  }

  const handleDeleteSelected = () => {
    if (selectedItem) {
      setItems(prev => prev.filter(item => item.id !== selectedItem))
      setSelectedItem(null)
    }
  }

  const handleAddLocation = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId)
    if (!location) return

    const newItem: LayoutItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'location',
      x: 50,
      y: 50,
      width: 80,
      height: 60,
      rotation: 0,
      color: '#3b82f6',
      label: location.name,
      locationId: location.id
    }

    setItems(prev => [...prev, newItem])
  }

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setBackgroundImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const selectedItemData = selectedItem ? items.find(item => item.id === selectedItem) : null

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b p-4 space-y-4">
        {/* Main tools */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={tool === 'select' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('select')}
            >
              <MousePointer className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'rectangle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('rectangle')}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'circle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('circle')}
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'line' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('line')}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center border rounded-lg">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="px-2 text-sm">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid3X3 className="w-4 h-4 mr-1" />
            Grid
          </Button>

          <div>
            <Label htmlFor="background-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Bakgrunn
                </span>
              </Button>
            </Label>
            <Input
              id="background-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadImage}
            />
          </div>
        </div>

        {/* Location dropdown and save */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Legg til lokasjon
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Velg lokasjon</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {locations.map(location => (
                  <DropdownMenuItem 
                    key={location.id}
                    onClick={() => handleAddLocation(location.id)}
                  >
                    {location.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedItem && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteSelected}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Slett
              </Button>
            )}
          </div>

          <Button onClick={() => onSave(items)}>
            <Save className="w-4 h-4 mr-1" />
            Lagre layout
          </Button>
        </div>
      </div>

      {/* Canvas and properties */}
      <div className="flex flex-1">
        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>

        {/* Properties panel */}
        {selectedItemData && (
          <div className="w-64 border-l p-4 space-y-4">
            <h3 className="font-medium">Egenskaper</h3>
            
            <div>
              <Label htmlFor="item-label">Navn</Label>
              <Input
                id="item-label"
                value={selectedItemData.label}
                onChange={(e) => {
                  setItems(prev => prev.map(item => 
                    item.id === selectedItem 
                      ? { ...item, label: e.target.value }
                      : item
                  ))
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="item-x">X</Label>
                <Input
                  id="item-x"
                  type="number"
                  value={Math.round(selectedItemData.x)}
                  onChange={(e) => {
                    const x = parseInt(e.target.value) || 0
                    setItems(prev => prev.map(item => 
                      item.id === selectedItem 
                        ? { ...item, x }
                        : item
                    ))
                  }}
                />
              </div>
              <div>
                <Label htmlFor="item-y">Y</Label>
                <Input
                  id="item-y"
                  type="number"
                  value={Math.round(selectedItemData.y)}
                  onChange={(e) => {
                    const y = parseInt(e.target.value) || 0
                    setItems(prev => prev.map(item => 
                      item.id === selectedItem 
                        ? { ...item, y }
                        : item
                    ))
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="item-width">Bredde</Label>
                <Input
                  id="item-width"
                  type="number"
                  value={Math.round(selectedItemData.width)}
                  onChange={(e) => {
                    const width = parseInt(e.target.value) || 1
                    setItems(prev => prev.map(item => 
                      item.id === selectedItem 
                        ? { ...item, width }
                        : item
                    ))
                  }}
                />
              </div>
              <div>
                <Label htmlFor="item-height">Høyde</Label>
                <Input
                  id="item-height"
                  type="number"
                  value={Math.round(selectedItemData.height)}
                  onChange={(e) => {
                    const height = parseInt(e.target.value) || 1
                    setItems(prev => prev.map(item => 
                      item.id === selectedItem 
                        ? { ...item, height }
                        : item
                    ))
                  }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="item-color">Farge</Label>
              <Input
                id="item-color"
                type="color"
                value={selectedItemData.color}
                onChange={(e) => {
                  setItems(prev => prev.map(item => 
                    item.id === selectedItem 
                      ? { ...item, color: e.target.value }
                      : item
                  ))
                }}
              />
            </div>

            {selectedItemData.locationId && (
              <div>
                <Label>Tilknyttet lokasjon</Label>
                <Badge variant="outline" className="mt-1">
                  {locations.find(loc => loc.id === selectedItemData.locationId)?.name}
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="border-t px-4 py-2 text-sm text-muted-foreground">
        {items.length} objekter • {selectedItem ? 'Valgt: ' + selectedItemData?.label : 'Ingen valgt'}
      </div>
    </div>
  )
}
