'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Users, 
  Circle, 
  Eye, 
  Edit, 
  MessageCircle,
  ChevronDown,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useSocket } from '@/lib/websocket/client'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

interface OnlineUsersListProps {
  householdId: string
  compact?: boolean
  showActivity?: boolean
}

export function OnlineUsersList({ householdId, compact = false, showActivity = true }: OnlineUsersListProps) {
  const { isConnected, onlineUsers } = useSocket()
  const [showDetails, setShowDetails] = useState(false)

  // Filter users for this household
  const householdUsers = onlineUsers.filter(user => user.householdId === householdId)

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm text-muted-foreground">
            {householdUsers.length} online
          </span>
        </div>
        
        {householdUsers.length > 0 && (
          <Popover open={showDetails} onOpenChange={setShowDetails}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <div className="flex -space-x-1">
                  {householdUsers.slice(0, 3).map((user, index) => (
                    <Avatar key={user.id} className="w-6 h-6 border-2 border-background">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {householdUsers.length > 3 && (
                    <div className="w-6 h-6 bg-muted border-2 border-background rounded-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        +{householdUsers.length - 3}
                      </span>
                    </div>
                  )}
                </div>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4">
                <h4 className="font-medium mb-3">Online medlemmer</h4>
                <div className="space-y-2">
                  {householdUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.name, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <Circle className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor('online')} rounded-full border-2 border-background`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {user.name || user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Aktiv nå
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Online
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <CardTitle className="text-lg">Online medlemmer</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="secondary" className="text-xs">
                <Circle className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                Tilkoblet
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <Circle className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                Frakoblet
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          {householdUsers.length === 0 
            ? 'Ingen andre medlemmer er online for øyeblikket'
            : `${householdUsers.length} medlemmer er online`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {householdUsers.length > 0 ? (
          <div className="space-y-3">
            {householdUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback>
                        {getInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <Circle className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor('online')} rounded-full border-2 border-background`} />
                  </div>
                  <div>
                    <p className="font-medium">
                      {user.name || user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    {showActivity && (
                      <div className="flex items-center gap-2 mt-1">
                        <Eye className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-muted-foreground">
                          Ser på inventaret
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary" className="text-xs">
                    Online
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Aktiv nå
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Ingen andre medlemmer er online</p>
            <p className="text-sm mt-1">
              De vil vises her når de besøker siden
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
