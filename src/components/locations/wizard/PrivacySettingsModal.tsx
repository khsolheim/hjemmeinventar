'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Lock, 
  Unlock, 
  Users, 
  UserPlus, 
  UserMinus,
  Eye,
  EyeOff,
  Clock,
  Shield,
  Home,
  Package,
  Archive,
  Folder,
  ShoppingBag,
  FileText,
  BookOpen,
  Square,
  X,
  Check
} from 'lucide-react'
import { WizardLocation } from './LocationWizardProvider'
import { LocationType } from '@prisma/client'
import { toast } from 'sonner'

interface PrivacySettingsModalProps {
  location: WizardLocation
  isOpen: boolean
  onClose: () => void
  onSave: (privacySettings: PrivacySettings) => void
}

export interface PrivacySettings {
  isPrivate: boolean
  allowedUsers: string[]
  shareLevel: 'none' | 'view' | 'edit'
  temporaryAccess?: {
    userId: string
    expiresAt: Date
    permissions: 'view' | 'edit'
  }[]
}

interface HouseholdMember {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MEMBER' | 'READONLY'
}

const locationTypeIcons = {
  [LocationType.ROOM]: Home,
  [LocationType.CABINET]: Package,
  [LocationType.RACK]: BookOpen,
  [LocationType.WALL_SHELF]: Square,
  [LocationType.SHELF]: Folder,
  [LocationType.DRAWER]: FileText,
  [LocationType.BOX]: Archive,
  [LocationType.BAG]: ShoppingBag,
  [LocationType.CONTAINER]: Package,
  [LocationType.SHELF_COMPARTMENT]: Folder,
  [LocationType.SECTION]: Square
}

const locationTypeLabels = {
  [LocationType.ROOM]: 'Rom',
  [LocationType.CABINET]: 'Skap',
  [LocationType.RACK]: 'Reol',
  [LocationType.WALL_SHELF]: 'Vegghengt hylle',
  [LocationType.SHELF]: 'Hylle',
  [LocationType.DRAWER]: 'Skuff',
  [LocationType.BOX]: 'Boks',
  [LocationType.BAG]: 'Pose',
  [LocationType.CONTAINER]: 'Beholder',
  [LocationType.SHELF_COMPARTMENT]: 'Hylle',
  [LocationType.SECTION]: 'Avsnitt'
}

export function PrivacySettingsModal({ 
  location, 
  isOpen, 
  onClose, 
  onSave 
}: PrivacySettingsModalProps) {
  const [isPrivate, setIsPrivate] = useState(location.isPrivate || false)
  const [shareLevel, setShareLevel] = useState<'none' | 'view' | 'edit'>('view')
  const [allowedUsers, setAllowedUsers] = useState<string[]>([])
  const [newUserEmail, setNewUserEmail] = useState('')
  const [temporaryAccess, setTemporaryAccess] = useState<{ userId: string; expiresAt: Date; permissions: 'view' | 'edit' }[]>([])
  const [tempAccessEmail, setTempAccessEmail] = useState('')
  const [tempAccessDuration, setTempAccessDuration] = useState('24') // hours
  const [tempAccessPermission, setTempAccessPermission] = useState<'view' | 'edit'>('view')

  // Mock household members (replace with actual tRPC query)
  const [householdMembers] = useState<HouseholdMember[]>([
    { id: '1', name: 'Anna Hansen', email: 'anna@example.com', role: 'ADMIN' },
    { id: '2', name: 'Bjørn Olsen', email: 'bjorn@example.com', role: 'MEMBER' },
    { id: '3', name: 'Camilla Berg', email: 'camilla@example.com', role: 'READONLY' }
  ])

  const Icon = locationTypeIcons[location.type]
  const typeLabel = locationTypeLabels[location.type]

  useEffect(() => {
    if (location.allowedUsers) {
      setAllowedUsers(location.allowedUsers)
    }
  }, [location])

  const handleAddUser = () => {
    if (!newUserEmail.trim()) return
    
    const existingMember = householdMembers.find(m => m.email === newUserEmail.trim())
    if (!existingMember) {
      toast.error('Bruker ikke funnet i husholdning')
      return
    }
    
    if (allowedUsers.includes(existingMember.id)) {
      toast.error('Bruker har allerede tilgang')
      return
    }

    setAllowedUsers([...allowedUsers, existingMember.id])
    setNewUserEmail('')
    toast.success(`Tilgang gitt til ${existingMember.name}`)
  }

  const handleRemoveUser = (userId: string) => {
    setAllowedUsers(allowedUsers.filter(id => id !== userId))
    const user = householdMembers.find(m => m.id === userId)
    toast.success(`Tilgang fjernet fra ${user?.name}`)
  }

  const handleAddTemporaryAccess = () => {
    if (!tempAccessEmail.trim()) return
    
    const existingMember = householdMembers.find(m => m.email === tempAccessEmail.trim())
    if (!existingMember) {
      toast.error('Bruker ikke funnet i husholdning')
      return
    }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + parseInt(tempAccessDuration))

    const newTempAccess = {
      userId: existingMember.id,
      expiresAt,
      permissions: tempAccessPermission
    }

    setTemporaryAccess([...temporaryAccess, newTempAccess])
    setTempAccessEmail('')
    toast.success(`Midlertidig tilgang gitt til ${existingMember.name}`)
  }

  const handleRemoveTemporaryAccess = (userId: string) => {
    setTemporaryAccess(temporaryAccess.filter(access => access.userId !== userId))
    const user = householdMembers.find(m => m.id === userId)
    toast.success(`Midlertidig tilgang fjernet fra ${user?.name}`)
  }

  const handleSave = () => {
    const settings: PrivacySettings = {
      isPrivate,
      allowedUsers,
      shareLevel,
      temporaryAccess
    }
    
    onSave(settings)
    onClose()
  }

  const getUserName = (userId: string) => {
    return householdMembers.find(m => m.id === userId)?.name || 'Ukjent bruker'
  }

  const getUserEmail = (userId: string) => {
    return householdMembers.find(m => m.id === userId)?.email || ''
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy innstillinger
          </DialogTitle>
          <DialogDescription>
            Administrer hvem som kan se og redigere denne lokasjonen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Icon className={`h-6 w-6 ${location.colorCode ? 'text-current' : 'text-gray-600'}`}
                      style={location.colorCode ? { color: location.colorCode } : {}} />
                <div>
                  <h3 className="font-medium">{location.displayName || location.name}</h3>
                  <p className="text-sm text-gray-500">
                    {typeLabel}
                    {location.autoNumber && ` • ${location.autoNumber}`}
                  </p>
                </div>
                {location.isPrivate && (
                  <Badge variant="destructive" className="ml-auto">
                    <Lock className="h-3 w-3 mr-1" />
                    Privat
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {isPrivate ? (
                  <Lock className="h-5 w-5 text-red-600" />
                ) : (
                  <Unlock className="h-5 w-5 text-green-600" />
                )}
                Privat lokasjon
              </CardTitle>
              <CardDescription>
                Kontroller hvem som kan se denne lokasjonen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {isPrivate ? 'Kun du kan se denne lokasjonen' : 'Synlig for alle i husholdningen'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isPrivate 
                      ? 'Andre husstandsmedlemmer kan ikke se eller redigere denne lokasjonen'
                      : 'Alle husstandsmedlemmer kan se denne lokasjonen'
                    }
                  </p>
                </div>
                <Switch
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sharing Settings (only if not private) */}
          {!isPrivate && (
            <>
              {/* Share Level */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Tilgangsnivå
                  </CardTitle>
                  <CardDescription>
                    Velg standard tilgangsnivå for husstandsmedlemmer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={shareLevel} onValueChange={(value: any) => setShareLevel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Kun se - kan ikke redigere
                        </div>
                      </SelectItem>
                      <SelectItem value="edit">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Se og redigere - full tilgang
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Specific User Access */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Spesifikk tilgang
                  </CardTitle>
                  <CardDescription>
                    Gi spesifikke husstandsmedlemmer tilgang
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add User */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="E-post til husstandsmedlem"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddUser()
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleAddUser} disabled={!newUserEmail.trim()}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Legg til
                    </Button>
                  </div>

                  {/* User List */}
                  {allowedUsers.length > 0 && (
                    <div className="space-y-2">
                      <Label>Brukere med tilgang:</Label>
                      {allowedUsers.map((userId) => (
                        <div key={userId} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{getUserName(userId)}</div>
                            <div className="text-sm text-gray-500">{getUserEmail(userId)}</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveUser(userId)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Temporary Access */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Midlertidig tilgang
                  </CardTitle>
                  <CardDescription>
                    Gi tidsbegrenset tilgang til spesifikke brukere
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Temporary Access */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input
                      placeholder="E-post"
                      value={tempAccessEmail}
                      onChange={(e) => setTempAccessEmail(e.target.value)}
                    />
                    <Select value={tempAccessDuration} onValueChange={setTempAccessDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 time</SelectItem>
                        <SelectItem value="6">6 timer</SelectItem>
                        <SelectItem value="24">24 timer</SelectItem>
                        <SelectItem value="168">1 uke</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={tempAccessPermission} onValueChange={(value: any) => setTempAccessPermission(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">Kun se</SelectItem>
                        <SelectItem value="edit">Se og redigere</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddTemporaryAccess} disabled={!tempAccessEmail.trim()}>
                      Legg til
                    </Button>
                  </div>

                  {/* Temporary Access List */}
                  {temporaryAccess.length > 0 && (
                    <div className="space-y-2">
                      <Label>Midlertidig tilgang:</Label>
                      {temporaryAccess.map((access) => (
                        <div key={access.userId} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{getUserName(access.userId)}</div>
                            <div className="text-sm text-gray-500">
                              {access.permissions === 'view' ? 'Kun se' : 'Se og redigere'} • 
                              Utløper: {access.expiresAt.toLocaleString('nb-NO')}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveTemporaryAccess(access.userId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            Lagre innstillinger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}