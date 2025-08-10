'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Loader2,
  Settings,
  Database,
  BarChart3,
  Bell,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface JobStatus {
  id: string
  name: string
  type: 'scheduled' | 'event-driven'
  status: 'running' | 'idle' | 'error' | 'disabled'
  lastRun?: string
  nextRun?: string
  runCount: number
  errorCount: number
  description: string
}

// Mock job statuses for demonstration
const mockJobStatuses: JobStatus[] = [
  {
    id: 'daily-inventory-maintenance',
    name: 'Daglig inventar vedlikehold',
    type: 'scheduled',
    status: 'idle',
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22 hours from now
    runCount: 47,
    errorCount: 0,
    description: 'Sjekker utløpsdatoer, forsinkede utlån og sender varsler'
  },
  {
    id: 'weekly-inventory-cleanup',
    name: 'Ukentlig opprydding',
    type: 'scheduled',
    status: 'idle',
    lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    runCount: 8,
    errorCount: 1,
    description: 'Rydder gamle aktiviteter og optimaliserer søkeindeks'
  },
  {
    id: 'monthly-analytics-report',
    name: 'Månedlig analytikk rapport',
    type: 'scheduled',
    status: 'idle',
    lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    runCount: 3,
    errorCount: 0,
    description: 'Genererer omfattende månedlige rapporter og innsikter'
  },
  {
    id: 'on-item-created',
    name: 'Ny gjenstand håndtering',
    type: 'event-driven',
    status: 'idle',
    runCount: 156,
    errorCount: 2,
    description: 'Indekserer nye gjenstander og planlegger utløpsvarsler'
  },
  {
    id: 'send-user-notification',
    name: 'Brukervarsel håndtering',
    type: 'event-driven',
    status: 'idle',
    runCount: 89,
    errorCount: 3,
    description: 'Sender push-varsler og logger notifikasjoner'
  }
]

export function BackgroundJobsMonitor() {
  const [jobs, setJobs] = useState<JobStatus[]>(mockJobStatuses)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState<string | null>(null)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(currentJobs => 
        currentJobs.map(job => ({
          ...job,
          // Randomly update run counts for event-driven jobs
          runCount: job.type === 'event-driven' 
            ? job.runCount + Math.floor(Math.random() * 2)
            : job.runCount
        }))
      )
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleTriggerJob = async (jobId: string) => {
    setIsLoading(true)
    try {
      // In a real implementation, this would call the Inngest API
      console.log(`Triggering job: ${jobId}`)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update job status
      setJobs(currentJobs =>
        currentJobs.map(job =>
          job.id === jobId
            ? {
                ...job,
                status: 'running' as const,
                lastRun: new Date().toISOString(),
                runCount: job.runCount + 1
              }
            : job
        )
      )

      toast.success(`Bakgrunnsjobb "${jobId}" startet`)
      
      // Simulate job completion after 3 seconds
      setTimeout(() => {
        setJobs(currentJobs =>
          currentJobs.map(job =>
            job.id === jobId
              ? { ...job, status: 'idle' as const }
              : job
          )
        )
      }, 3000)
      
    } catch (error) {
      toast.error('Kunne ikke starte bakgrunnsjobb')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshStatus = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, fetch job statuses from Inngest
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Status oppdatert')
    } catch (error) {
      toast.error('Kunne ikke oppdatere status')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: JobStatus['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'idle':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'disabled':
        return <Pause className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: JobStatus['status']) => {
    const variants = {
      running: 'default',
      idle: 'secondary',
      error: 'destructive',
      disabled: 'outline'
    } as const

    const labels = {
      running: 'Kjører',
      idle: 'Venter',
      error: 'Feil',
      disabled: 'Deaktivert'
    }

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const getTotalStats = () => {
    const totalRuns = jobs.reduce((sum, job) => sum + job.runCount, 0)
    const totalErrors = jobs.reduce((sum, job) => sum + job.errorCount, 0)
    const runningJobs = jobs.filter(job => job.status === 'running').length
    const errorRate = totalRuns > 0 ? (totalErrors / totalRuns) * 100 : 0

    return { totalRuns, totalErrors, runningJobs, errorRate }
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bakgrunnsjobber</h2>
          <p className="text-muted-foreground">
            Overvåk og administrer automatiserte oppgaver
          </p>
        </div>
        <Button 
          onClick={handleRefreshStatus} 
          disabled={isLoading}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Oppdater status
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale kjøringer</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRuns}</div>
            <p className="text-xs text-muted-foreground">
              Alle jobber til sammen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kjører nå</CardTitle>
            <Loader2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.runningJobs}</div>
            <p className="text-xs text-muted-foreground">
              Aktive bakgrunnsjobber
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale feil</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              Feilede kjøringer
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
              {(100 - stats.errorRate).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Vellykkede kjøringer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Rate Alert */}
      {stats.errorRate > 5 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Høy feilrate detektert ({stats.errorRate.toFixed(1)}%). 
            Vurder å sjekke jobbkonfigurasjonen.
          </AlertDescription>
        </Alert>
      )}

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Alle bakgrunnsjobber</CardTitle>
          <CardDescription>
            Status og kontroll for automatiserte oppgaver
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div 
                key={job.id}
                className={`border rounded-lg p-4 transition-colors hover:bg-muted/50 ${
                  selectedJob === job.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <h3 className="font-medium">{job.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {job.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {job.type === 'scheduled' ? 'Planlagt' : 'Event-drevet'}
                    </Badge>
                    {getStatusBadge(job.status)}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTriggerJob(job.id)
                      }}
                      disabled={isLoading || job.status === 'running'}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Kjør nå
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedJob === job.id && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Kjøringer:</span>
                        <div className="font-medium">{job.runCount}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Feil:</span>
                        <div className="font-medium">{job.errorCount}</div>
                      </div>
                      {job.lastRun && (
                        <div>
                          <span className="text-muted-foreground">Sist kjørt:</span>
                          <div className="font-medium">
                            {new Date(job.lastRun).toLocaleString('nb-NO')}
                          </div>
                        </div>
                      )}
                      {job.nextRun && (
                        <div>
                          <span className="text-muted-foreground">Neste kjøring:</span>
                          <div className="font-medium">
                            {new Date(job.nextRun).toLocaleString('nb-NO')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hurtighandlinger</CardTitle>
          <CardDescription>
            Vanlige vedlikeholdsoppgaver
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleTriggerJob('daily-inventory-maintenance')}
              disabled={isLoading}
              className="h-auto p-4 flex flex-col items-start gap-2"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="font-medium">Daglig vedlikehold</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Kjør daglig inventar sjekk manuelt
              </p>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => handleTriggerJob('generate-analytics')}
              disabled={isLoading}
              className="h-auto p-4 flex flex-col items-start gap-2"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="font-medium">Generer analytikk</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Oppdater analytikk data manuelt
              </p>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => handleTriggerJob('send-test-notification')}
              disabled={isLoading}
              className="h-auto p-4 flex flex-col items-start gap-2"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="font-medium">Test notifikasjoner</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Send test push notifikasjoner
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
