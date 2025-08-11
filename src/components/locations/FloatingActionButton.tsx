'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Home,
  Package,
  Archive,
  Folder,
  FileText,
  QrCode,
  Search,
  Zap,
  Layers,
  ShoppingBag,
  MapPin
} from 'lucide-react'

interface FABProps {
  onCreateLocation: (template?: any) => void
  onScanQR: () => void
  onSearch: () => void
}

const locationTemplates = [
  {
    id: 'room',
    name: 'Nytt rom',
    type: 'ROOM',
    icon: Home,
    description: 'Opprett et nytt rom'
  },
  {
    id: 'shelf',
    name: 'Ny reol',
    type: 'SHELF',
    icon: Package,
    description: 'Legg til en reol eller bokhylle'
  },
  {
    id: 'box',
    name: 'Ny boks',
    type: 'BOX',
    icon: Archive,
    description: 'Opprett en oppbevaringsboks'
  },
  {
    id: 'drawer',
    name: 'Ny skuff',
    type: 'DRAWER',
    icon: Folder,
    description: 'Legg til en skuff'
  },
  {
    id: 'cabinet',
    name: 'Nytt skap',
    type: 'CABINET',
    icon: FileText,
    description: 'Opprett et skap eller kommode'
  },
  {
    id: 'bag',
    name: 'Ny pose',
    type: 'BAG',
    icon: ShoppingBag,
    description: 'Legg til en pose eller bag'
  }
]

export function FloatingActionButton({ onCreateLocation, onScanQR, onSearch }: FABProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTemplateSelect = (template: any) => {
    onCreateLocation({
      type: template.type,
      name: '', // Will be filled by user
      template: template.id
    })
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            aria-label="Hurtighandlinger"
          >
            <Plus className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          side="top" 
          align="end" 
          className="w-64 mb-2"
          sideOffset={8}
        >
          <DropdownMenuLabel className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Hurtighandlinger
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Quick actions */}
          <DropdownMenuItem onClick={onSearch} className="cursor-pointer">
            <Search className="w-4 h-4 mr-3" />
            <div>
              <div className="font-medium">Søk</div>
              <div className="text-xs text-muted-foreground">Finn lokasjoner raskt</div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onScanQR} className="cursor-pointer">
            <QrCode className="w-4 h-4 mr-3" />
            <div>
              <div className="font-medium">Skann QR-kode</div>
              <div className="text-xs text-muted-foreground">Finn lokasjon ved skanning</div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wide">
            Opprett ny lokasjon
          </DropdownMenuLabel>
          
          {/* Location templates */}
          {locationTemplates.map((template) => {
            const Icon = template.icon
            return (
              <DropdownMenuItem 
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="cursor-pointer"
              >
                <Icon className="w-4 h-4 mr-3" />
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.description}</div>
                </div>
              </DropdownMenuItem>
            )
          })}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => onCreateLocation()}
            className="cursor-pointer"
          >
            <MapPin className="w-4 h-4 mr-3" />
            <div>
              <div className="font-medium">Tilpasset lokasjon</div>
              <div className="text-xs text-muted-foreground">Opprett med alle alternativer</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
