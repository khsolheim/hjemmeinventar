'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, Clock, CheckCircle, XCircle, Pause, Play, RotateCcw, MoreHorizontal, Filter, Search, RefreshCw, Printer, Eye, Download, Trash2, Calendar, UserCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'
// TODO: Add these types when printing models are implemented
type PrintJob = any
type PrintJobStatus = 'CANCELLED' | 'QUEUED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'RETRYING' | 'SCHEDULED' | 'PENDING_APPROVAL'
type LabelTemplate = any
type PrinterProfile = any

interface JobWithDetails extends PrintJob {
  template: LabelTemplate
  printer: PrinterProfile
  printingCosts: Array<{
    totalCost: number
  }>
}

export default function PrintJobsPage() {
  const [selectedTab, setSelectedTab] = useState<'queue' | 'history' | 'scheduled'>('queue')
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [filters, setFilters] = useState({
    status: 'all' as PrintJobStatus | 'all',
    priority: 'all' as 'LOW' | 'MEDIUM' | 'HIGH' | 'all',
    printer: 'all',
    search: ''
  })
  const [selectedJobDetails, setSelectedJobDetails] = useState<string | null>(null)

  // Auto refresh every 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(true)

  // tRPC queries - temporarily disabled
  // const { 
  //   data: jobs, 
  //   isLoading, 
  //   refetch: refetchJobs 
  // } = trpc.printing.getJobQueue.useQuery({
  //   status: filters.status === 'all' ? undefined : [filters.status],
  //   limit: 100
  // }, {
  //   refetchInterval: autoRefresh ? 30000 : false // 30 seconds
  // })

  // const { data: printers } = trpc.printing.listPrinters.useQuery()
  
  // Placeholder data
  const jobs: any[] = []
  const isLoading = false
  const refetchJobs = () => {}
  const printers: any[] = []

  // Mutations - temporarily disabled
  // const cancelJobMutation = trpc.printing.cancelJob.useMutation({
  //   onSuccess: () => {
  //     refetchJobs()
  //   }
  // })

  // const retryJobMutation = trpc.printing.retryJob.useMutation({
  //   onSuccess: () => {
  //     refetchJobs()
  //   }
  // })

  // const pauseJobMutation = trpc.printing.pauseJob.useMutation({
  //   onSuccess: () => {
  //     refetchJobs()
  //   }
  // })

  // const resumeJobMutation = trpc.printing.resumeJob.useMutation({
  //   onSuccess: () => {
  //     refetchJobs()
  //   }
  // })
  
  // Placeholder mutations
  const cancelJobMutation = { mutateAsync: async (data: any) => {}, isPending: false }
  const retryJobMutation = { mutateAsync: async (data: any) => {}, isPending: false }
  const pauseJobMutation = { mutateAsync: async (data: any) => {}, isPending: false }
  const resumeJobMutation = { mutateAsync: async (data: any) => {}, isPending: false }

  // Filter jobs based on current filters
  const filteredJobs = jobs?.filter((job: any) => {
    if (filters.search && !job.template.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !job.id.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.printer !== 'all' && job.printerId !== filters.printer) {
      return false
    }
    if (filters.priority !== 'all' && job.priority !== filters.priority) {
      return false
    }
    return true
  }) || []

  // Group jobs by status for tabs
  const queueJobs = filteredJobs.filter((job: any) => ['PENDING', 'PROCESSING', 'PAUSED'].includes(job.status))
  const historyJobs = filteredJobs.filter((job: any) => ['SUCCESS', 'FAILED', 'CANCELLED'].includes(job.status))
  const scheduledJobs = filteredJobs.filter((job: any) => job.scheduledFor && new Date(job.scheduledFor) > new Date())

  const getStatusBadge = (status: PrintJobStatus) => {
    const config: Record<string, any> = {
      PENDING: { variant: 'secondary' as const, icon: Clock, label: 'Venter' },
      PROCESSING: { variant: 'default' as const, icon: Play, label: 'Prosesserer' },
      SUCCESS: { variant: 'default' as const, icon: CheckCircle, label: 'Fullført' },
      FAILED: { variant: 'destructive' as const, icon: XCircle, label: 'Feilet' },
      CANCELLED: { variant: 'outline' as const, icon: XCircle, label: 'Avbrutt' },
      PAUSED: { variant: 'secondary' as const, icon: Pause, label: 'Pauset' },
      QUEUED: { variant: 'secondary' as const, icon: Clock, label: 'I kø' },
      RETRYING: { variant: 'secondary' as const, icon: RefreshCw, label: 'Forsøker igjen' },
      SCHEDULED: { variant: 'outline' as const, icon: Calendar, label: 'Planlagt' },
      PENDING_APPROVAL: { variant: 'secondary' as const, icon: UserCheck, label: 'Venter godkjenning' }
    }

    const { variant, icon: Icon, label } = config[status]
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    const config = {
      LOW: { variant: 'outline' as const, label: 'Lav' },
      MEDIUM: { variant: 'secondary' as const, label: 'Medium' },
      HIGH: { variant: 'destructive' as const, label: 'Høy' }
    }

    const { variant, label } = config[priority]
    return <Badge variant={variant}>{label}</Badge>
  }

  const handleJobAction = async (jobId: string, action: string) => {
    try {
      switch (action) {
        case 'cancel':
          await cancelJobMutation.mutateAsync({ jobId })
          break
        case 'retry':
          await retryJobMutation.mutateAsync({ jobId })
          break
        case 'pause':
          await pauseJobMutation.mutateAsync({ jobId })
          break
        case 'resume':
          await resumeJobMutation.mutateAsync({ jobId })
          break
      }
    } catch (error) {
      console.error('Feil ved job-handling:', error)
    }
  }

  const handleBulkAction = async (action: string) => {
    // TODO: Implement bulk actions
    console.log('Bulk action:', action, 'for jobs:', selectedJobs)
  }

  const JobCard = ({ job }: { job: JobWithDetails }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedJobs.includes(job.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedJobs([...selectedJobs, job.id])
                  } else {
                    setSelectedJobs(selectedJobs.filter(id => id !== job.id))
                  }
                }}
                className="rounded border-gray-300"
              />
              <CardTitle className="text-sm truncate">
                {job.template.name}
              </CardTitle>
            </div>
            {getStatusBadge(job.status)}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSelectedJobDetails(job.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Se detaljer
              </DropdownMenuItem>
              {job.status === 'PENDING' && (
                <DropdownMenuItem onClick={() => handleJobAction(job.id, 'pause')}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </DropdownMenuItem>
              )}
              {job.status === 'PAUSED' && (
                <DropdownMenuItem onClick={() => handleJobAction(job.id, 'resume')}>
                  <Play className="h-4 w-4 mr-2" />
                  Fortsett
                </DropdownMenuItem>
              )}
              {job.status === 'FAILED' && (
                <DropdownMenuItem onClick={() => handleJobAction(job.id, 'retry')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Prøv igjen
                </DropdownMenuItem>
              )}
              {['PENDING', 'PROCESSING', 'PAUSED'].includes(job.status) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleJobAction(job.id, 'cancel')}
                    className="text-red-600"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Avbryt
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardDescription className="text-xs">
          Job-ID: {job.id.slice(0, 8)}...
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-xs text-muted-foreground">Skriver</Label>
            <div className="flex items-center gap-2">
              <Printer className="h-3 w-3" />
              <span className="truncate">{job.printer.name}</span>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Prioritet</Label>
            <div>{getPriorityBadge(job.priority)}</div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Antall</Label>
            <span>{job.quantity} kopier</span>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Kostnad</Label>
            <span>
              {job.printingCosts.reduce((sum, cost) => sum + cost.totalCost, 0).toFixed(2)} kr
            </span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Opprettet {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: nb })}
        </div>
        
        {job.scheduledFor && (
          <div className="text-xs text-muted-foreground">
            Planlagt: {formatDistanceToNow(new Date(job.scheduledFor), { addSuffix: true, locale: nb })}
          </div>
        )}
        
        {job.errorMessage && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {job.errorMessage}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Print Jobs</h1>
          <p className="text-muted-foreground">Håndter og overvåk utskriftsjobber</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchJobs()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Oppdater
          </Button>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-sm">Auto-oppdater:</Label>
            <input
              id="auto-refresh"
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Søk</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Søk i jobber..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statuser</SelectItem>
                  <SelectItem value="PENDING">Venter</SelectItem>
                  <SelectItem value="PROCESSING">Prosesserer</SelectItem>
                  <SelectItem value="SUCCESS">Fullført</SelectItem>
                  <SelectItem value="FAILED">Feilet</SelectItem>
                  <SelectItem value="CANCELLED">Avbrutt</SelectItem>
                  <SelectItem value="PAUSED">Pauset</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Prioritet</Label>
              <Select 
                value={filters.priority} 
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle prioriteter</SelectItem>
                  <SelectItem value="HIGH">Høy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Lav</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Skriver</Label>
              <Select 
                value={filters.printer} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, printer: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle skrivere</SelectItem>
                  {printers?.map((printer: any) => (
                    <SelectItem key={printer.id} value={printer.id}>
                      {printer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selectedJobs.length > 0 && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedJobs.length} jobber valgt
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('pause')}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause alle
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('cancel')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Avbryt alle
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedJobs([])}
                >
                  Avmerk alle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job tabs */}
      <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Kø ({queueJobs.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Historikk ({historyJobs.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Planlagt ({scheduledJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : queueJobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ingen jobber i køen</h3>
                <p className="text-muted-foreground">
                  Alle utskriftsjobber er fullført eller det er ingen aktive jobber.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {queueJobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {historyJobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ingen historikk</h3>
                <p className="text-muted-foreground">
                  Fullførte og feilede jobber vil vises her.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historyJobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduledJobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ingen planlagte jobber</h3>
                <p className="text-muted-foreground">
                  Jobber planlagt for fremtidige tidspunkter vil vises her.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledJobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Job details dialog */}
      {selectedJobDetails && (
        <Dialog open={!!selectedJobDetails} onOpenChange={() => setSelectedJobDetails(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Job-detaljer</DialogTitle>
              <DialogDescription>
                Detaljert informasjon om utskriftsjobben
              </DialogDescription>
            </DialogHeader>
            {(() => {
              const job = jobs?.find((j: any) => j.id === selectedJobDetails)
              if (!job) return null
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Job-ID</Label>
                      <p className="text-sm text-muted-foreground">{job.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">{getStatusBadge(job.status)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Mal</Label>
                      <p className="text-sm text-muted-foreground">{job.template.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Skriver</Label>
                      <p className="text-sm text-muted-foreground">{job.printer.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Prioritet</Label>
                      <div className="mt-1">{getPriorityBadge(job.priority)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Antall</Label>
                      <p className="text-sm text-muted-foreground">{job.quantity} kopier</p>
                    </div>
                  </div>
                  
                  {job.data && (
                    <div>
                      <Label className="text-sm font-medium">Print-data</Label>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(job.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {job.errorMessage && (
                    <div>
                      <Label className="text-sm font-medium text-red-600">Feilmelding</Label>
                      <p className="text-sm text-red-600 mt-1">{job.errorMessage}</p>
                    </div>
                  )}
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}