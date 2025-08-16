'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Printer, QrCode, BarChart3, Settings, Plus, Search, Filter } from 'lucide-react'
import { trpc } from '../../../lib/trpc/client'
import { Input } from '../../../components/ui/input'
import Link from 'next/link'

export default function PrintingDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  
  // Get print statistics
  const { data: printStats, isLoading: statsLoading } = trpc.printing.getPrintStats.useQuery({
    timeRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      to: new Date()
    }
  })

  // Get recent templates
  const { data: templates, isLoading: templatesLoading } = trpc.printing.listTemplates.useQuery({
    search: searchQuery
  })

  // Get recent jobs
  const { data: recentJobs, isLoading: jobsLoading } = trpc.printing.getJobQueue.useQuery({
    limit: 5
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Etikettutskrift</h1>
          <p className="text-muted-foreground">
            Administrer etikettmaler og utskriftsjobber
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/printing/templates">
              <QrCode className="h-4 w-4 mr-2" />
              Maler
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/printing/jobs">
              <Printer className="h-4 w-4 mr-2" />
              Jobber
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/printing/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyse
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale utskrifter</CardTitle>
            <Printer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : printStats?.totalJobs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Siste 30 dager
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suksessrate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `${Math.round((printStats?.successRate || 0) * 100)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Vellykkede utskrifter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale kostnader</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `${printStats?.costBreakdown.totalCost?.toFixed(2) || '0.00'} NOK`}
            </div>
            <p className="text-xs text-muted-foreground">
              Siste 30 dager
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive maler</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templatesLoading ? '...' : templates?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tilgjengelige maler
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hurtighandlinger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/printing/wizard">
                <Plus className="h-4 w-4 mr-2" />
                Ny utskriftsjobb
              </Link>
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline">
                <Link href="/printing/templates/new">
                  <QrCode className="h-4 w-4 mr-2" />
                  Ny mal
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/printing/labels">
                  <Printer className="h-4 w-4 mr-2" />
                  Etiketter
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Nylige utskriftsjobber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobsLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Laster...
                </div>
              ) : recentJobs && recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{job.jobTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.copies} kopier • {new Date(job.createdAt).toLocaleDateString('nb-NO')}
                      </p>
                    </div>
                    <Badge variant={
                      job.status === 'SUCCESS' ? 'default' :
                      job.status === 'FAILED' ? 'destructive' :
                      job.status === 'PROCESSING' ? 'secondary' :
                      'outline'
                    }>
                      {job.status === 'SUCCESS' ? 'Fullført' :
                       job.status === 'FAILED' ? 'Feilet' :
                       job.status === 'PROCESSING' ? 'Behandles' :
                       job.status === 'QUEUED' ? 'I kø' :
                       job.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Printer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ingen utskriftsjobber ennå</p>
                  <Button asChild className="mt-2" size="sm">
                    <Link href="/printing/wizard">
                      Start første utskrift
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Populære maler</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Søk maler..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templatesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            ) : templates && templates.length > 0 ? (
              templates.slice(0, 6).map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {template.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {template.description || 'Ingen beskrivelse'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{template.size}</span>
                      <span>{template.usageCount} ganger brukt</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingen maler funnet</p>
                <Button asChild className="mt-2" size="sm">
                  <Link href="/printing/templates/new">
                    Opprett første mal
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}