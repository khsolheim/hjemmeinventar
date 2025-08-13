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
import { trpc } from '@/lib/trpc/client'
import { QRCode } from '@/components/ui/qr-code'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { data: session, status } = useSession()
  const [isQueueOpen, setIsQueueOpen] = useState(false)
  const [queued, setQueued] = useState<any[]>([])
  const [queueCount, setQueueCount] = useState(0)
  const commonOpts = { retry: 0, refetchOnWindowFocus: false, refetchOnMount: false, staleTime: 5 * 60 * 1000 } as const
  const profiles = trpc.users.getLabelProfiles.useQuery(undefined, { ...commonOpts, enabled: status === 'authenticated' && isQueueOpen })
  const userProfile = trpc.users.getProfile.useQuery(undefined, { ...commonOpts, enabled: status === 'authenticated' && isQueueOpen })
  const [selectedProfileId, setSelectedProfileId] = useState('')

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

  useEffect(() => {
    if (!isQueueOpen) return
    if (!selectedProfileId && userProfile.data?.defaultLabelProfileId) {
      setSelectedProfileId(userProfile.data.defaultLabelProfileId)
    }
  }, [isQueueOpen, userProfile.data, selectedProfileId])

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

  if (status !== 'authenticated') {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 gap-4">
          <div className="flex-1" />
        </div>
      </header>
    )
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
                  <option value="standard">Standard (30252)</option>
                  <option value="large">Stor (30323)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Kopier</label>
                <input id="pq-copies" type="number" min="1" max="10" defaultValue={1} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
            </div>
             <div>
              <label className="text-xs text-muted-foreground">Etikettmal</label>
               <select id="pq-profile" className="w-full border rounded px-2 py-1 text-sm" value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)} disabled={profiles.isLoading}>
                <option value="">(Bruk profil-logo/standard)</option>
                {(profiles.data || []).map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {queued.length > 0 && (
              <div className="border rounded p-2">
                <div className="text-xs font-medium mb-1">Forhåndsvisning</div>
                {(() => {
                  const q = queued[0]
                  const profile = (profiles.data || []).find((p: any) => p.id === selectedProfileId)
                  const logo = profile?.logoUrl || userProfile.data?.logoUrl || ''
                  const extra1 = profile?.extraLine1 || ''
                  const extra2 = profile?.extraLine2 || ''
                  const showUrl = profile?.showUrl ?? true
                  const url = typeof window !== 'undefined' ? `${window.location.origin}/scan?d=${q.qrCode}` : ''
                  return (
                    <div className="flex items-start gap-3">
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
                      ) : null}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{q.itemName}</div>
                        <div className="text-xs text-muted-foreground truncate">{q.locationName}</div>
                        {extra1 ? <div className="text-xs text-muted-foreground truncate">{extra1}</div> : null}
                        {extra2 ? <div className="text-xs text-muted-foreground truncate">{extra2}</div> : null}
                        <div className="mt-2 flex items-center gap-3">
                          <div className="w-24">
                            <QRCode value={url} title={q.itemName} description={q.locationName} />
                          </div>
                          <div className="text-[11px]">
                            <div className="font-mono">{q.qrCode}</div>
                            {showUrl ? <div className="text-muted-foreground break-all">{url}</div> : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { printQueue.clear(); refreshQueue() }} disabled={queued.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" /> Tøm kø
            </Button>
            <Button variant="outline" onClick={() => {
              if (queued.length === 0) return
              const profile = (profiles.data || []).find((p: any) => p.id === selectedProfileId)
              const logo = profile?.logoUrl || userProfile.data?.logoUrl || ''
              const extra1 = profile?.extraLine1 || ''
              const extra2 = profile?.extraLine2 || ''
              const showUrl = profile?.showUrl ?? true
              const html = `<!DOCTYPE html><html><head><title>Etiketter</title><style>body{margin:0;padding:12px;font-family:Arial} .wrap{display:flex;flex-wrap:wrap;gap:8px} .box{border:1px solid #000; padding:8px; width:280px; margin:4px} .title{font-weight:bold; font-size:14px; margin:6px 0} .small{font-size:12px; color:#444} .code{font-family:monospace; font-size:12px}</style></head><body><div class='wrap'>${queued.map(q=>{ const url = `${window.location.origin}/scan?d=${q.qrCode}`; const qr = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`; return `<div class='box'>${logo?`<img src='${logo}' style='max-width:260px;max-height:40px'/>`:''}<div class='title'>${q.itemName}</div><div class='small'>${q.locationName}</div>${extra1?`<div class='small'>${extra1}</div>`:''}${extra2?`<div class='small'>${extra2}</div>`:''}<img src='${qr}' style='width:160px;height:160px'/><div class='code'>${q.qrCode}</div>${showUrl?`<div class='small'>${url}</div>`:''}</div>`}).join('')}</div></body></html>`
              const win = window.open('', '_blank')
              if (win) {
                win.document.write(html)
                win.document.close()
                setTimeout(()=>{ win.print(); win.close() }, 250)
              }
            }} disabled={queued.length === 0}>
              Skriv ut i nettleser
            </Button>
            <Button onClick={async () => {
              if (queued.length === 0) return
              try {
                const copies = Number((document.getElementById('pq-copies') as HTMLInputElement)?.value || '1')
                const size = ((document.getElementById('pq-size') as HTMLSelectElement)?.value || 'standard') as 'small'|'standard'|'large'
                const profileSelect = document.getElementById('pq-profile') as HTMLSelectElement | null
                const profileId = profileSelect ? profileSelect.value : ''
                const profile = (profiles.data || []).find((p: any) => p.id === profileId)
                const labels = queued.map(q => ({
                  ...q,
                  extraLine1: profile?.extraLine1,
                  extraLine2: profile?.extraLine2
                }))
                await dymoService.printBulkLabels(labels, 'qr', { copies, labelSize: size })
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
