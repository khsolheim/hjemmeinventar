'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Edit3,
  Trash2,
  Move,
  Copy,
  Download,
  Upload,
  Printer,
  Tag,
  FolderOpen,
  MoreHorizontal,
  X,
  Undo,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface BulkOperation {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  message?: string
}

interface BulkActionsToolbarProps {
  selectedCount: number
  selectedLocations: any[]
  onBulkEdit: () => void
  onBulkDelete: () => void
  onBulkMove: () => void
  onBulkExport: () => void
  onBulkPrint: () => void
  onDeselectAll: () => void
  onClose: () => void
}

export function BulkActionsToolbar({
  selectedCount,
  selectedLocations,
  onBulkEdit,
  onBulkDelete,
  onBulkMove,
  onBulkExport,
  onBulkPrint,
  onDeselectAll,
  onClose
}: BulkActionsToolbarProps) {
  const [operations, setOperations] = useState<BulkOperation[]>([])
  const [showProgress, setShowProgress] = useState(false)

  const addOperation = (name: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newOperation: BulkOperation = {
      id,
      name,
      status: 'running',
      progress: 0
    }
    
    setOperations(prev => [...prev, newOperation])
    setShowProgress(true)
    
    // Simulate progress
    const interval = setInterval(() => {
      setOperations(prev => prev.map(op => {
        if (op.id === id && op.status === 'running') {
          const newProgress = Math.min(100, op.progress + Math.random() * 20)
          
          if (newProgress >= 100) {
            clearInterval(interval)
            return { ...op, progress: 100, status: 'completed' }
          }
          
          return { ...op, progress: newProgress }
        }
        return op
      }))
    }, 200)
    
    // Auto-remove completed operations after 3 seconds
    setTimeout(() => {
      setOperations(prev => prev.filter(op => op.id !== id))
      if (operations.length <= 1) {
        setShowProgress(false)
      }
    }, 3000)
  }

  const handleBulkEdit = () => {
    addOperation(`Redigerer ${selectedCount} lokasjoner`)
    onBulkEdit()
  }

  const handleBulkDelete = () => {
    if (confirm(`Er du sikker på at du vil slette ${selectedCount} lokasjoner? Dette kan ikke angres.`)) {
      addOperation(`Sletter ${selectedCount} lokasjoner`)
      onBulkDelete()
    }
  }

  const handleBulkMove = () => {
    addOperation(`Flytter ${selectedCount} lokasjoner`)
    onBulkMove()
  }

  const handleBulkExport = () => {
    addOperation(`Eksporterer ${selectedCount} lokasjoner`)
    onBulkExport()
  }

  const handleBulkPrint = () => {
    addOperation(`Skriver ut ${selectedCount} QR-koder`)
    onBulkPrint()
  }

  const canDelete = selectedLocations.every(loc => 
    (!loc.children || loc.children.length === 0) && 
    (!loc._count?.items || loc._count.items === 0)
  )

  const hasRooms = selectedLocations.some(loc => loc.type === 'ROOM')
  const hasContainers = selectedLocations.some(loc => 
    ['BOX', 'CONTAINER', 'DRAWER', 'BAG'].includes(loc.type)
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
      {/* Progress indicator */}
      {showProgress && operations.length > 0 && (
        <div className="px-4 py-2 border-b bg-blue-50">
          <div className="space-y-2">
            {operations.map((operation) => (
              <div key={operation.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  {operation.status === 'running' && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                  {operation.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {operation.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">{operation.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={operation.progress} className="w-20 h-2" />
                  <span className="text-xs text-muted-foreground w-8">
                    {Math.round(operation.progress)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main toolbar */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-medium">
              {selectedCount} valgt
            </Badge>
            
            <div className="flex items-center gap-1">
              {/* Primary actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkEdit}
                disabled={selectedCount === 0}
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Rediger
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkMove}
                disabled={selectedCount === 0}
              >
                <Move className="w-4 h-4 mr-1" />
                Flytt
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkPrint}
                disabled={selectedCount === 0}
              >
                <Printer className="w-4 h-4 mr-1" />
                Skriv ut
              </Button>

              {/* More actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={selectedCount === 0}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Bulk handlinger</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleBulkExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Eksporter til CSV
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => {
                      // Copy QR codes to clipboard
                      const qrCodes = selectedLocations.map(loc => loc.qrCode).join(', ')
                      navigator.clipboard.writeText(qrCodes)
                      toast.success('QR-koder kopiert til utklippstavle')
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Kopier QR-koder
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem>
                    <Tag className="w-4 h-4 mr-2" />
                    Legg til tags
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem>
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Endre kategori
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleBulkDelete}
                    disabled={!canDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Slett alle
                    {!canDelete && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Ikke mulig
                      </Badge>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick stats */}
            <div className="text-xs text-muted-foreground mr-2">
              {hasRooms && (
                <Badge variant="outline" className="mr-1">
                  {selectedLocations.filter(loc => loc.type === 'ROOM').length} rom
                </Badge>
              )}
              {hasContainers && (
                <Badge variant="outline" className="mr-1">
                  {selectedLocations.filter(loc => 
                    ['BOX', 'CONTAINER', 'DRAWER', 'BAG'].includes(loc.type)
                  ).length} beholdere
                </Badge>
              )}
            </div>

            {/* Deselect and close */}
            <Button variant="ghost" size="sm" onClick={onDeselectAll}>
              Fjern alle
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick selection shortcuts */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">Hurtigvalg:</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => {
              // Select all rooms
              toast.info('Velger alle rom...')
            }}
          >
            Alle rom
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => {
              // Select all empty locations
              toast.info('Velger alle tomme lokasjoner...')
            }}
          >
            Tomme
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => {
              // Select all with items
              toast.info('Velger alle med gjenstander...')
            }}
          >
            Med innhold
          </Button>
        </div>
      </div>
    </div>
  )
}
