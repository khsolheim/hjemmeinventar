'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  QrCode,
  Bell,
  Zap,
  Plus,
  X,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { useSession } from 'next-auth/react'

const quickActions = [
  {
    title: 'Hurtig utskrift',
    description: 'Skriv ut QR-etiketter',
    icon: Zap,
    href: '/printing/wizard',
    color: 'bg-blue-500'
  },
  {
    title: 'Etikettmaler',
    description: 'Administrer maler',
    icon: QrCode,
    href: '/printing/templates',
    color: 'bg-green-500'
  }
]

export default function PrintingDashboard() {
  const { status } = useSession()
  const { data: itemsData } = trpc.items.getAll.useQuery({ limit: 1000 }, { enabled: status === 'authenticated' })

  // Generate real reminders based on system state
  const generateReminders = () => {
    const reminders = []

    // Check if user has items without QR codes
    if (itemsData?.items && Array.isArray(itemsData.items)) {
      const itemsWithoutQR = itemsData.items.filter(item => !item.qrCode)
      if (itemsWithoutQR.length > 0) {
        reminders.push({
          id: 1,
          type: 'info',
          title: 'Gjenstander uten QR-kode',
          description: `${itemsWithoutQR.length} gjenstander mangler QR-kode-etikett`,
          action: 'Skriv ut etiketter',
          actionHref: '/printing/wizard',
          dismissible: true,
          icon: Package
        })
      }
    }

    return reminders
  }

  const [visibleReminders, setVisibleReminders] = useState<any[]>([])

  // Update reminders when data loads
  useEffect(() => {
    const reminders = generateReminders()
    setVisibleReminders(reminders)
  }, [itemsData])

  const dismissReminder = (id: number) => {
    setVisibleReminders(prev => prev.filter(r => r.id !== id))
  }

  const getReminderStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          icon: 'text-amber-600'
        }
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600'
        }
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: 'text-green-600'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-600'
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Etikettutskrift</h1>
          <p className="text-muted-foreground">
            Enkel og effektiv etikettproduksjon
          </p>
        </div>
        <Button asChild>
          <Link href="/printing/wizard">
            <Plus className="h-4 w-4 mr-2" />
            Ny utskrift
          </Link>
        </Button>
      </div>

      {/* Reminder Boxes */}
      {visibleReminders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Viktige påminnelser</h2>
          </div>
          <div className="space-y-2">
            {visibleReminders.map((reminder) => {
              const styles = getReminderStyles(reminder.type)
              const IconComponent = reminder.icon

              return (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-lg border ${styles.bg} ${styles.border} ${styles.text}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <IconComponent className={`h-5 w-5 mt-0.5 ${styles.icon}`} />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{reminder.title}</h3>
                        <p className="text-xs opacity-80 mt-1">{reminder.description}</p>
                        {reminder.action && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 h-7 text-xs"
                            asChild
                          >
                            <Link href={reminder.actionHref}>
                              {reminder.action}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                    {reminder.dismissible && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-white/20"
                        onClick={() => dismissReminder(reminder.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon
          return (
            <Card key={index} className="group hover:shadow-md transition-all cursor-pointer">
              <Link href={action.href} prefetch={false}>
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-muted-foreground mt-2">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          )
        })}
      </div>
    </div>
  )
}