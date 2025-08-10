'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Activity, 
  Package, 
  MapPin, 
  UserCheck, 
  Trash2,
  Edit,
  Plus,
  RefreshCw,
  Clock,
  Eye,
  MessageCircle,
  Users
} from 'lucide-react'
import { useRealtimeEvents } from '@/lib/websocket/client'
import { format, formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'

interface LiveActivityFeedProps {
  householdId: string
  maxItems?: number
  showTyping?: boolean
  compact?: boolean
}

interface ActivityItem {
  type: string
  user: any
  householdId: string
  timestamp: Date
  item?: any
  loan?: any
  itemId?: string
}

export function LiveActivityFeed({ 
  householdId, 
  maxItems = 20, 
  showTyping = true,
  compact = false 
}: LiveActivityFeedProps) {
  const { recentActivities, liveEditing } = useRealtimeEvents()
  const [showAll, setShowAll] = useState(false)

  // Filter activities for this household
  const householdActivities = recentActivities
    .filter((activity: ActivityItem) => activity.householdId === householdId)
    .slice(0, showAll ? maxItems : 5)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'item_created': return <Plus className="w-4 h-4 text-green-600" />
      case 'item_updated': return <Edit className="w-4 h-4 text-blue-600" />
      case 'item_deleted': return <Trash2 className="w-4 h-4 text-red-600" />
      case 'item_moved': return <MapPin className="w-4 h-4 text-purple-600" />
      case 'loan_created': return <UserCheck className="w-4 h-4 text-orange-600" />
      case 'loan_returned': return <RefreshCw className="w-4 h-4 text-green-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityDescription = (activity: ActivityItem) => {
    const userName = activity.user.name || activity.user.email.split('@')[0]
    
    switch (activity.type) {
      case 'item_created':
        return `${userName} la til "${activity.item?.name}"`
      case 'item_updated':
        return `${userName} oppdaterte "${activity.item?.name}"`
      case 'item_deleted':
        return `${userName} slettet en gjenstand`
      case 'item_moved':
        return `${userName} flyttet en gjenstand`
      case 'loan_created':
        return `${userName} lånte ut "${activity.loan?.item?.name}"`
      case 'loan_returned':
        return `${userName} returnerte "${activity.loan?.item?.name}"`
      default:
        return `${userName} gjorde en endring`
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live aktivitet
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {householdActivities.length} nylige
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {householdActivities.length > 0 ? (
                householdActivities.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {getActivityIcon(activity.type)}
                    <span className="text-muted-foreground">
                      {getActivityDescription(activity)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: nb })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ingen aktivitet ennå
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live aktivitetsfeed
            </CardTitle>
            <CardDescription>
              Se endringer fra andre medlemmer i sanntid
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {householdActivities.length} aktiviteter
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Live Editing Indicators */}
        {showTyping && liveEditing.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Edit className="w-4 h-4 text-blue-600" />
              Noen redigerer nå
            </h4>
            <div className="space-y-1">
              {liveEditing.map((editing, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={editing.user.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(editing.user.name, editing.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {editing.user.name || editing.user.email.split('@')[0]} redigerer {editing.field}
                  </span>
                  <div className="flex space-x-1 ml-auto">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity List */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {householdActivities.length > 0 ? (
              householdActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={activity.user.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(activity.user.name, activity.user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">
                          {getActivityDescription(activity)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: nb })}</span>
                      </div>
                    </div>
                    
                    {/* Additional context */}
                    {activity.item && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        <Package className="w-3 h-3 inline mr-1" />
                        {activity.item.category?.name && (
                          <span className="mr-2">{activity.item.category.name}</span>
                        )}
                        {activity.item.location?.name && (
                          <span>i {activity.item.location.name}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Ingen aktivitet ennå</p>
                <p className="text-sm mt-1">
                  Aktiviteter fra andre medlemmer vil vises her
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Show More Button */}
        {recentActivities.filter((activity: ActivityItem) => activity.householdId === householdId).length > 5 && (
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Vis færre' : `Vis alle (${recentActivities.filter((activity: ActivityItem) => activity.householdId === householdId).length})`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
