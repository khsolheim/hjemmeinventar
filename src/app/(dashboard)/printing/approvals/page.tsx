'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { CheckCircle, XCircle, Clock, AlertCircle, Plus, MoreHorizontal, Eye, Edit, Trash2, Users, DollarSign, Calendar, Filter, Search, UserCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'
import type { PrintApprovalWorkflow, PrintApproval, ApprovalStatus } from '@prisma/client'

interface WorkflowWithDetails extends PrintApprovalWorkflow {
  approvals: Array<PrintApproval & {
    approver: {
      id: string
      name: string
      email: string
    }
  }>
  printJob: {
    id: string
    jobTitle: string
    costEstimate: number
    template: {
      name: string
    }
  }
}

export default function ApprovalsPage() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'completed' | 'rules'>('pending')
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [showCreateRule, setShowCreateRule] = useState(false)
  const [filters, setFilters] = useState({
    priority: 'all' as 'LOW' | 'MEDIUM' | 'HIGH' | 'all',
    requester: 'all',
    search: ''
  })

  // tRPC queries
  // TODO: Implement getApprovalWorkflows in printing router
  const workflows: any[] = []
  const isLoading = false
  const refetchWorkflows = () => {}
  
  // const { 
  //   data: workflows, 
  //   isLoading, 
  //   refetch: refetchWorkflows 
  // } = trpc.printing.getApprovalWorkflows.useQuery({
  //   status: selectedTab === 'pending' ? ['PENDING', 'IN_PROGRESS'] : 
  //           selectedTab === 'completed' ? ['APPROVED', 'REJECTED'] : undefined
  // })

  const { data: approvalRules } = trpc.printing.getApprovalRules.useQuery()

  // Mutations
  const approveJobMutation = trpc.printing.approveJob.useMutation({
    onSuccess: () => {
      refetchWorkflows()
    }
  })

  const rejectJobMutation = trpc.printing.rejectJob.useMutation({
    onSuccess: () => {
      refetchWorkflows()
    }
  })

  const createApprovalRuleMutation = trpc.printing.createApprovalRule.useMutation({
    onSuccess: () => {
      setShowCreateRule(false)
    }
  })

  // Filter workflows
  const filteredWorkflows = workflows?.filter(workflow => {
    if (filters.search && !workflow.printJob.jobTitle.toLowerCase().includes(filters.search.toLowerCase()) && 
        !workflow.printJob.template.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.requester !== 'all' && workflow.requestedBy !== filters.requester) {
      return false
    }
    return true
  }) || []

  const getStatusBadge = (status: ApprovalStatus) => {
    const config = {
      PENDING: { variant: 'secondary' as const, icon: Clock, label: 'Venter' },
      IN_PROGRESS: { variant: 'default' as const, icon: Clock, label: 'Under behandling' },
      APPROVED: { variant: 'default' as const, icon: CheckCircle, label: 'Godkjent' },
      REJECTED: { variant: 'destructive' as const, icon: XCircle, label: 'Avvist' },
      EXPIRED: { variant: 'outline' as const, icon: AlertCircle, label: 'Utløpt' }
    }

    const { variant, icon: Icon, label } = config[status]
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    )
  }

  const handleApprove = async (workflowId: string, comments?: string) => {
    try {
      await approveJobMutation.mutateAsync({ 
        workflowId, 
        comments: comments || 'Godkjent' 
      })
    } catch (error) {
      console.error('Feil ved godkjenning:', error)
    }
  }

  const handleReject = async (workflowId: string, reason: string) => {
    try {
      await rejectJobMutation.mutateAsync({ 
        workflowId, 
        reason 
      })
    } catch (error) {
      console.error('Feil ved avvisning:', error)
    }
  }

  const WorkflowCard = ({ workflow }: { workflow: WorkflowWithDetails }) => {
    const currentApproval = workflow.approvals.find(a => a.status === 'PENDING')
    const isExpired = workflow.expiresAt && new Date(workflow.expiresAt) < new Date()
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-sm">{workflow.printJob.jobTitle}</CardTitle>
              {getStatusBadge(workflow.status)}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSelectedWorkflow(workflow.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Se detaljer
                </DropdownMenuItem>
                {workflow.status === 'PENDING' && !isExpired && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleApprove(workflow.id)}
                      className="text-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Godkjenn
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleReject(workflow.id, 'Avvist av administrator')}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Avvis
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <CardDescription className="text-xs">
            Mal: {workflow.printJob.template.name}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Estimert kostnad</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3" />
                <span>{workflow.printJob.costEstimate.toFixed(2)} kr</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Godkjennere</Label>
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                <span>{workflow.totalSteps} trinn</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fremdrift</Label>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(workflow.currentStep / workflow.totalSteps) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <span className="text-xs">
                Steg {workflow.currentStep} av {workflow.totalSteps}
              </span>
            </div>
          </div>
          
          {currentApproval && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <div className="font-medium text-blue-700">
                Venter på: {currentApproval.approver.name}
              </div>
              <div className="text-blue-600">
                {currentApproval.approver.email}
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Opprettet {formatDistanceToNow(new Date(workflow.createdAt), { addSuffix: true, locale: nb })}
          </div>
          
          {workflow.expiresAt && (
            <div className="text-xs text-muted-foreground">
              {isExpired ? 'Utløp' : 'Utløper'}: {formatDistanceToNow(new Date(workflow.expiresAt), { addSuffix: true, locale: nb })}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const ApprovalRulesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Godkjenningsregler</h3>
          <p className="text-muted-foreground">
            Konfigurer automatiske godkjenningsregler for print jobs
          </p>
        </div>
        <Button onClick={() => setShowCreateRule(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ny regel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {approvalRules?.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{rule.name}</CardTitle>
                <Switch checked={rule.isActive} />
              </div>
              <CardDescription className="text-xs">
                {rule.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs">
                <Label className="text-muted-foreground">Betingelse:</Label>
                <div>
                  {rule.conditionType} - {rule.conditionValue}
                </div>
              </div>
              <div className="text-xs">
                <Label className="text-muted-foreground">Godkjennere:</Label>
                <div>
                  {JSON.parse(rule.requiredApprovers as string).join(', ')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Rule Dialog */}
      <Dialog open={showCreateRule} onOpenChange={setShowCreateRule}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Opprett godkjenningsregel</DialogTitle>
            <DialogDescription>
              Definer betingelser for automatisk godkjenning
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Navn</Label>
                <Input
                  id="rule-name"
                  placeholder="F.eks. Høy kostnad godkjenning"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-priority">Prioritet</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg prioritet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Høy (1)</SelectItem>
                    <SelectItem value="2">Medium (2)</SelectItem>
                    <SelectItem value="3">Lav (3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rule-description">Beskrivelse</Label>
              <Textarea
                id="rule-description"
                placeholder="Beskriv når denne regelen skal aktiveres"
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Betingelser</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Betingelsestype</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COST_THRESHOLD">Kostnadsterskil</SelectItem>
                      <SelectItem value="TEMPLATE_TYPE">Mal-type</SelectItem>
                      <SelectItem value="QUANTITY_THRESHOLD">Antall-terskil</SelectItem>
                      <SelectItem value="USER_ROLE">Brukerrolle</SelectItem>
                      <SelectItem value="TIME_RESTRICTION">Tidsbegrensning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Verdi</Label>
                  <Input placeholder="F.eks. 100 for kostnad over 100 kr" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Godkjennere</h4>
              
              <div className="space-y-2">
                <Label>Påkrevde godkjennere</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg godkjennere" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Leder</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="finance">Økonomi</SelectItem>
                    <SelectItem value="it">IT-ansvarlig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timeout (timer)</Label>
                  <Input type="number" placeholder="24" min="1" max="168" />
                </div>
                <div className="space-y-2">
                  <Label>Eskalering</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg eskalering" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen</SelectItem>
                      <SelectItem value="auto_approve">Auto-godkjenn</SelectItem>
                      <SelectItem value="escalate_manager">Eskaler til leder</SelectItem>
                      <SelectItem value="auto_reject">Auto-avvis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateRule(false)}>
                Avbryt
              </Button>
              <Button onClick={() => {/* TODO: Implement create rule */}}>
                Opprett regel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Godkjennings-workflows</h1>
          <p className="text-muted-foreground">
            Håndter godkjenninger for utskriftsjobber
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Ventende ({filteredWorkflows.filter(w => ['PENDING', 'IN_PROGRESS'].includes(w.status)).length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Fullførte ({filteredWorkflows.filter(w => ['APPROVED', 'REJECTED'].includes(w.status)).length})
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Regler
          </TabsTrigger>
        </TabsList>

        {selectedTab !== 'rules' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Søk</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Søk i jobs..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8"
                    />
                  </div>
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
                  <Label>Forespurt av</Label>
                  <Select 
                    value={filters.requester} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, requester: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle brukere</SelectItem>
                      {/* TODO: Add actual users */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="pending" className="space-y-4">
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
          ) : filteredWorkflows.filter(w => ['PENDING', 'IN_PROGRESS'].includes(w.status)).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ingen ventende godkjenninger</h3>
                <p className="text-muted-foreground">
                  Alle aktuelle utskriftsjobber er godkjent eller trenger ikke godkjenning.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkflows
                .filter(w => ['PENDING', 'IN_PROGRESS'].includes(w.status))
                .map(workflow => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filteredWorkflows.filter(w => ['APPROVED', 'REJECTED'].includes(w.status)).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ingen fullførte godkjenninger</h3>
                <p className="text-muted-foreground">
                  Godkjente og avviste workflows vil vises her.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkflows
                .filter(w => ['APPROVED', 'REJECTED'].includes(w.status))
                .map(workflow => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rules">
          <ApprovalRulesTab />
        </TabsContent>
      </Tabs>

      {/* Workflow details dialog */}
      {selectedWorkflow && (
        <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Godkjennings-detaljer</DialogTitle>
              <DialogDescription>
                Detaljert informasjon om godkjennings-workflow
              </DialogDescription>
            </DialogHeader>
            {(() => {
              const workflow = workflows?.find(w => w.id === selectedWorkflow)
              if (!workflow) return null
              
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Job-tittel</Label>
                      <p className="text-sm text-muted-foreground">{workflow.printJob.jobTitle}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">{getStatusBadge(workflow.status)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Estimert kostnad</Label>
                      <p className="text-sm text-muted-foreground">{workflow.printJob.costEstimate.toFixed(2)} kr</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Fremdrift</Label>
                      <p className="text-sm text-muted-foreground">
                        Steg {workflow.currentStep} av {workflow.totalSteps}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Godkjennings-historikk</Label>
                    <div className="mt-2 space-y-2">
                      {workflow.approvals.map((approval, index) => (
                        <div key={approval.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center
                              ${approval.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                approval.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'}
                            `}>
                              {approval.status === 'APPROVED' ? <CheckCircle className="h-4 w-4" /> :
                               approval.status === 'REJECTED' ? <XCircle className="h-4 w-4" /> :
                               <Clock className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{approval.approver.name}</div>
                              <div className="text-xs text-muted-foreground">{approval.approver.email}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">{getStatusBadge(approval.status)}</div>
                            {approval.approvedAt && (
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(approval.approvedAt), { addSuffix: true, locale: nb })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {workflow.status === 'PENDING' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        onClick={() => handleApprove(workflow.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Godkjenn
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleReject(workflow.id, 'Avvist av administrator')}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Avvis
                      </Button>
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