'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users,
  UserPlus,
  Share2,
  MessageSquare,
  Calendar,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Crown,
  Settings,
  Bell,
  Mail
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface CollaborativeFeaturesProps {
  className?: string
}

export function CollaborativeFeatures({ className }: CollaborativeFeaturesProps) {
  const [selectedTab, setSelectedTab] = useState<'household' | 'sharing' | 'communication' | 'tasks'>('household')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const haptic = useHapticFeedback()

  // Collaboration queries
  const householdQuery = trpc.households.getCurrent.useQuery()
  const membersQuery = trpc.households.getMembers.useQuery()
  const sharedItemsQuery = trpc.collaboration.getSharedItems.useQuery()
  const messagesQuery = trpc.collaboration.getMessages.useQuery()
  const tasksQuery = trpc.collaboration.getTasks.useQuery()

  const inviteMemberMutation = trpc.households.inviteMember.useMutation()
  const shareItemMutation = trpc.collaboration.shareItem.useMutation()
  const sendMessageMutation = trpc.collaboration.sendMessage.useMutation()
  const createTaskMutation = trpc.collaboration.createTask.useMutation()

  const handleInviteMember = async () => {
    haptic.success()
    try {
      await inviteMemberMutation.mutateAsync({
        email: inviteEmail,
        message: inviteMessage
      })
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteMessage('')
    } catch (error) {
      console.error('Failed to invite member:', error)
    }
  }

  const handleShareItem = async (itemId: string, memberId: string) => {
    haptic.light()
    try {
      await shareItemMutation.mutateAsync({
        itemId,
        memberId,
        message: 'Sjekk ut denne gjenstanden!'
      })
    } catch (error) {
      console.error('Failed to share item:', error)
    }
  }

  const handleSendMessage = async (message: string) => {
    haptic.selection()
    try {
      await sendMessageMutation.mutateAsync({
        message,
        householdId: householdQuery.data?.id || ''
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleCreateTask = async (task: { title: string; description: string; assigneeId: string }) => {
    haptic.success()
    try {
      await createTaskMutation.mutateAsync(task)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const getMemberRole = (role: string) => {
    switch (role) {
      case 'admin': return { label: 'Administrator', color: 'bg-red-100 text-red-800', icon: Crown }
      case 'member': return { label: 'Medlem', color: 'bg-blue-100 text-blue-800', icon: Users }
      case 'guest': return { label: 'Gjest', color: 'bg-gray-100 text-gray-800', icon: UserPlus }
      default: return { label: 'Medlem', color: 'bg-blue-100 text-blue-800', icon: Users }
    }
  }

  const getTaskStatus = (status: string) => {
    switch (status) {
      case 'completed': return { label: 'Fullført', color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'in_progress': return { label: 'Pågår', color: 'bg-blue-100 text-blue-800', icon: Clock }
      case 'pending': return { label: 'Venter', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
      default: return { label: 'Venter', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Samarbeid</h2>
          <p className="text-muted-foreground">
            Arbeid sammen med familie og venner
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Inviter medlem
        </Button>
      </div>

      {/* Household Overview */}
      {householdQuery.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {householdQuery.data.name}
            </CardTitle>
            <CardDescription>
              {householdQuery.data.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {membersQuery.data?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Medlemmer</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {sharedItemsQuery.data?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Delte gjenstander</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {tasksQuery.data?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Aktive oppgaver</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'household' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('household')}
          className="flex-1"
        >
          <Users className="w-4 h-4 mr-2" />
          Husholdning
        </Button>
        <Button
          variant={selectedTab === 'sharing' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('sharing')}
          className="flex-1"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Deling
        </Button>
        <Button
          variant={selectedTab === 'communication' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('communication')}
          className="flex-1"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Kommunikasjon
        </Button>
        <Button
          variant={selectedTab === 'tasks' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('tasks')}
          className="flex-1"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Oppgaver
        </Button>
      </div>

      {/* Household Tab */}
      {selectedTab === 'household' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Medlemmer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {membersQuery.data?.map((member) => {
                  const role = getMemberRole(member.role)
                  const RoleIcon = role.icon

                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={role.color}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {role.label}
                        </Badge>
                        {member.isOnline && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sharing Tab */}
      {selectedTab === 'sharing' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Delte gjenstander
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sharedItemsQuery.data?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Delte av {item.sharedBy.name} • {new Date(item.sharedAt).toLocaleDateString('no-NO')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <MapPin className="w-3 h-3 mr-1" />
                        {item.location?.name}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Se detaljer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Communication Tab */}
      {selectedTab === 'communication' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Meldinger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Message List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messagesQuery.data?.map((message) => (
                    <div key={message.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{message.sender.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleString('no-NO')}
                          </span>
                        </div>
                        <div className="text-sm">{message.content}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Skriv en melding..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        handleSendMessage(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tasks Tab */}
      {selectedTab === 'tasks' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Oppgaver
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasksQuery.data?.map((task) => {
                  const status = getTaskStatus(task.status)
                  const StatusIcon = status.icon

                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          task.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <StatusIcon className={`w-5 h-5 ${
                            task.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {task.description} • Tildelt {task.assignee.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {new Date(task.dueDate).toLocaleDateString('no-NO')}
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

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Inviter medlem</CardTitle>
              <CardDescription>
                Send en invitasjon til et nytt medlem av husholdningen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">E-post</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="navn@eksempel.no"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Melding (valgfritt)</label>
                <Textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Skriv en personlig melding..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleInviteMember}
                  disabled={!inviteEmail || inviteMemberMutation.isLoading}
                  className="flex-1"
                >
                  Send invitasjon
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                >
                  Avbryt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
