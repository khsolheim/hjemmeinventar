'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  Home, 
  Users, 
  MoreVertical, 
  Settings, 
  UserPlus, 
  LogOut, 
  Trash2,
  Shield,
  Eye,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { HouseholdRole } from '@prisma/client'

interface HouseholdMember {
  id: string
  role: HouseholdRole
  joinedAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface Household {
  id: string
  name: string
  description: string | null
  createdAt: Date
  myRole: HouseholdRole
  memberCount: number
  members: HouseholdMember[]
}

interface HouseholdCardProps {
  household: Household
  onLeave?: (householdId: string) => void
  onDelete?: (householdId: string) => void
}

export function HouseholdCard({ household, onLeave, onDelete }: HouseholdCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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

  const canManage = household.myRole === 'ADMIN'

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isExpanded ? 'shadow-lg' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{household.name}</CardTitle>
              <CardDescription className="mt-1">
                {household.description || 'Ingen beskrivelse'}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getRoleBadge(household.myRole)}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/households/${household.id}`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Administrer
                  </Link>
                </DropdownMenuItem>
                
                {canManage && (
                  <DropdownMenuItem asChild>
                    <Link href={`/households/${household.id}/invite`}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Inviter medlem
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => onLeave?.(household.id)}
                  className="text-orange-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Forlat husholdning
                </DropdownMenuItem>
                
                {canManage && (
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(household.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Slett husholdning
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {household.memberCount} medlemmer
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Opprettet {format(new Date(household.createdAt), 'MMM yyyy', { locale: nb })}
              </span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Skjul detaljer' : 'Vis detaljer'}
            </Button>
          </div>

          {/* Members Preview */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Medlemmer:</span>
            <div className="flex -space-x-2">
              {household.members.slice(0, 5).map((member) => (
                <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                  <AvatarImage src={member.user.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(member.user.name, member.user.email)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {household.memberCount > 5 && (
                <div className="w-8 h-8 bg-muted border-2 border-background rounded-full flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{household.memberCount - 5}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Expanded Member List */}
          {isExpanded && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium text-sm">Alle medlemmer</h4>
              <div className="space-y-2">
                {household.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={member.user.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.user.name, member.user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Medlem siden {format(new Date(member.joinedAt), 'dd.MM.yyyy', { locale: nb })}
                        </p>
                      </div>
                    </div>
                    {getRoleBadge(member.role)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/households/${household.id}`}>
                <Settings className="w-4 h-4 mr-1" />
                Administrer
              </Link>
            </Button>
            
            {canManage && (
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/households/${household.id}/invite`}>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Inviter
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
