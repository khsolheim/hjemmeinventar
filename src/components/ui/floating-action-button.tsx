'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Camera, QrCode, Mic, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VoiceCommand } from './voice-command'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface FloatingActionButtonProps {
  className?: string
  onQuickAdd?: () => void
  onCamera?: () => void
  onQRScan?: () => void
  onVoice?: () => void
}

export function FloatingActionButton({
  className,
  onQuickAdd,
  onCamera,
  onQRScan,
  onVoice
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const haptic = useHapticFeedback()

  const quickActions = [
    {
      id: 'quick-add',
      icon: Plus,
      label: 'Legg til',
      onClick: onQuickAdd,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'camera',
      icon: Camera,
      label: 'Kamera',
      onClick: onCamera,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'qr-scan',
      icon: QrCode,
      label: 'QR Skann',
      onClick: onQRScan,
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  const handleMainButtonClick = () => {
    haptic.light()
    if (isExpanded) {
      setIsExpanded(false)
    } else {
      setIsExpanded(true)
    }
  }

  const handleActionClick = (action: any) => {
    setIsExpanded(false)
    haptic.selection()
    if (action.onClick) {
      action.onClick()
    }
  }

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      {/* Voice Command */}
      <div className="absolute bottom-16 right-0 mb-4">
        <VoiceCommand
          onCommand={(result) => {
            // Handle voice commands
            switch (result.action) {
              case 'add-item':
                if (onQuickAdd) onQuickAdd()
                break
              case 'scan-qr':
                if (onQRScan) onQRScan()
                break
              case 'take-photo':
                if (onCamera) onCamera()
                break
              default:
                console.log('Voice command:', result)
            }
          }}
          onError={(error) => {
            console.error('Voice command error:', error)
          }}
        />
      </div>

      {/* Quick Actions */}
      {isExpanded && (
        <div className="absolute bottom-32 right-0 space-y-3">
          {quickActions.map((action, index) => (
            <div
              key={action.id}
              className="flex items-center gap-3 animate-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-background rounded-lg shadow-lg px-3 py-2 whitespace-nowrap">
                <span className="text-sm font-medium">{action.label}</span>
              </div>
              <Button
                onClick={() => handleActionClick(action)}
                className={cn('w-12 h-12 shadow-lg', action.color)}
                size="icon"
              >
                <action.icon className="w-5 h-5 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={handleMainButtonClick}
        className="w-14 h-14 bg-primary shadow-lg hover:bg-primary/90"
        size="icon"
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </Button>
    </div>
  )
}
