export class VoiceCommandService {
  private recognition: any
  private isListening = false
  private onResult: ((command: string) => void) | null = null
  private onError: ((error: string) => void) | null = null

  constructor() {
    this.initializeRecognition()
  }

  private initializeRecognition() {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = 'nb-NO' // Norwegian

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        if (this.onResult) {
          this.onResult(transcript)
        }
      }

      this.recognition.onerror = (event: any) => {
        if (this.onError) {
          this.onError(event.error)
        }
      }

      this.recognition.onend = () => {
        this.isListening = false
      }
    }
  }

  startListening(onResult: (command: string) => void, onError: (error: string) => void) {
    if (!this.recognition) {
      onError('Stemmegjenkjenning er ikke tilgjengelig i denne nettleseren')
      return
    }

    this.onResult = onResult
    this.onError = onError
    this.isListening = true

    try {
      this.recognition.start()
    } catch (error) {
      onError('Kunne ikke starte stemmegjenkjenning')
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
  }

  getListeningStatus(): boolean {
    return this.isListening
  }

  // Process voice commands and return structured actions
  processCommand(command: string): VoiceCommandResult {
    const lowerCommand = command.toLowerCase()
    
    // Add item commands
    if (lowerCommand.includes('legg til') || lowerCommand.includes('registrer')) {
      const itemName = this.extractItemName(command)
      return {
        action: 'add-item',
        itemName,
        confidence: 0.8
      }
    }

    // Find item commands
    if (lowerCommand.includes('finn') || lowerCommand.includes('hvor er') || lowerCommand.includes('vis meg')) {
      const itemName = this.extractItemName(command)
      return {
        action: 'find-item',
        itemName,
        confidence: 0.9
      }
    }

    // Move item commands
    if (lowerCommand.includes('flytt') || lowerCommand.includes('plasser')) {
      const itemName = this.extractItemName(command)
      const location = this.extractLocation(command)
      return {
        action: 'move-item',
        itemName,
        location,
        confidence: 0.7
      }
    }

    // Scan commands
    if (lowerCommand.includes('skann') || lowerCommand.includes('qr')) {
      return {
        action: 'scan-qr',
        confidence: 0.9
      }
    }

    // Camera commands
    if (lowerCommand.includes('bilde') || lowerCommand.includes('kamera') || lowerCommand.includes('foto')) {
      return {
        action: 'take-photo',
        confidence: 0.8
      }
    }

    // Help commands
    if (lowerCommand.includes('hjelp') || lowerCommand.includes('hva kan jeg')) {
      return {
        action: 'show-help',
        confidence: 0.9
      }
    }

    // Default: search
    return {
      action: 'search',
      query: command,
      confidence: 0.5
    }
  }

  private extractItemName(command: string): string {
    // Simple extraction - in a real implementation, this would use NLP
    const words = command.split(' ')
    const itemKeywords = ['legg til', 'registrer', 'finn', 'hvor er', 'vis meg', 'flytt', 'plasser']
    
    for (const keyword of itemKeywords) {
      if (command.toLowerCase().includes(keyword)) {
        const parts = command.toLowerCase().split(keyword)
        if (parts.length > 1) {
          return parts[1].trim()
        }
      }
    }
    
    return command
  }

  private extractLocation(command: string): string {
    const locationKeywords = ['til', 'i', 'på', 'under', 'over']
    const words = command.split(' ')
    
    for (let i = 0; i < words.length; i++) {
      if (locationKeywords.includes(words[i].toLowerCase()) && i + 1 < words.length) {
        return words[i + 1]
      }
    }
    
    return ''
  }

  // Get available voice commands for help
  getAvailableCommands(): VoiceCommand[] {
    return [
      {
        command: 'legg til [gjenstand]',
        description: 'Registrer en ny gjenstand',
        example: 'legg til kaffemaskin'
      },
      {
        command: 'finn [gjenstand]',
        description: 'Finn en gjenstand',
        example: 'finn strikkepinner'
      },
      {
        command: 'flytt [gjenstand] til [lokasjon]',
        description: 'Flytt en gjenstand',
        example: 'flytt laptop til soverom'
      },
      {
        command: 'skann qr',
        description: 'Start QR-skanning',
        example: 'skann qr-kode'
      },
      {
        command: 'ta bilde',
        description: 'Ta bilde av gjenstand',
        example: 'ta bilde av gjenstanden'
      },
      {
        command: 'hjelp',
        description: 'Vis tilgjengelige kommandoer',
        example: 'hva kan jeg si?'
      }
    ]
  }
}

export interface VoiceCommandResult {
  action: string
  itemName?: string
  location?: string
  query?: string
  confidence: number
}

export interface VoiceCommand {
  command: string
  description: string
  example: string
}

// Singleton instance
export const voiceCommandService = new VoiceCommandService()
