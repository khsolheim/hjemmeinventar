'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, 
  Camera, 
  QrCode, 
  Mic, 
  Plus,
  Sparkles,
  Check,
  Smartphone,
  Gauge,
  Volume2,
  Search,
  Settings,
  BarChart3,
  Package,
  Trophy,
  Users,
  Home,
  ExternalLink,
  AlertTriangle,
  Leaf,
  Brain,
  Wifi,
  LayoutDashboard,
  BookOpen,
  MapPin,
  Bell,
  Heart,
  DollarSign,
  CheckSquare
} from 'lucide-react'
import { QuickAddModal } from '@/components/items/QuickAddModal'
import { VoiceCommand } from '@/components/ui/voice-command'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

export default function TestFeaturesPage() {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddMode, setQuickAddMode] = useState<'camera' | 'barcode' | 'text'>('text')
  const [testResults, setTestResults] = useState<any[]>([])
  const haptic = useHapticFeedback()

  const addTestResult = (feature: string, status: 'success' | 'error' | 'info', message: string) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      feature,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const testHapticFeedback = () => {
    haptic.light()
    addTestResult('Haptic Feedback', 'success', 'Light haptic triggered')
    
    setTimeout(() => {
      haptic.medium()
      addTestResult('Haptic Feedback', 'success', 'Medium haptic triggered')
    }, 500)
    
    setTimeout(() => {
      haptic.success()
      addTestResult('Haptic Feedback', 'success', 'Success pattern triggered')
    }, 1000)
  }

  const testQuickAdd = (mode: 'camera' | 'barcode' | 'text') => {
    setQuickAddMode(mode)
    setShowQuickAdd(true)
    addTestResult('Quick Add', 'info', `Opening ${mode} mode`)
  }

  const testVoiceCommand = () => {
    addTestResult('Voice Command', 'info', 'Voice command component loaded')
  }

  const testMobileFeatures = () => {
    const isMobile = window.innerWidth < 768
    const hasTouch = 'ontouchstart' in window
    const hasVibrate = 'vibrate' in navigator
    const hasSpeech = 'webkitSpeechRecognition' in window

    addTestResult('Mobile Detection', 'info', `Mobile: ${isMobile}, Touch: ${hasTouch}`)
    addTestResult('Device Features', 'info', `Vibrate: ${hasVibrate}, Speech: ${hasSpeech}`)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Sprint 1 Feature Test</h1>
        <p className="text-muted-foreground">
          Test alle nye funksjoner implementert i Sprint 1
        </p>
      </div>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList className="grid w-full grid-cols-22">
          <TabsTrigger value="features">Sprint 1</TabsTrigger>
          <TabsTrigger value="search">Sprint 2</TabsTrigger>
          <TabsTrigger value="analytics">Sprint 3</TabsTrigger>
          <TabsTrigger value="gamification">Sprint 4</TabsTrigger>
          <TabsTrigger value="integrations">Sprint 5</TabsTrigger>
          <TabsTrigger value="emergency">Sprint 6</TabsTrigger>
          <TabsTrigger value="ai">Sprint 7</TabsTrigger>
          <TabsTrigger value="advanced">Sprint 8</TabsTrigger>
          <TabsTrigger value="security">Sprint 9</TabsTrigger>
          <TabsTrigger value="blockchain">Sprint 10</TabsTrigger>
          <TabsTrigger value="automation">Sprint 11</TabsTrigger>
          <TabsTrigger value="reporting">Sprint 12</TabsTrigger>
          <TabsTrigger value="mobile-advanced">Sprint 13</TabsTrigger>
          <TabsTrigger value="voice-advanced">Sprint 14</TabsTrigger>
          <TabsTrigger value="camera-advanced">Sprint 15</TabsTrigger>
          <TabsTrigger value="location-advanced">Sprint 16</TabsTrigger>
          <TabsTrigger value="notifications-advanced">Sprint 17</TabsTrigger>
          <TabsTrigger value="search-advanced">Sprint 18</TabsTrigger>
          <TabsTrigger value="dashboard-advanced">Sprint 19</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="voice">Stemme</TabsTrigger>
          <TabsTrigger value="results">Resultater</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick Start Onboarding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Quick Start Onboarding
                </CardTitle>
                <CardDescription>
                  5-minutters oppsett med smarte standarder
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Auto-genererte lokasjoner og kategorier
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/onboarding'}
                    className="w-full"
                  >
                    Test Onboarding
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Smart Quick-Add */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Smart Quick-Add
                </CardTitle>
                <CardDescription>
                  Tre moduser for rask tilføyelse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => testQuickAdd('text')}
                      size="sm"
                      className="flex-1"
                    >
                      Tekst
                    </Button>
                    <Button 
                      onClick={() => testQuickAdd('camera')}
                      size="sm"
                      className="flex-1"
                    >
                      Kamera
                    </Button>
                    <Button 
                      onClick={() => testQuickAdd('barcode')}
                      size="sm"
                      className="flex-1"
                    >
                      QR
                    </Button>
                  </div>
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Performance Optimizations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-blue-600" />
                  Performance
                </CardTitle>
                <CardDescription>
                  Lazy loading og optimizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Lazy loading av tunge komponenter
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full"
                  >
                    Test Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Smart Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Smart Search
                </CardTitle>
                <CardDescription>
                  Natural language processing og smarte forslag
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Søk med naturlig språk og få smarte forslag
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/search'}
                    className="w-full"
                  >
                    Test Smart Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Personalization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Dashboard Personalization
                </CardTitle>
                <CardDescription>
                  Tilpass dashboardet til dine behov
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Adaptive layouts og kontekstuelle forslag
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/personalization'}
                    className="w-full"
                  >
                    Test Personalization
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Advanced Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Advanced Analytics
                </CardTitle>
                <CardDescription>
                  Detaljerte innsikter og prediktive analyser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Prediktive innsikter, bærekraft og verdianalyse
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/advanced-analytics'}
                    className="w-full"
                  >
                    Test Advanced Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Smart Inventory Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Smart Inventory
                </CardTitle>
                <CardDescription>
                  Automatisk lagerstyring og smarte påminnelser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Lagerprediksjoner, utløpsvarsler og handlelister
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/smart-inventory'}
                    className="w-full"
                  >
                    Test Smart Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gamification" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gamification System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Gamification System
                </CardTitle>
                <CardDescription>
                  Prestasjoner, fremdrift og topplister
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Achievement system, progress tracking og leaderboards
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/gamification'}
                    className="w-full"
                  >
                    Test Gamification
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Collaborative Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Collaborative Features
                </CardTitle>
                <CardDescription>
                  Husholdningsstyring og samarbeid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Household management, item sharing og team collaboration
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/collaboration'}
                    className="w-full"
                  >
                    Test Collaboration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Smart Home Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Smart Home Integration
                </CardTitle>
                <CardDescription>
                  Philips Hue, IKEA Trådfri, Amazon Alexa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Smart home device control og automatisering
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/integrations'}
                    className="w-full"
                  >
                    Test Smart Home
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Third-party Integrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-green-600" />
                  Third-party Integrations
                </CardTitle>
                <CardDescription>
                  Shopping platforms, calendar sync, webhooks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Amazon, Google Calendar, Gmail, Dropbox, etc.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/integrations'}
                    className="w-full"
                  >
                    Test Integrations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emergency Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Emergency Management
                </CardTitle>
                <CardDescription>
                  Nødkontakter, viktige dokumenter og sikkerhetsutstyr
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Emergency contacts, documents, equipment, plans
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/emergency'}
                    className="w-full"
                  >
                    Test Emergency
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sustainability Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Sustainability Features
                </CardTitle>
                <CardDescription>
                  Miljøpåvirkning, avfall reduksjon og grønne tips
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Carbon footprint, waste tracking, green tips
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/sustainability'}
                    className="w-full"
                  >
                    Test Sustainability
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Advanced AI Assistant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Advanced AI Assistant
                </CardTitle>
                <CardDescription>
                  Intelligente prediksjoner, automatisering og innsikt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    AI chat, predictions, automations, insights
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/ai'}
                    className="w-full"
                  >
                    Test AI Assistant
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* IoT Device Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-blue-600" />
                  IoT Device Integration
                </CardTitle>
                <CardDescription>
                  Smarte enheter, sensorer og wearables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Smart devices, sensors, wearables, automation
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/iot'}
                    className="w-full"
                  >
                    Test IoT Devices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Advanced Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Advanced Analytics
                </CardTitle>
                <CardDescription>
                  Machine Learning insights og prediktiv analyse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    ML insights, predictions, business intelligence
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/analytics'}
                    className="w-full"
                  >
                    Test Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Machine Learning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Machine Learning
                </CardTitle>
                <CardDescription>
                  Modell-trening, prediksjoner og data-analyse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Model training, predictions, data insights
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/ml'}
                    className="w-full"
                  >
                    Test ML
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-green-600" />
                  Advanced Security
                </CardTitle>
                <CardDescription>
                  Sikkerhet, personvern og kryptering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Security monitoring, privacy controls, encryption, threat detection
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/security'}
                    className="w-full"
                  >
                    Test Security
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Blockchain Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                  Blockchain Integration
                </CardTitle>
                <CardDescription>
                  NFTs, Smart Contracts og desentraliserte funksjoner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    NFT minting, smart contracts, decentralized storage, Web3 integration
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/blockchain'}
                    className="w-full"
                  >
                    Test Blockchain
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Automation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Advanced Automation
                </CardTitle>
                <CardDescription>
                  Workflow automation, enterprise features og API management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Workflow automation, enterprise features, API management, performance optimization
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/automation'}
                    className="w-full"
                  >
                    Test Automation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Reporting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Advanced Reporting
                </CardTitle>
                <CardDescription>
                  Custom dashboards, data visualization og business intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Custom dashboards, data visualization, business intelligence, AI insights
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/reporting'}
                    className="w-full"
                  >
                    Test Reporting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mobile-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Mobile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  Advanced Mobile
                </CardTitle>
                <CardDescription>
                  Offline capabilities, push notifications og mobile optimalisering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Offline capabilities, push notifications, mobile optimization, PWA support
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/mobile'}
                    className="w-full"
                  >
                    Test Mobile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="voice-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Voice */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-purple-600" />
                  Advanced Voice Assistant
                </CardTitle>
                <CardDescription>
                  Speech recognition, voice commands og voice analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Speech recognition, voice commands, voice analytics, AI assistant
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/voice'}
                    className="w-full"
                  >
                    Test Voice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="camera-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Camera */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  Advanced Camera
                </CardTitle>
                <CardDescription>
                  Image recognition, QR scanning og photo management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Image recognition, QR scanning, photo management, AI vision
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/camera'}
                    className="w-full"
                  >
                    Test Camera
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="location-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Advanced Location
                </CardTitle>
                <CardDescription>
                  GPS integration, indoor positioning og location analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    GPS tracking, indoor positioning, location analytics, real-time tracking
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/location'}
                    className="w-full"
                  >
                    Test Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  Advanced Notifications
                </CardTitle>
                <CardDescription>
                  Push notifications, smart alerts og notification analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Push notifications, smart alerts, notification analytics, real-time alerts
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/notifications'}
                    className="w-full"
                  >
                    Test Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Advanced Search
                </CardTitle>
                <CardDescription>
                  Semantic search, search analytics og search optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Semantic search, search analytics, search optimization, AI-powered search
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/search'}
                    className="w-full"
                  >
                    Test Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dashboard-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-green-600" />
                  Advanced Dashboard
                </CardTitle>
                <CardDescription>
                  Dashboard personalization, analytics og optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Dashboard personalization, analytics, optimization, widget management
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full"
                  >
                    Test Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collaboration-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Collaboration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Advanced Collaboration
                </CardTitle>
                <CardDescription>
                  Team management, shared workspaces og real-time collaboration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Team management, shared workspaces, real-time chat, collaboration settings
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/collaboration'}
                    className="w-full"
                  >
                    Test Collaboration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gamification-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Gamification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  Advanced Gamification
                </CardTitle>
                <CardDescription>
                  Achievement system, leaderboards og progress tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Achievement system, leaderboards, progress tracking, gamification settings
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/gamification'}
                    className="w-full"
                  >
                    Test Gamification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Social */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Advanced Social
                </CardTitle>
                <CardDescription>
                  Community system, social sharing og user interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Community system, social sharing, user interactions, social settings
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/social'}
                    className="w-full"
                  >
                    Test Social
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Learning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  Advanced Learning
                </CardTitle>
                <CardDescription>
                  Knowledge management, skill development og educational content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Knowledge management, skill development, educational content, learning settings
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/learning'}
                    className="w-full"
                  >
                    Test Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-green-600" />
                  Advanced Health
                </CardTitle>
                <CardDescription>
                  Wellness tracking, health monitoring og fitness integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Wellness tracking, health monitoring, fitness integration, health settings
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/health'}
                    className="w-full"
                  >
                    Test Health
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Finance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Advanced Finance
                </CardTitle>
                <CardDescription>
                  Budget tracking, expense management og investment monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Budget tracking, expense management, investment monitoring, finance settings
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/finance'}
                    className="w-full"
                  >
                    Test Finance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="productivity-advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Advanced Productivity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                  Advanced Productivity
                </CardTitle>
                <CardDescription>
                  Task management, time tracking og project management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    ✅ Implementert
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Task management, time tracking, project management, productivity settings
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/productivity'}
                    className="w-full"
                  >
                    Test Productivity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mobile Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  Mobile Features
                </CardTitle>
                <CardDescription>
                  Touch-optimized og mobile-first design
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={testMobileFeatures}
                    className="w-full"
                  >
                    Test Mobile Detection
                  </Button>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Touch Support:</span>
                      <Badge variant="outline">
                        {'ontouchstart' in window ? '✅' : '❌'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Vibrate Support:</span>
                      <Badge variant="outline">
                        {'vibrate' in navigator ? '✅' : '❌'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Speech Recognition:</span>
                      <Badge variant="outline">
                        {'webkitSpeechRecognition' in window ? '✅' : '❌'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Haptic Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                  Haptic Feedback
                </CardTitle>
                <CardDescription>
                  Touch feedback for mobile enheter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    onClick={testHapticFeedback}
                    className="w-full"
                  >
                    Test Haptic Feedback
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => haptic.light()}
                      size="sm"
                      variant="outline"
                    >
                      Light
                    </Button>
                    <Button 
                      onClick={() => haptic.medium()}
                      size="sm"
                      variant="outline"
                    >
                      Medium
                    </Button>
                    <Button 
                      onClick={() => haptic.success()}
                      size="sm"
                      variant="outline"
                    >
                      Success
                    </Button>
                    <Button 
                      onClick={() => haptic.error()}
                      size="sm"
                      variant="outline"
                    >
                      Error
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-green-600" />
                Voice Commands
              </CardTitle>
              <CardDescription>
                Hands-free operasjon med stemmekommandoer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceCommand
                onCommand={(result) => {
                  addTestResult('Voice Command', 'success', `Command: ${result.action}`)
                }}
                onError={(error) => {
                  addTestResult('Voice Command', 'error', error)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Resultater</CardTitle>
              <CardDescription>
                Resultater fra alle tester
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium">
                    {testResults.length} tester kjørt
                  </span>
                  <Button 
                    onClick={clearResults}
                    size="sm"
                    variant="outline"
                  >
                    Tøm resultater
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {testResults.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Ingen tester kjørt ennå
                    </p>
                  ) : (
                    testResults.map((result) => (
                      <div 
                        key={result.id}
                        className={`p-3 rounded-lg border ${
                          result.status === 'success' ? 'bg-green-50 border-green-200' :
                          result.status === 'error' ? 'bg-red-50 border-red-200' :
                          'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{result.feature}</span>
                          <span className="text-xs text-muted-foreground">
                            {result.timestamp}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{result.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Action Button for mobile */}
      <div className="md:hidden">
        <FloatingActionButton
          onQuickAdd={() => testQuickAdd('text')}
          onCamera={() => testQuickAdd('camera')}
          onQRScan={() => testQuickAdd('barcode')}
        />
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        mode={quickAddMode}
      />
    </div>
  )
}
