'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Printer, 
  QrCode, 
  BarChart3, 
  Settings, 
  Plus, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  FileText,
  Zap,
  Users,
  Calendar,
  Target,
  Archive,
  Sparkles,
  Ruler
} from 'lucide-react'
import Link from 'next/link'

// Mock data for dashboard
const mockStats = {
  totalPrintJobs: 234,
  successfulJobs: 221,
  failedJobs: 13,
  averageDuration: 2.3,
  totalCost: 1250.50,
  templatesCount: 8,
  printersOnline: 2,
  printersTotal: 3,
  costSavings: 15.5,
  todayJobs: 12,
  weekJobs: 78,
  monthJobs: 234
}

const recentJobs = [
  { id: '1', template: 'Standard HMS Etikett', status: 'SUCCESS', createdAt: '10:45', copies: 5, duration: '2.1s' },
  { id: '2', template: 'Kompakt Etikett', status: 'SUCCESS', createdAt: '10:32', copies: 12, duration: '4.2s' },
  { id: '3', template: 'Detaljert Inventar', status: 'FAILED', createdAt: '10:15', copies: 1, duration: '0.8s' },
  { id: '4', template: 'Standard HMS Etikett', status: 'SUCCESS', createdAt: '09:58', copies: 3, duration: '1.9s' },
  { id: '5', template: 'Strekkode Etikett', status: 'SUCCESS', createdAt: '09:45', copies: 8, duration: '3.1s' }
]

const popularTemplates = [
  { name: 'Standard HMS Etikett', usage: 89, trend: '+12%' },
  { name: 'Kompakt Etikett', usage: 65, trend: '+8%' },
  { name: 'Detaljert Inventar', usage: 34, trend: '+15%' },
  { name: 'Strekkode Etikett', usage: 23, trend: '-2%' }
]

const quickActions = [
  {
    title: 'Skriv ut HMS Etikett',
    description: 'Standard QR-etikett for gjenstander',
    icon: QrCode,
    href: '/printing/wizard?template=standard',
    color: 'bg-blue-500'
  },
  {
    title: 'Opprett ny mal',
    description: 'Lag en tilpasset etikettmal',
    icon: Plus,
    href: '/printing/templates/new',
    color: 'bg-green-500'
  },
  {
    title: 'Etikett størrelser',
    description: 'Administrer størrelser for etiketter',
    icon: Ruler,
    href: '/printing/sizes',
    color: 'bg-indigo-500'
  },
  {
    title: 'Administrer skrivere',
    description: 'Konfigurer og test skrivere',
    icon: Printer,
    href: '/printing/printers',
    color: 'bg-purple-500'
  },
  {
    title: 'Se analyse',
    description: 'Utskriftsstatistikk og rapporter',
    icon: BarChart3,
    href: '/printing/analytics',
    color: 'bg-orange-500'
  }
]

export default function PrintingDashboard() {
  const successRate = Math.round((mockStats.successfulJobs / mockStats.totalPrintJobs) * 100)
  const printerUptime = Math.round((mockStats.printersOnline / mockStats.printersTotal) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Etikettutskrift</h1>
          <p className="text-muted-foreground">
            Moderne printing-system for HMS
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/printing/settings">
              <Settings className="h-4 w-4 mr-2" />
              Innstillinger
            </Link>
          </Button>
          <Button asChild>
            <Link href="/printing/wizard">
              <Zap className="h-4 w-4 mr-2" />
              Hurtigutskrift
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon
          return (
            <Card key={index} className="group hover:shadow-md transition-all cursor-pointer">
              <Link href={action.href}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
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

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">I dag</p>
                <p className="text-2xl font-bold">{mockStats.todayJobs}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +25% fra i går
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suksessrate</p>
                <p className="text-2xl font-bold">{successRate}%</p>
                <p className="text-xs text-green-600">Meget bra!</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Skrivere online</p>
                <p className="text-2xl font-bold">{mockStats.printersOnline}/{mockStats.printersTotal}</p>
                <p className="text-xs text-muted-foreground">{printerUptime}% oppetid</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Printer className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kostnad (mnd)</p>
                <p className="text-2xl font-bold">kr {mockStats.totalCost.toFixed(0)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {mockStats.costSavings}% besparelse
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Jobs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Siste utskriftsjobber
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/printing/jobs">Se alle</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${
                      job.status === 'SUCCESS' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {job.status === 'SUCCESS' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{job.template}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.copies} kopi{job.copies !== 1 ? 'er' : ''} • {job.duration}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={job.status === 'SUCCESS' ? 'default' : 'destructive'}>
                      {job.status === 'SUCCESS' ? 'Vellykket' : 'Feilet'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{job.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Templates & Quick Stats */}
        <div className="space-y-6">
          {/* Popular Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Populære maler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularTemplates.map((template, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{template.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${
                          template.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {template.trend}
                        </span>
                        <Badge variant="secondary">{template.usage}</Badge>
                      </div>
                    </div>
                    <Progress value={template.usage} className="h-2" />
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/printing/templates">
                  <FileText className="h-4 w-4 mr-2" />
                  Administrer maler
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Månedsoversikt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{mockStats.monthJobs}</p>
                  <p className="text-xs text-muted-foreground">Totalt jobber</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{mockStats.templatesCount}</p>
                  <p className="text-xs text-muted-foreground">Aktive maler</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Gjennomsnittlig tid:</span>
                  <span className="font-medium">{mockStats.averageDuration}s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Feilrate:</span>
                  <span className="font-medium text-red-600">
                    {Math.round((mockStats.failedJobs / mockStats.totalPrintJobs) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Besparelse:</span>
                  <span className="font-medium text-green-600">kr {mockStats.costSavings}</span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/printing/analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Detaljert analyse
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Systemstatus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium">Print Service</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium">Template Engine</p>
                <p className="text-xs text-muted-foreground">Aktiv</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Queue Processor</p>
                <p className="text-xs text-muted-foreground">3 jobber i kø</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-muted-foreground">Tilkoblet</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}