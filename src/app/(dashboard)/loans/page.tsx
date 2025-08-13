'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog'
import { 
  AlertTriangle, 
  Calendar, 
  Phone, 
  User, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  UserPlus,
  MessageSquare,
  Mail,
  Loader2
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { format, differenceInDays, isPast } from 'date-fns'
import { nb } from 'date-fns/locale'
import { toast } from 'sonner'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LoanDialogProps {
  itemId?: string
  isOpen: boolean
  onClose: () => void
}

function CreateLoanDialog({ itemId, isOpen, onClose }: LoanDialogProps) {
  const [loanedTo, setLoanedTo] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedItemId, setSelectedItemId] = useState(itemId || '')

  const { data: availableItemsData } = trpc.items.getAll.useQuery({
    // Only get items that are not currently loaned out
    filter: 'available'
  })
  
  const availableItems = availableItemsData?.items || []

  const createLoan = trpc.loans.create.useMutation({
    onSuccess: () => {
      toast.success('Utlån registrert')
      onClose()
      // Reset form
      setLoanedTo('')
      setContactInfo('')
      setExpectedReturnDate('')
      setNotes('')
      setSelectedItemId('')
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const handleSubmit = () => {
    if (!selectedItemId || !loanedTo.trim()) return

    createLoan.mutate({
      itemId: selectedItemId,
      loanedTo: loanedTo.trim(),
      contactInfo: contactInfo.trim() || undefined,
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : undefined,
      notes: notes.trim() || undefined
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrer nytt utlån</DialogTitle>
          <DialogDescription>
            Registrer at du låner bort en gjenstand til noen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="item">Gjenstand *</Label>
            {itemId ? (
              <Input 
                value={availableItems?.find(i => i.id === itemId)?.name || 'Laster...'}
                disabled 
              />
            ) : (
              <select 
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Velg gjenstand...</option>
                {availableItems?.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.location.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <Label htmlFor="loanedTo">Lånt til *</Label>
            <Input
              id="loanedTo"
              value={loanedTo}
              onChange={(e) => setLoanedTo(e.target.value)}
              placeholder="Navnet på personen som låner"
              required
            />
          </div>

          <div>
            <Label htmlFor="contactInfo">Kontaktinfo</Label>
            <Input
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Telefon eller e-post"
            />
          </div>

          <div>
            <Label htmlFor="expectedReturnDate">Forventet retur</Label>
            <Input
              id="expectedReturnDate"
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notater</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Eventuelle notater om utlånet..."
              rows={3}
              className="w-full px-3 py-2 border rounded-md resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedItemId || !loanedTo.trim() || createLoan.isPending}
          >
            {createLoan.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrerer...
              </>
            ) : (
              'Registrer utlån'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function LoansPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'out' | 'overdue' | 'returned'>('all')

  const { data: loans = [], isLoading, refetch } = trpc.loans.getUserLoans.useQuery()
  const { data: stats } = trpc.loans.getStats.useQuery()

  const returnLoan = trpc.loans.return.useMutation({
    onSuccess: () => {
      toast.success('Gjenstand markert som returnert')
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const deleteLoan = trpc.loans.delete.useMutation({
    onSuccess: () => {
      toast.success('Utlån slettet')
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  // Filter and search loans
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         loan.loanedTo.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || loan.status.toLowerCase() === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const handleReturnLoan = (loanId: string) => {
    returnLoan.mutate({ loanId: loanId })
  }

  const handleDeleteLoan = (loanId: string) => {
    if (confirm('Er du sikker på at du vil slette dette utlånet?')) {
      deleteLoan.mutate(loanId)
    }
  }

  const sendReminder = (loan: any) => {
    if (loan.contactInfo) {
      // In a real app, this would send an email/SMS
      toast.success(`Påminnelse sendt til ${loan.loanedTo}`)
    } else {
      toast.error('Ingen kontaktinfo registrert for dette utlånet')
    }
  }

  if (isLoading) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="page container mx-auto px-4 py-8 cq">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 cq">
        <div>
          <h1 className="text-3xl font-bold title">Utlån</h1>
          <p className="text-muted-foreground secondary-text">
            Administrer utlånte gjenstander og hold oversikt over returner
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nytt utlån
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="cq-grid dashboard-grid gap-6 mb-8" style={{"--card-min":"220px"} as any}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive utlån</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forsinkede</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Returnerte</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.returned}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totalt</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6 cq">
        <Input
          placeholder="Søk etter gjenstand eller person..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">Alle status</option>
          <option value="out">Utlånt</option>
          <option value="overdue">Forsinket</option>
          <option value="returned">Returnert</option>
        </select>
      </div>

      {/* Loans List */}
      <div className="grid gap-4 cq">
        {filteredLoans.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600">
                  {searchQuery ? 'Ingen utlån funnet' : 'Ingen utlån ennå'}
                </p>
                <p className="text-gray-500 mb-4">
                  {searchQuery ? 'Prøv et annet søk' : 'Start med å registrere ditt første utlån'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Registrer utlån
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredLoans.map((loan) => {
            const isOverdue = loan.expectedReturnDate && 
              isPast(new Date(loan.expectedReturnDate)) && 
              loan.status === 'OUT'
            
            const daysUntilReturn = loan.expectedReturnDate 
              ? differenceInDays(new Date(loan.expectedReturnDate), new Date())
              : null

            return (
              <Card key={loan.id} className={isOverdue ? 'border-red-200 bg-red-50' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{loan.item.name}</h3>
                        <Badge 
                          variant={
                            loan.status === 'RETURNED' ? 'default' :
                            loan.status === 'OVERDUE' ? 'destructive' : 'secondary'
                          }
                        >
                          {loan.status === 'OUT' ? 'Utlånt' :
                           loan.status === 'RETURNED' ? 'Returnert' : 'Forsinket'}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Forsinket
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Lånt til: {loan.loanedTo}</span>
                          </div>
                          {loan.contactInfo && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{loan.contactInfo}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Lånt: {format(new Date(loan.loanDate), 'dd.MM.yyyy', { locale: nb })}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {loan.expectedReturnDate && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                Forventet retur: {format(new Date(loan.expectedReturnDate), 'dd.MM.yyyy', { locale: nb })}
                                {daysUntilReturn !== null && (
                                  <span className={`ml-2 ${daysUntilReturn < 0 ? 'text-red-600' : daysUntilReturn <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                                    ({daysUntilReturn < 0 ? 'Forsinket med' : ''} {Math.abs(daysUntilReturn)} dag{Math.abs(daysUntilReturn) !== 1 ? 'er' : ''}{daysUntilReturn >= 0 ? ' igjen' : ''})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {loan.actualReturnDate && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Returnert: {format(new Date(loan.actualReturnDate), 'dd.MM.yyyy', { locale: nb })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {loan.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{loan.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {loan.status === 'OUT' && (
                        <>
                          {loan.contactInfo && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendReminder(loan)}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleReturnLoan(loan.id)}
                            disabled={returnLoan.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Marker som returnert
                          </Button>
                        </>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDeleteLoan(loan.id)}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Slett utlån
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create Loan Dialog */}
      <CreateLoanDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  )
}
