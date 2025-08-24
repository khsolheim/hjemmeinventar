'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bot,
  Brain,
  Zap,
  Lightbulb,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Settings,
  Sparkles,
  Target,
  BarChart3,
  Calendar,
  Home,
  ShoppingCart,
  Package,
  Users,
  Star,
  Heart,
  Eye,
  Ear,
  Hand,
  Footprints
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedAIAssistantProps {
  className?: string
}

export function AdvancedAIAssistant({ className }: AdvancedAIAssistantProps) {
  const [selectedTab, setSelectedTab] = useState<'chat' | 'predictions' | 'automation' | 'insights'>('chat')
  const [inputMessage, setInputMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const haptic = useHapticFeedback()

  // AI queries
  const predictionsQuery = trpc.ai.getPredictions.useQuery()
  const automationsQuery = trpc.ai.getAutomations.useQuery()
  const insightsQuery = trpc.ai.getInsights.useQuery()
  const contextQuery = trpc.ai.getContext.useQuery()

  const sendMessageMutation = trpc.ai.sendMessage.useMutation()
  const createAutomationMutation = trpc.ai.createAutomation.useMutation()
  const executeActionMutation = trpc.ai.executeAction.useMutation()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setChatHistory(prev => [...prev, userMessage])
    setInputMessage('')
    setIsProcessing(true)
    haptic.light()

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: inputMessage,
        context: contextQuery.data
      })

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.reply,
        actions: response.suggestedActions,
        confidence: response.confidence,
        timestamp: new Date()
      }

      setChatHistory(prev => [...prev, aiMessage])
      haptic.success()
    } catch (error) {
      console.error('Failed to send message:', error)
      haptic.error()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVoiceInput = () => {
    if (!isListening) {
      setIsListening(true)
      // Start voice recognition
      if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'no-NO'

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputMessage(transcript)
          setIsListening(false)
        }

        recognition.onerror = () => {
          setIsListening(false)
        }

        recognition.start()
      }
    }
  }

  const handleExecuteAction = async (action: any) => {
    haptic.success()
    try {
      await executeActionMutation.mutateAsync(action)
    } catch (error) {
      console.error('Failed to execute action:', error)
    }
  }

  const handleCreateAutomation = async (automation: any) => {
    haptic.success()
    try {
      await createAutomationMutation.mutateAsync(automation)
    } catch (error) {
      console.error('Failed to create automation:', error)
    }
  }

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'inventory': return Package
      case 'shopping': return ShoppingCart
      case 'maintenance': return Settings
      case 'energy': return Zap
      case 'social': return Users
      default: return TrendingUp
    }
  }

  const getInsightCategory = (category: string) => {
    switch (category) {
      case 'efficiency': return { icon: Zap, color: 'text-yellow-600' }
      case 'savings': return { icon: TrendingUp, color: 'text-green-600' }
      case 'health': return { icon: Heart, color: 'text-red-600' }
      case 'sustainability': return { icon: Leaf, color: 'text-green-500' }
      default: return { icon: Lightbulb, color: 'text-blue-600' }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced AI Assistant</h2>
          <p className="text-muted-foreground">
            Intelligente prediksjoner, automatisering og innsikt
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            AI Powered
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Smart
          </Badge>
        </div>
      </div>

      {/* AI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Score</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              94%
            </div>
            <p className="text-xs text-muted-foreground">
              Intelligens-nivå
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediksjoner</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {predictionsQuery.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktive prediksjoner
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automatiseringer</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {automationsQuery.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktive automatiseringer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Innsikt</CardTitle>
            <Lightbulb className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {insightsQuery.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Nye innsikt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'chat' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('chat')}
          className="flex-1"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat
        </Button>
        <Button
          variant={selectedTab === 'predictions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('predictions')}
          className="flex-1"
        >
          <Target className="w-4 h-4 mr-2" />
          Prediksjoner
        </Button>
        <Button
          variant={selectedTab === 'automation' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('automation')}
          className="flex-1"
        >
          <Zap className="w-4 h-4 mr-2" />
          Automatisering
        </Button>
        <Button
          variant={selectedTab === 'insights' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('insights')}
          className="flex-1"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Innsikt
        </Button>
      </div>

      {/* Chat Tab */}
      {selectedTab === 'chat' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Chat Assistant
              </CardTitle>
              <CardDescription>
                Stil spørsmål og få intelligente svar og forslag
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Chat Messages */}
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start en samtale med AI-assistenten</p>
                    <p className="text-sm">Prøv: "Hva kan jeg gjøre for å spare energi?"</p>
                  </div>
                ) : (
                  chatHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.type === 'ai' && (
                            <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            {message.type === 'ai' && message.actions && (
                              <div className="mt-2 space-y-1">
                                {message.actions.map((action: any, index: number) => (
                                  <Button
                                    key={index}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleExecuteAction(action)}
                                    className="w-full justify-start text-xs"
                                  >
                                    {action.icon && <action.icon className="w-3 h-3 mr-1" />}
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                            {message.type === 'ai' && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>Confidence: {message.confidence}%</span>
                                <span>{message.timestamp.toLocaleTimeString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Stil et spørsmål til AI-assistenten..."
                    disabled={isProcessing}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleVoiceInput}
                    disabled={isListening || isProcessing}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-red-600" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Predictions Tab */}
      {selectedTab === 'predictions' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                AI Prediksjoner
              </CardTitle>
              <CardDescription>
                Intelligente forutsigelser basert på dine data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictionsQuery.data?.map((prediction) => {
                  const IconComponent = getPredictionIcon(prediction.type)
                  
                  return (
                    <div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{prediction.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {prediction.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={prediction.confidence > 80 ? "default" : "secondary"}>
                          {prediction.confidence}% sikker
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {new Date(prediction.expectedDate).toLocaleDateString('no-NO')}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Automation Tab */}
      {selectedTab === 'automation' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Smart Automatisering
              </CardTitle>
              <CardDescription>
                Automatiske handlinger basert på AI-analyse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationsQuery.data?.map((automation) => (
                  <div key={automation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Zap className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium">{automation.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {automation.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={automation.enabled ? "default" : "secondary"}>
                        {automation.enabled ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {automation.triggerCount} ganger utløst
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Tab */}
      {selectedTab === 'insights' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI Innsikt
              </CardTitle>
              <CardDescription>
                Intelligente observasjoner og anbefalinger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insightsQuery.data?.map((insight) => {
                  const category = getInsightCategory(insight.category)
                  const CategoryIcon = category.icon
                  
                  return (
                    <div key={insight.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${category.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                        <CategoryIcon className={`w-4 h-4 ${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{insight.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {insight.description}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.impact} påvirkning
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Raske AI-handlinger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Brain className="w-5 h-5" />
              <span className="text-sm">AI Analyse</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Target className="w-5 h-5" />
              <span className="text-sm">Prediksjoner</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Automatiser</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Lightbulb className="w-5 h-5" />
              <span className="text-sm">Innsikt</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
