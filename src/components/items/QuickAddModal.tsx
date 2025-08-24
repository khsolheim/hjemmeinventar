'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Camera, 
  QrCode, 
  Mic, 
  Plus, 
  X,
  Sparkles,
  Check
} from 'lucide-react'
import { CameraQuickAdd } from './CameraQuickAdd'
import { BarcodeQuickAdd } from './BarcodeQuickAdd'
import { TextQuickAdd } from './TextQuickAdd'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'camera' | 'barcode' | 'text'
}

export function QuickAddModal({ isOpen, onClose, mode = 'text' }: QuickAddModalProps) {
  const [activeMode, setActiveMode] = useState(mode)
  const [isProcessing, setIsProcessing] = useState(false)
  const haptic = useHapticFeedback()

  const modes = [
    {
      id: 'camera',
      title: 'Kamera',
      description: 'Ta bilde og få AI-forslag',
      icon: Camera,
      color: 'bg-blue-500'
    },
    {
      id: 'barcode',
      title: 'Strekkode',
      description: 'Skann QR-kode eller strekkode',
      icon: QrCode,
      color: 'bg-purple-500'
    },
    {
      id: 'text',
      title: 'Tekst',
      description: 'Skriv inn manuelt',
      icon: Plus,
      color: 'bg-green-500'
    }
  ]

  const handleModeChange = (newMode: string) => {
    setActiveMode(newMode as 'camera' | 'barcode' | 'text')
    haptic.selection()
  }

  const handleComplete = () => {
    setIsProcessing(false)
    haptic.addItemSuccess()
    onClose()
  }

  const renderModeContent = () => {
    switch (activeMode) {
      case 'camera':
        return (
          <CameraQuickAdd
            onComplete={handleComplete}
            onProcessingChange={setIsProcessing}
          />
        )
      case 'barcode':
        return (
          <BarcodeQuickAdd
            onComplete={handleComplete}
            onProcessingChange={setIsProcessing}
          />
        )
      case 'text':
        return (
          <TextQuickAdd
            onComplete={handleComplete}
            onProcessingChange={setIsProcessing}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Rask Legg Til
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Velg hvordan du vil legge til en gjenstand
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6">
          <Tabs value={activeMode} onValueChange={handleModeChange}>
            <TabsList className="grid w-full grid-cols-3">
              {modes.map((mode) => (
                <TabsTrigger
                  key={mode.id}
                  value={mode.id}
                  className="flex flex-col items-center gap-1 py-3"
                  disabled={isProcessing}
                >
                  <div className={`w-8 h-8 rounded-full ${mode.color} flex items-center justify-center`}>
                    <mode.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{mode.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6">
              {renderModeContent()}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
