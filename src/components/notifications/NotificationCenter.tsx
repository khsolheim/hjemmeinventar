'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Calendar, 
  Package,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'expiry_warning' | 'expiry_critical' | 'low_stock' | 'overdue_loan'
  title: string
  message: string
  itemId?: string
  itemName?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: Date
  read: boolean
  actionUrl?: string
}

interface NotificationCenterProps {
  className?: string
}

const EMPTY: any[] = []

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  // Hent gjenstander som snart utløper eller har andre problemer
  const { status } = useSession()
  const { data: itemsData } = trpc.items.getAll.useQuery({ limit: 1000 }, { enabled: status === 'authenticated' })
  const items = (itemsData?.items ?? EMPTY)
  const { data: loansData } = trpc.loans.getActiveLoans.useQuery(undefined, { enabled: status === 'authenticated' })
  const loans = (loansData ?? EMPTY)

  // Generer notifikasjoner basert på data
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = []
      const now = new Date()
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

      // Sjekk for utløpsdatoer
      items.forEach(item => {
        if (item.expiryDate) {
          const expiryDate = new Date(item.expiryDate)
          
          if (expiryDate < now) {
            // Allerede utløpt
            newNotifications.push({
              id: `expiry-critical-${item.id}`,
              type: 'expiry_critical',
              title: 'Gjenstand utløpt!',
              message: `${item.name} utløp ${expiryDate.toLocaleDateString('no-NO')}`,
              itemId: item.id,
              itemName: item.name,
              priority: 'critical',
              createdAt: now,
              read: false,
              actionUrl: `/items?search=${encodeURIComponent(item.name)}`
            })
          } else if (expiryDate < threeDaysFromNow) {
            // Utløper innen 3 dager
            newNotifications.push({
              id: `expiry-warning-high-${item.id}`,
              type: 'expiry_warning',
              title: 'Utløper snart!',
              message: `${item.name} utløper ${expiryDate.toLocaleDateString('no-NO')}`,
              itemId: item.id,
              itemName: item.name,
              priority: 'high',
              createdAt: now,
              read: false,
              actionUrl: `/items?search=${encodeURIComponent(item.name)}`
            })
          } else if (expiryDate < sevenDaysFromNow) {
            // Utløper innen 7 dager
            newNotifications.push({
              id: `expiry-warning-medium-${item.id}`,
              type: 'expiry_warning',
              title: 'Utløper innen en uke',
              message: `${item.name} utløper ${expiryDate.toLocaleDateString('no-NO')}`,
              itemId: item.id,
              itemName: item.name,
              priority: 'medium',
              createdAt: now,
              read: false,
              actionUrl: `/items?search=${encodeURIComponent(item.name)}`
            })
          }
        }

        // Sjekk for lavt lager
        if (item.availableQuantity <= 1 && item.totalQuantity > 1) {
          newNotifications.push({
            id: `low-stock-${item.id}`,
            type: 'low_stock',
            title: 'Lavt lager',
            message: `${item.name} har bare ${item.availableQuantity} ${item.unit} igjen`,
            itemId: item.id,
            itemName: item.name,
            priority: 'medium',
            createdAt: now,
            read: false,
            actionUrl: `/items?search=${encodeURIComponent(item.name)}`
          })
        }
      })

      // Sjekk for forsinket retur av utlån
      loans.forEach(loan => {
        if (loan.expectedReturnDate && loan.status === 'OUT') {
          const returnDate = new Date(loan.expectedReturnDate)
          if (returnDate < now) {
            newNotifications.push({
              id: `overdue-loan-${loan.id}`,
              type: 'overdue_loan',
              title: 'Forsinket retur',
              message: `${loan.item.name} skulle vært returnert ${returnDate.toLocaleDateString('no-NO')}`,
              itemId: loan.item.id,
              itemName: loan.item.name,
              priority: 'high',
              createdAt: now,
              read: false,
              actionUrl: `/items?search=${encodeURIComponent(loan.item.name)}`
            })
          }
        }
      })

      setNotifications(newNotifications)
    }

    if (items.length > 0 || loans.length > 0) {
      generateNotifications()
    }
  // items/loans are stable due to EMPTY constant when undefined
  }, [items, loans])

  // Merk notifikasjon som lest
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  // Merk alle som lest
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setLastChecked(new Date())
  }

  // Slett notifikasjon
  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.read).length
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'expiry_critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'expiry_warning':
        return <Calendar className="w-4 h-4 text-orange-500" />
      case 'low_stock':
        return <Package className="w-4 h-4 text-blue-500" />
      case 'overdue_loan':
        return <Clock className="w-4 h-4 text-purple-500" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 border-red-200 text-red-800'
      case 'high':
        return 'bg-orange-100 border-orange-200 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800'
      case 'low':
        return 'bg-blue-100 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            aria-label={`Notifikasjoner (${unreadCount} uleste)`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant={criticalCount > 0 ? "destructive" : "secondary"}
                className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Notifikasjoner</h3>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Merk alle som lest
                </Button>
              )}
            </div>
            
            {unreadCount > 0 && (
              <div className="flex gap-2 mt-2">
                {criticalCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {criticalCount} kritiske
                  </Badge>
                )}
                {highPriorityCount > 0 && (
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                    {highPriorityCount} viktige
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ingen notifikasjoner</p>
                <p className="text-xs">Alt ser bra ut! 🎉</p>
              </div>
            ) : (
              notifications
                .sort((a, b) => {
                  // Sorter etter prioritet først, deretter uleste først
                  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
                  const aPriority = priorityOrder[a.priority]
                  const bPriority = priorityOrder[b.priority]
                  
                  if (aPriority !== bPriority) {
                    return bPriority - aPriority
                  }
                  
                  if (a.read !== b.read) {
                    return a.read ? 1 : -1
                  }
                  
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                })
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium line-clamp-1">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {notification.priority === 'critical' ? 'Kritisk' :
                                 notification.priority === 'high' ? 'Viktig' :
                                 notification.priority === 'medium' ? 'Medium' : 'Lav'}
                              </Badge>
                              
                              {notification.actionUrl && (
                                <Link href={notification.actionUrl} onClick={() => setIsOpen(false)}>
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Se detaljer
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="w-6 h-6 p-0"
                                aria-label="Merk som lest"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissNotification(notification.id)}
                              className="w-6 h-6 p-0"
                              aria-label="Lukk notifikasjon"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Sist oppdatert: {lastChecked.toLocaleTimeString('no-NO', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Enklere notifikasjonskomponent for dashboard
export function NotificationSummary({ className = '' }: NotificationCenterProps) {
  const { data: itemsData } = trpc.items.getAll.useQuery({ limit: 1000 })
  const items = itemsData?.items || []
  
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const expiringItems = items.filter(item => {
    if (!item.expiryDate) return false
    const expiryDate = new Date(item.expiryDate)
    return expiryDate <= sevenDaysFromNow
  })

  const expiredItems = expiringItems.filter(item => {
    const expiryDate = new Date(item.expiryDate!)
    return expiryDate < now
  })

  const lowStockItems = items.filter(item => 
    item.availableQuantity <= 1 && item.totalQuantity > 1
  )

  if (expiringItems.length === 0 && lowStockItems.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5" />
          Varslinger
        </CardTitle>
        <CardDescription>
          Viktige oppdateringer om inventaret ditt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {expiredItems.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-800">
                {expiredItems.length} gjenstand(er) utløpt
              </span>
            </div>
            <div className="space-y-1">
              {expiredItems.slice(0, 3).map(item => (
                <div key={item.id} className="text-sm text-red-700">
                  • {item.name} (utløp {new Date(item.expiryDate!).toLocaleDateString('no-NO')})
                </div>
              ))}
              {expiredItems.length > 3 && (
                <div className="text-sm text-red-600">
                  ...og {expiredItems.length - 3} til
                </div>
              )}
            </div>
          </div>
        )}

        {expiringItems.filter(item => new Date(item.expiryDate!) >= now).length > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-800">
                {expiringItems.filter(item => new Date(item.expiryDate!) >= now).length} gjenstand(er) utløper snart
              </span>
            </div>
            <div className="space-y-1">
              {expiringItems
                .filter(item => new Date(item.expiryDate!) >= now)
                .slice(0, 3)
                .map(item => (
                  <div key={item.id} className="text-sm text-orange-700">
                    • {item.name} (utløper {new Date(item.expiryDate!).toLocaleDateString('no-NO')})
                  </div>
                ))}
            </div>
          </div>
        )}

        {lowStockItems.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">
                {lowStockItems.length} gjenstand(er) med lavt lager
              </span>
            </div>
            <div className="space-y-1">
              {lowStockItems.slice(0, 3).map(item => (
                <div key={item.id} className="text-sm text-blue-700">
                  • {item.name} ({item.availableQuantity} {item.unit} igjen)
                </div>
              ))}
              {lowStockItems.length > 3 && (
                <div className="text-sm text-blue-600">
                  ...og {lowStockItems.length - 3} til
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
