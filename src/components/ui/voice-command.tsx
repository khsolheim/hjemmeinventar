'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Loader2,
  Check,
  X,
  HelpCircle
} from 'lucide-react'
import { voiceCommandService, VoiceCommandResult } from '@/lib/services/voice-command-service'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'
import { toast } from 'sonner'

interface VoiceCommandProps {
  onCommand?: (result: VoiceCommandResult) => void
  onError?: (error: string) => void
  className?: string
}

export function VoiceCommand({ onCommand, onError, className }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [lastCommand, setLastCommand] = useState<VoiceCommandResult | null>(null)
  const haptic = useHapticFeedback()

  const handleStartListening = () => {
    if (!voiceCommandService.isSupported()) {
      toast.error('Stemmegjenkjenning er ikke tilgjengelig i denne nettleseren')
      return
    }

    haptic.light()
    setIsListening(true)
    setTranscript('')
    setLastCommand(null)

    voiceCommandService.startListening(
      (command) => {
        setTranscript(command)
        setProcessing(true)
        
        // Process the command
        const result = voiceCommandService.processCommand(command)
        setLastCommand(result)
        
        // Execute the command
        if (onCommand) {
          onCommand(result)
        }
        
        setProcessing(false)
        setIsListening(false)
        
        // Haptic feedback for successful command
        haptic.success()
        
        // Show success feedback
        toast.success(`Kommando utført: ${result.action}`)
      },
      (error) => {
        setIsListening(false)
        setProcessing(false)
        
        // Haptic feedback for error
        haptic.error()
        
        toast.error(`Stemmegjenkjenning feilet: ${error}`)
        if (onError) {
          onError(error)
        }
      }
    )
  }

  const handleStopListening = () => {
    voiceCommandService.stopListening()
    setIsListening(false)
    setProcessing(false)
  }

  const handleHelpClick = () => {
    setShowHelp(!showHelp)
  }

  useEffect(() => {
    return () => {
      voiceCommandService.stopListening()
    }
  }, [])

  if (!voiceCommandService.isSupported()) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <MicOff className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Stemmegjenkjenning er ikke tilgjengelig
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Main Voice Button */}
      <div className="flex items-center gap-2">
        <Button
          onClick={isListening ? handleStopListening : handleStartListening}
          disabled={processing}
          className={`w-12 h-12 rounded-full ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-primary hover:bg-primary/90'
          }`}
          size="icon"
        >
          {processing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>

        <Button
          onClick={handleHelpClick}
          variant="outline"
          size="icon"
          className="w-8 h-8"
        >
          <HelpCircle className="w-4 h-4" />
        </Button>
      </div>

      {/* Status Display */}
      {isListening && (
        <div className="mt-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Lytter...</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Si en kommando eller klikk for å stoppe
          </p>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="mt-2 p-2 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Du sa:</span> {transcript}
          </p>
        </div>
      )}

      {/* Command Result */}
      {lastCommand && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Kommando gjenkjent
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-700">Handling:</span>
              <Badge variant="outline" className="text-xs bg-white">
                {lastCommand.action}
              </Badge>
            </div>
            {lastCommand.itemName && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-700">Gjenstand:</span>
                <Badge variant="outline" className="text-xs bg-white">
                  {lastCommand.itemName}
                </Badge>
              </div>
            )}
            {lastCommand.location && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-700">Lokasjon:</span>
                <Badge variant="outline" className="text-xs bg-white">
                  {lastCommand.location}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-700">Sikkerhet:</span>
              <Badge variant="outline" className="text-xs bg-white">
                {Math.round(lastCommand.confidence * 100)}%
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Stemmekommandoer
            </CardTitle>
            <CardDescription>
              Tilgjengelige kommandoer for hands-free operasjon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {voiceCommandService.getAvailableCommands().map((cmd, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{cmd.command}</span>
                    <Badge variant="secondary" className="text-xs">
                      Eksempel
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {cmd.description}
                  </p>
                  <p className="text-xs bg-muted p-2 rounded">
                    "{cmd.example}"
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Tips:</strong> Snakk tydelig og hold en normal avstand til mikrofonen. 
                Du kan si "hjelp" når som helst for å se tilgjengelige kommandoer.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
