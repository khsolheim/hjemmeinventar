'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Home, 
  Users, 
  Settings, 
  UserPlus, 
  Mail,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  LogOut,
  Shield,
  Eye,
  Package,
  MapPin,
  Activity,
  TrendingUp,
  Loader2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { HouseholdRole } from '@prisma/client'

interface InviteForm {
  email: string
  role: HouseholdRole
}

interface EditForm {
  name: string
  description: string
}

export default function HouseholdDetailPage() {
  const params = useParams()
  const router = useRouter()
  const householdId = params.id as string

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState<InviteForm>({
    email: '',
    role: 'MEMBER'
  })
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    description: ''
  })

  // Queries
  const { 
    data: household, 
    isLoading, 
    error, 
    refetch 
  } = trpc.households.getHousehold.useQuery(householdId)

  const { 
    data: stats 
  } = trpc.households.getStats.useQuery(householdId)

  // Mutations
  const inviteMutation = trpc.households.inviteUser.useMutation({
    onSuccess: () => {
      toast.success('Invitasjon sendt!')
      setIsInviteDialogOpen(false)
      setInviteForm({ email: '', role: 'MEMBER' })
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil ved invitasjon: ${error.message}`)
    }
  })

  const updateMutation = trpc.households.update.useMutation({
    onSuccess: () => {
      toast.success('Husholdning oppdatert!')
      setIsEditDialogOpen(false)
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil ved oppdatering: ${error.message}`)
    }
  })

  const updateRoleMutation = trpc.households.updateMemberRole.useMutation({
    onSuccess: () => {
      toast.success('Rolle oppdatert!')
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil ved rolleendring: ${error.message}`)
    }
  })

  const removeMemberMutation = trpc.households.removeMember.useMutation({
    onSuccess: () => {
      toast.success('Medlem fjernet')
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil ved fjerning: ${error.message}`)
    }
  })

  const leaveMutation = trpc.households.leave.useMutation({
    onSuccess: () => {
      toast.success('Du har forlatt husholdningen')
      router.push('/households')
    },
    onError: (error) => {
      toast.error(`Feil ved å forlate: ${error.message}`)
    }
  })

  const deleteMutation = trpc.households.delete.useMutation({
    onSuccess: () => {
      toast.success('Husholdning slettet')
      router.push('/households')
    },
    onError: (error) => {
      toast.error(`Feil ved sletting: ${error.message}`)
    }
  })

  // Handlers
  const handleInvite = async () => {
    if (!inviteForm.email.trim()) {
      toast.error('E-postadresse er påkrevd')
      return
    }

    inviteMutation.mutate({
      householdId,
      email: inviteForm.email.trim(),
      role: inviteForm.role
    })
  }

  const handleEdit = async () => {
    if (!editForm.name.trim()) {
      toast.error('Navn er påkrevd')
      return
    }

    updateMutation.mutate({
      id: householdId,
      name: editForm.name.trim(),
      description: editForm.description.trim() || undefined
    })
  }

  const handleRoleChange = (memberId: string, newRole: HouseholdRole) => {
    updateRoleMutation.mutate({
      householdId,
      memberId,
      role: newRole
    })
  }

  const handleRemoveMember = (memberId: string) => {
    removeMemberMutation.mutate({
      householdId,
      memberId
    })
  }

  const openEditDialog = () => {
    if (household) {
      setEditForm({
        name: household.name,
        description: household.description || ''
      })
      setIsEditDialogOpen(true)
    }
  }

  // Helper functions
  const getRoleBadge = (role: HouseholdRole) => {
    const variants = {
      ADMIN: 'default',
      MEMBER: 'secondary',
      READONLY: 'outline'
    } as const

    const labels = {
      ADMIN: 'Administrator',
      MEMBER: 'Medlem',
      READONLY: 'Kun visning'
    }

    const icons = {
      ADMIN: <Shield className="w-3 h-3 mr-1" />,
      MEMBER: <Users className="w-3 h-3 mr-1" />,
      READONLY: <Eye className="w-3 h-3 mr-1" />
    }

    return (
      <Badge variant={variants[role]} className="text-xs">
        {icons[role]}
        {labels[role]}
      </Badge>
    )
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !household) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600">Kunne ikke laste husholdning</h2>
              <p className="text-gray-500 mb-4">{error?.message || 'Ukjent feil'}</p>
              <Button asChild>
                <Link href="/households">Tilbake til husholdninger</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canManage = household.myRole === 'ADMIN'

  return (
    <div className="page container mx-auto px-4 py-8 cq">
      {/* Header */}
      <div className="mb-8 cq">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/households">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Tilbake
            </Link>
          </Button>
        </div>
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{household.name}</h1>
              <p className="text-muted-foreground">
                {household.description || 'Ingen beskrivelse'}
              </p>
              <div className="flex items-center gap-4 mt-2">
                {getRoleBadge(household.myRole)}
                <span className="text-sm text-muted-foreground">
                  {household.memberCount} medlemmer
                </span>
                <span className="text-sm text-muted-foreground">
                  Opprettet {format(new Date(household.createdAt), 'dd.MM.yyyy', { locale: nb })}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Inviter medlem
            </Button>
            
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={openEditDialog}>
                    <Edit className="mr-2 h-4 w-4" />
                    Rediger husholdning
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => leaveMutation.mutate(householdId)}
                    className="text-orange-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Forlat husholdning
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        onSelect={(e) => e.preventDefault()}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Slett husholdning
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Slett husholdning</AlertDialogTitle>
                        <AlertDialogDescription>
                          Er du sikker på at du vil slette "{household.name}" permanent? 
                          Denne handlingen kan ikke angres.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteMutation.mutate(householdId)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Slett permanent
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-6 cq">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Medlemmer
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Oversikt
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medlemmer ({household.memberCount})</CardTitle>
              <CardDescription>
                Administrer medlemmer og roller i husholdningen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {household.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.user.image || undefined} />
                        <AvatarFallback>
                          {getInitials(member.user.name, member.user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.user.name || member.user.email}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Medlem siden {format(new Date(member.joinedAt), 'dd.MM.yyyy', { locale: nb })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {canManage && member.user.id !== household.members.find(m => m.role === 'ADMIN')?.user.id ? (
                        <Select
                          value={member.role}
                          onValueChange={(value: HouseholdRole) => handleRoleChange(member.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Administrator</SelectItem>
                            <SelectItem value="MEMBER">Medlem</SelectItem>
                            <SelectItem value="READONLY">Kun visning</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getRoleBadge(member.role)
                      )}
                      
                      {canManage && member.role !== 'ADMIN' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Fjern medlem</AlertDialogTitle>
                              <AlertDialogDescription>
                                Er du sikker på at du vil fjerne {member.user.name || member.user.email} fra husholdningen?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Avbryt</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRemoveMember(member.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Fjern medlem
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <div className="cq-grid dashboard-grid gap-6" style={{"--card-min":"220px"} as any}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Totale gjenstander</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalItems}</div>
                  <p className="text-xs text-muted-foreground">
                    Fra alle medlemmer
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lokasjoner</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLocations}</div>
                  <p className="text-xs text-muted-foreground">
                    Unike oppbevaringssteder
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total verdi</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalValue.toLocaleString('nb-NO')} kr</div>
                  <p className="text-xs text-muted-foreground">
                    Estimert inventarverdi
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Siste uke</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.recentActivities}</div>
                  <p className="text-xs text-muted-foreground">
                    Aktiviteter siste 7 dager
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter nytt medlem</DialogTitle>
            <DialogDescription>
              Send invitasjon til en person via e-post
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-postadresse</Label>
              <Input
                id="email"
                type="email"
                placeholder="navn@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Rolle</Label>
              <Select 
                value={inviteForm.role} 
                onValueChange={(value: HouseholdRole) => setInviteForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Medlem - Kan legge til og redigere gjenstander</SelectItem>
                  <SelectItem value="READONLY">Kun visning - Kan bare se inventaret</SelectItem>
                  <SelectItem value="ADMIN">Administrator - Full tilgang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Avbryt
            </Button>
            <Button 
              onClick={handleInvite}
              disabled={inviteMutation.isPending || !inviteForm.email.trim()}
            >
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sender...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send invitasjon
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rediger husholdning</DialogTitle>
            <DialogDescription>
              Oppdater navn og beskrivelse for husholdningen
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Navn</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                maxLength={50}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Beskrivelse</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Avbryt
            </Button>
            <Button 
              onClick={handleEdit}
              disabled={updateMutation.isPending || !editForm.name.trim()}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Lagrer...
                </>
              ) : (
                'Lagre endringer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
