'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Star,
  Award,
  Trophy,
  Crown,
  Rocket,
  Sparkles,
  Mic as Microphone,
  MicOff as Mute,
  Volume2 as Audio,
  VolumeX as Silent,
  Play as Start,
  Pause as Stop,
  Square as End,
  Settings as Config,
  RefreshCw as Update,
  CheckCircle as Success,
  XCircle as Error,
  AlertTriangle as Warning,
  Info as Details,
  Star as Favorite,
  Award as Prize,
  Trophy as Victory,
  Crown as King,
  Rocket as Launch,
  Sparkles as Magic,
  Mic as Voice,
  MicOff as Disabled,
  Volume2 as Sound,
  VolumeX as Quiet,
  Play as Run,
  Pause as Halt,
  Square as Reset,
  Settings as Setup,
  RefreshCw as Reload,
  CheckCircle as Done,
  XCircle as Fail,
  AlertTriangle as Notice,
  Info as Help,
  Star as Rate,
  Award as Win,
  Trophy as Success,
  Crown as Leader,
  Rocket as Boost,
  Sparkles as Shine,
  Brain,
  MessageSquare,
  Languages,
  Headphones
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedVoiceProps {
  className?: string
}

export function AdvancedVoice({ className }: AdvancedVoiceProps) {
  const [selectedTab, setSelectedTab] = useState<'assistant' | 'commands' | 'analytics' | 'settings'>('assistant')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [recognition, setRecognition] = useState<any>(null)
  const [synthesis, setSynthesis] = useState<any>(null)
  const haptic = useHapticFeedback()

  // Voice queries
  const voiceQuery = trpc.voice.getVoiceStatus.useQuery()
  const commandsQuery = trpc.voice.getVoiceCommands.useQuery()
  const analyticsQuery = trpc.voice.getVoiceAnalytics.useQuery()
  const settingsQuery = trpc.voice.getVoiceSettings.useQuery()

  const executeCommandMutation = trpc.voice.executeCommand.useMutation()
  const updateSettingsMutation = trpc.voice.updateSettings.useMutation()
  const trainVoiceMutation = trpc.voice.trainVoice.useMutation()

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'nb-NO' // Norwegian
      
      recognition.onstart = () => {
        setIsListening(true)
        haptic.success()
      }
      
      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        setTranscript(finalTranscript + interimTranscript)
        
        if (finalTranscript) {
          handleVoiceCommand(finalTranscript)
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        haptic.error()
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognition)
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis)
    }
  }, [haptic])

  const handleVoiceCommand = async (command: string) => {
    try {
      const result = await executeCommandMutation.mutateAsync({ command })
      
      if (result.success) {
        haptic.success()
        if (result.response && synthesis) {
          speak(result.response)
        }
      } else {
        haptic.error()
        speak('Beklager, jeg forstod ikke kommandoen')
      }
    } catch (error) {
      console.error('Voice command error:', error)
      haptic.error()
    }
  }

  const speak = (text: string) => {
    if (synthesis) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'nb-NO'
      utterance.rate = 0.9
      utterance.pitch = 1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      
      synthesis.speak(utterance)
    }
  }

  const startListening = () => {
    if (recognition && voiceEnabled) {
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
    }
  }

  const handleToggleVoice = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ voiceEnabled: enabled })
      setVoiceEnabled(enabled)
      if (!enabled && isListening) {
        stopListening()
      }
    } catch (error) {
      console.error('Failed to toggle voice:', error)
    }
  }

  const handleTrainVoice = async () => {
    haptic.selection()
    try {
      await trainVoiceMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to train voice:', error)
    }
  }

  const getVoiceStatus = (status: string) => {
    switch (status) {
      case 'listening': return { color: 'text-green-600', label: 'Lytter', icon: Mic }
      case 'speaking': return { color: 'text-blue-600', label: 'Snakker', icon: Volume2 }
      case 'idle': return { color: 'text-gray-600', label: 'Inaktiv', icon: MicOff }
      default: return { color: 'text-gray-600', label: 'Ukjent', icon: AlertTriangle }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Voice Assistant</h2>
          <p className="text-muted-foreground">
            Speech recognition, voice commands og voice analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Mic className="w-3 h-3" />
            Voice Enabled
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Voice Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voice Status</CardTitle>
            <Mic className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isListening ? 'Listening' : isSpeaking ? 'Speaking' : 'Idle'}
            </div>
            <p className="text-xs text-muted-foreground">
              {getVoiceStatus(isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle').label}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commands</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {commandsQuery.data?.totalCommands || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available commands
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analyticsQuery.data?.accuracy || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Recognition accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <Rocket className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analyticsQuery.data?.totalUsage || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Voice interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'assistant' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('assistant')}
          className="flex-1"
        >
          <Mic className="w-4 h-4 mr-2" />
          Assistant
        </Button>
        <Button
          variant={selectedTab === 'commands' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('commands')}
          className="flex-1"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Commands
        </Button>
        <Button
          variant={selectedTab === 'analytics' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('analytics')}
          className="flex-1"
        >
          <Brain className="w-4 h-4 mr-2" />
          Analytics
        </Button>
        <Button
          variant={selectedTab === 'settings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('settings')}
          className="flex-1"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Assistant Tab */}
      {selectedTab === 'assistant' && (
        <div className="space-y-4">
          {/* Voice Assistant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice Assistant
              </CardTitle>
              <CardDescription>
                Interaktive voice commands og AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Voice Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    variant={isListening ? 'destructive' : 'default'}
                    onClick={isListening ? stopListening : startListening}
                    disabled={!voiceEnabled}
                    className="w-20 h-20 rounded-full"
                  >
                    {isListening ? (
                      <MicOff className="w-8 h-8" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                  </Button>
                  
                  <Button
                    size="lg"
                    variant={isSpeaking ? 'destructive' : 'outline'}
                    onClick={() => isSpeaking ? synthesis?.cancel() : speak('Hei, hvordan kan jeg hjelpe deg?')}
                    className="w-20 h-20 rounded-full"
                  >
                    {isSpeaking ? (
                      <Square className="w-8 h-8" />
                    ) : (
                      <Volume2 className="w-8 h-8" />
                    )}
                  </Button>
                </div>

                {/* Transcript */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transcript</label>
                  <div className="p-4 border rounded-lg bg-muted min-h-20">
                    {transcript || 'Start speaking to see transcript...'}
                  </div>
                </div>

                {/* Quick Commands */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Commands</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      'Legg til garn',
                      'Vis lokasjoner',
                      'Søk etter item',
                      'Vis statistikk',
                      'Sync data',
                      'Backup',
                      'Settings',
                      'Help'
                    ].map((command) => (
                      <Button
                        key={command}
                        variant="outline"
                        size="sm"
                        onClick={() => handleVoiceCommand(command)}
                        className="text-xs"
                      >
                        {command}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Voice Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {voiceQuery.data?.voiceStatus?.map((status) => (
                  <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Mic className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{status.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {status.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{status.status}</div>
                        <div className="text-xs text-muted-foreground">
                          {status.lastUpdate}
                        </div>
                      </div>
                      
                      <Badge variant={status.isActive ? 'default' : 'secondary'}>
                        {status.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Commands Tab */}
      {selectedTab === 'commands' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Voice Commands
              </CardTitle>
              <CardDescription>
                Available voice commands og their functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commandsQuery.data?.commands?.map((command) => (
                  <div key={command.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{command.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {command.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{command.category}</div>
                        <div className="text-xs text-muted-foreground">
                          {command.usageCount} uses
                        </div>
                      </div>
                      
                      <Badge variant={command.isActive ? 'default' : 'secondary'}>
                        {command.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Command Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Command Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {commandsQuery.data?.categories?.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <category.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.commandCount} commands
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Voice Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Voice Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsQuery.data?.metrics?.map((metric) => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className="text-sm font-medium">{metric.value}</span>
                      </div>
                      <Progress value={metric.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Usage Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsQuery.data?.trends?.map((trend) => (
                    <div key={trend.id} className="flex items-start gap-2 p-3 border rounded-lg">
                      <trend.icon className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{trend.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {trend.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Voice Training */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="w-5 h-5" />
                Voice Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsQuery.data?.trainingData?.map((training) => (
                  <div key={training.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Headphones className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{training.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {training.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{training.progress}%</div>
                        <div className="text-xs text-muted-foreground">
                          {training.status}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={handleTrainVoice}
                        disabled={training.status === 'Completed'}
                      >
                        {training.status === 'Completed' ? 'Completed' : 'Train'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === 'settings' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Voice Settings
              </CardTitle>
              <CardDescription>
                Configure voice assistant settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.settings?.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <setting.icon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{setting.name}</span>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(enabled) => {
                        if (setting.key === 'voiceEnabled') {
                          handleToggleVoice(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Voice Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Voice Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.preferences?.map((preference) => (
                  <div key={preference.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{preference.name}</span>
                      <span className="text-sm font-medium">{preference.value}</span>
                    </div>
                    <Progress value={preference.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Raske handlinger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Mic className="w-5 h-5" />
              <span className="text-sm">Start Listening</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Volume2 className="w-5 h-5" />
              <span className="text-sm">Test Speech</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Headphones className="w-5 h-5" />
              <span className="text-sm">Train Voice</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
