'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  User,
  Settings,
  LogOut,
  Plus,
  Shield,
  Printer,
  Trash2,
  X
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { MeilisearchBox } from '@/components/search/MeilisearchBox'
import { printQueue, PRINT_QUEUE_EVENT } from '@/lib/printing/print-queue'
import { dymoService } from '@/lib/printing/dymo-service'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession()
  const [isQueueOpen, setIsQueueOpen] = useState(false)
  const [queued, setQueued] = useState<any[]>([])
  const [queueCount, setQueueCount] = useState(0)

  const refreshQueue = () => {
    const q = printQueue.getAll()
    setQueued(q)
    setQueueCount(q.length)
  }

  useEffect(() => {
    refreshQueue()
    const onChange = () => refreshQueue()
    if (typeof window !== 'undefined') {
      window.addEventListener(PRINT_QUEUE_EVENT, onChange as any)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(PRINT_QUEUE_EVENT, onChange as any)
      }
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: '/auth/signin',
        redirect: true
      })
    } catch (error) {
      console.error('Feil ved utlogging:', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="md:hidden"
          aria-label="Åpne sidemeny"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Mobile Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2 md:hidden">
          <span className="text-2xl">🏠</span>
          <span className="font-bold">Hjemmeinventar</span>
        </Link>

        {/* Flexible spacer */}
        <div className="flex-1" />

        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block w-64">
            <MeilisearchBox 
              placeholder="Søk i inventar..."
              className="w-full"
            />
          </div>

          {/* Print Queue */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => { refreshQueue(); setIsQueueOpen(true) }}
            aria-label="Åpne utskriftskø"
          >
            <Printer className="h-4 w-4 mr-2" />
            Utskriftskø ({queueCount})
          </Button>

          {/* Quick Add Button */}
          <Button size="sm" className="hidden sm:flex" asChild>
            <Link href="/items/enhanced" aria-label="Legg til ny gjenstand">
              <Plus className="h-4 w-4 mr-2" />
              Legg til
            </Link>
          </Button>

          {/* Notifications */}
          <NotificationCenter />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full"
                aria-label="Brukermeny"
              >
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name || 'Bruker'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email || 'Ikke innlogget'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Innstillinger</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin" className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logg ut</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Print Queue Dialog */}
      <Dialog open={isQueueOpen} onOpenChange={(o) => { setIsQueueOpen(o); if (!o) refreshQueue() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Utskriftskø</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {queued.length === 0 ? (
              <div className="text-sm text-muted-foreground">Køen er tom.</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {queued.map((q, idx) => (
                  <div key={`${q.qrCode}-${idx}`} className="flex items-center justify-between p-2 border rounded">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{q.itemName}</div>
                      <div className="text-xs text-muted-foreground truncate">{q.locationName}</div>
                      <div className="font-mono text-xs truncate">{q.qrCode}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { printQueue.removeByQr(q.qrCode); refreshQueue() }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Etikettstørrelse</label>
                <select id="pq-size" className="w-full border rounded px-2 py-1 text-sm">
                  <option value="small">Liten (30334)</option>
                  <option value="standard" selected>Standard (30252)</option>
                  <option value="large">Stor (30323)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Kopier</label>
                <input id="pq-copies" type="number" min="1" max="10" defaultValue={1} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { printQueue.clear(); refreshQueue() }} disabled={queued.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" /> Tøm kø
            </Button>
            <Button onClick={async () => {
              if (queued.length === 0) return
              try {
                const copies = Number((document.getElementById('pq-copies') as HTMLInputElement)?.value || '1')
                const size = ((document.getElementById('pq-size') as HTMLSelectElement)?.value || 'standard') as 'small'|'standard'|'large'
                await dymoService.printBulkLabels(queued, 'qr', { copies, labelSize: size })
                toast.success(`Skrev ut ${queued.length} etiketter`)
                printQueue.clear(); refreshQueue(); setIsQueueOpen(false)
              } catch (e) {
                console.error(e)
                toast.error('Kunne ikke skrive ut kø')
              }
            }} disabled={queued.length === 0}>
              <Printer className="h-4 w-4 mr-2" /> Skriv ut på DYMO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
