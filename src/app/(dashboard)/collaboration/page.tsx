'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Activity, 
  Wifi, 
  WifiOff,
  Zap,
  Eye,
  Edit,
  MessageCircle,
  Bell,
  Globe,
  Clock
} from 'lucide-react'
import { OnlineUsersList } from '@/components/realtime/OnlineUsersList'
import { LiveActivityFeed } from '@/components/realtime/LiveActivityFeed'
import { useSocket, useRealtimeEvents, useTypingIndicator } from '@/lib/websocket/client'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

export default function CollaborationPage() {
  const [selectedHousehold, setSelectedHousehold] = useState<string>('')
  const [testFormData, setTestFormData] = useState({
    name: '',
    description: '',
    category: ''
  })

  const { 
    isConnected, 
    onlineUsers,
    joinHousehold,
    leaveHousehold,
    viewPage,
    startEditingForm,
    stopEditingForm
  } = useSocket()

  const { recentActivities, liveEditing } = useRealtimeEvents()

  const { data: households = [] } = trpc.households.getMyHouseholds.useQuery()

  const { 
    typingUsers, 
    handleStartTyping, 
    handleStopTyping 
  } = useTypingIndicator('test-form', selectedHousehold)

  useEffect(() => {
    if (selectedHousehold) {
      joinHousehold(selectedHousehold)
      viewPage('/collaboration', selectedHousehold)
    }

    return () => {
      if (selectedHousehold) {
        leaveHousehold(selectedHousehold)
      }
    }
  }, [selectedHousehold, joinHousehold, leaveHousehold, viewPage])

  const handleFormFieldEdit = (field: string) => {
    if (selectedHousehold) {
      startEditingForm('test-form', field, selectedHousehold)
      
      // Stop editing after 3 seconds of inactivity
      setTimeout(() => {
        stopEditingForm('test-form', selectedHousehold)
      }, 3000)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setTestFormData(prev => ({ ...prev, [field]: value }))
    handleStartTyping()
    handleFormFieldEdit(field)
  }

  const testNotification = () => {
    toast.success('Test notifikasjon sendt til alle online medlemmer!', {
      duration: 3000
    })
  }

  return (
    <div className="page container mx-auto px-4 py-8 cq">
      {/* Header */}
      <div className="mb-8 cq">
        <h1 className="text-3xl font-bold title">Real-time Samarbeid</h1>
        <p className="text-muted-foreground secondary-text">
          Demo av live collaboration features med WebSocket teknologi
        </p>
      </div>

      {/* Connection Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                Tilkoblet WebSocket
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                Frakoblet
              </>
            )}
          </CardTitle>
          <CardDescription>
            Status for real-time tilkobling til samarbeids-tjenester
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Online" : "Offline"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                WebSocket status
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm">
                {onlineUsers.length} brukere online
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm">
                {recentActivities.length} nylige aktiviteter
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Edit className="w-4 h-4 text-purple-500" />
              <span className="text-sm">
                {liveEditing.length} redigerer nå
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Household Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Velg husholdning</CardTitle>
          <CardDescription>
            Velg en husholdning for å se real-time collaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="household">Husholdning</Label>
              <Select value={selectedHousehold} onValueChange={setSelectedHousehold}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg en husholdning" />
                </SelectTrigger>
                <SelectContent>
                  {households.map(household => (
                    <SelectItem key={household.id} value={household.id}>
                      {household.name} ({household.memberCount} medlemmer)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={testNotification} disabled={!selectedHousehold}>
              <Bell className="w-4 h-4 mr-2" />
              Test notifikasjon
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedHousehold ? (
        <Tabs defaultValue="demo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Live Demo
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Online Brukere
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Aktivitet
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Dokumentasjon
            </TabsTrigger>
          </TabsList>

          {/* Live Demo Tab */}
          <TabsContent value="demo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Live Redigering</CardTitle>
                  <CardDescription>
                    Skriv i feltene under og se hvordan andre medlemmer får beskjed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Navn</Label>
                    <Input
                      id="name"
                      value={testFormData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      onFocus={() => handleFormFieldEdit('name')}
                      onBlur={handleStopTyping}
                      placeholder="Skriv navnet her..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Beskrivelse</Label>
                    <Textarea
                      id="description"
                      value={testFormData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      onFocus={() => handleFormFieldEdit('description')}
                      onBlur={handleStopTyping}
                      placeholder="Skriv beskrivelsen her..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Select value={testFormData.category} onValueChange={(value) => handleFormChange('category', value)}>
                      <SelectTrigger onFocus={() => handleFormFieldEdit('category')}>
                        <SelectValue placeholder="Velg kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Elektronikk</SelectItem>
                        <SelectItem value="furniture">Møbler</SelectItem>
                        <SelectItem value="clothing">Klær</SelectItem>
                        <SelectItem value="books">Bøker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Typing Indicators */}
                  {typingUsers.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">
                          {typingUsers.length === 1 
                            ? '1 person skriver...'
                            : `${typingUsers.length} personer skriver...`
                          }
                        </span>
                        <div className="flex space-x-1 ml-auto">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Live Activity */}
              <LiveActivityFeed householdId={selectedHousehold} compact />
            </div>

            {/* Feature Showcase */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Features</CardTitle>
                <CardDescription>
                  Oversikt over alle live collaboration funksjonene
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium">Online Brukere</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Se hvem som er online i sanntid og deres aktivitet
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Edit className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium">Live Redigering</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Se når andre redigerer felt og skriver
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <h4 className="font-medium">Aktivitetsfeed</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Live feed av alle endringer i inventaret
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-5 h-5 text-orange-600" />
                      <h4 className="font-medium">Push Notifikasjoner</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Øyeblikkelige varsler om viktige hendelser
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-teal-600" />
                      <h4 className="font-medium">Sidesporing</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Se hvilke sider andre medlemmer besøker
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-medium">Synkronisering</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatisk synkronisering av alle endringer
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Online Users Tab */}
          <TabsContent value="users">
            <OnlineUsersList householdId={selectedHousehold} />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <LiveActivityFeed householdId={selectedHousehold} />
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs">
            <Card>
              <CardHeader>
                <CardTitle>WebSocket Teknologi</CardTitle>
                <CardDescription>
                  Teknisk dokumentasjon for real-time collaboration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Teknologi Stack</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Socket.IO for WebSocket kommunikasjon</li>
                    <li>React hooks for real-time state management</li>
                    <li>Type-safe events med TypeScript</li>
                    <li>Automatic reconnection og error handling</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Event Types</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>item:created, item:updated, item:deleted</li>
                    <li>user:online, user:offline, user:typing</li>
                    <li>form:editing, form:stopped_editing</li>
                    <li>notification:new, system:maintenance</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Optimistic UI updates for bedre responsivitet</li>
                    <li>Debounced typing indicators</li>
                    <li>Efficient room-based broadcasting</li>
                    <li>Graceful degradation ved tilkoblingsproblemer</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600">Velg en husholdning</h2>
              <p className="text-gray-500">Velg en husholdning fra dropdown over for å se real-time collaboration features</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
