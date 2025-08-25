"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useActivePages } from '@/hooks/useActivePages'
import { 
  Home, 
  Package, 
  MapPin, 
  QrCode,
  Settings,
  Plus,
  Grid3x3,
  BarChart3,
  UserCheck,
  FileText,
  Shield,
  Users,
  Activity,
  Smartphone,
  Brain,
  Database,
  Palette,
  Printer,
  Search,
  Sparkles,
  Trophy,
  ExternalLink,
  AlertTriangle,
  Leaf,
  Wifi,
  Cpu,
  Link as LinkIcon,
  Zap,
  Mic,
  Camera,
  Bell,
  Save,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'

interface PageConfig {
  id: string
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  description: string
  isActive: boolean
  isCore?: boolean // Core pages that should always be available
}

export default function ActivePagesSettings() {
  const [pages, setPages] = useState<PageConfig[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const { activePagesConfig, isLoading, saveConfiguration, resetToDefaults } = useActivePages()

  // Define all available pages
  const allPages: PageConfig[] = [
    // Core pages (always available)
    { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: Home, category: 'Kjerne', description: 'Hovedoversikt over systemet', isActive: true, isCore: true },
    { id: 'items', name: 'Gjenstander', href: '/items', icon: Package, category: 'Kjerne', description: 'Administrer gjenstander og inventar', isActive: true, isCore: true },
    { id: 'locations', name: 'Lokasjoner', href: '/locations', icon: MapPin, category: 'Kjerne', description: 'Organiser lokasjoner og rom', isActive: true, isCore: true },
    { id: 'settings', name: 'Innstillinger', href: '/settings', icon: Settings, category: 'Kjerne', description: 'Systeminnstillinger og konfigurasjon', isActive: true, isCore: true },
    
    // Features
    { id: 'quick-add', name: 'Quick Add', href: '/quick-add', icon: Plus, category: 'Funksjoner', description: 'Raskt legg til gjenstander', isActive: true },
    { id: 'search', name: 'Smart Search', href: '/search', icon: Search, category: 'Funksjoner', description: 'Avansert søkefunksjonalitet', isActive: true },
    { id: 'scan', name: 'Skann QR', href: '/scan', icon: QrCode, category: 'Funksjoner', description: 'Skann QR-koder for gjenstander', isActive: true },
    { id: 'loans', name: 'Utlån', href: '/loans', icon: UserCheck, category: 'Funksjoner', description: 'Administrer utlån av gjenstander', isActive: true },
    
    // Specialized features
    { id: 'garn', name: 'Garn', href: '/garn', icon: Palette, category: 'Spesialfunksjoner', description: 'Garnadministrasjon og mønstre', isActive: true },
    { id: 'patterns', name: 'Mønstre', href: '/patterns', icon: FileText, category: 'Spesialfunksjoner', description: 'Mønsterbibliotek og oppskrifter', isActive: true },
    { id: 'printing', name: 'Printing', href: '/printing', icon: Printer, category: 'Spesialfunksjoner', description: 'Utskrift og etiketter', isActive: true },
    
    // Analytics & Insights
    { id: 'analytics', name: 'Analytics', href: '/analytics', icon: BarChart3, category: 'Analyse', description: 'Grunleggende analyser og rapporter', isActive: true },
    { id: 'advanced-analytics', name: 'Advanced Analytics', href: '/advanced-analytics', icon: BarChart3, category: 'Analyse', description: 'Avanserte analyser og dashboards', isActive: false },
    { id: 'reporting', name: 'Reporting', href: '/reporting', icon: BarChart3, category: 'Analyse', description: 'Rapportgenerering og eksport', isActive: false },
    
    // AI & Automation
    { id: 'ai', name: 'AI Assistant', href: '/ai', icon: Brain, category: 'AI & Automatisering', description: 'Kunstig intelligens assistent', isActive: false },
    { id: 'automation', name: 'Automation', href: '/automation', icon: Zap, category: 'AI & Automatisering', description: 'Automatiserte arbeidsflyter', isActive: false },
    { id: 'ml', name: 'Machine Learning', href: '/ml', icon: Cpu, category: 'AI & Automatisering', description: 'Maskinlæring og prediktiv analyse', isActive: false },
    
    // Collaboration & Social
    { id: 'collaboration', name: 'Collaboration', href: '/collaboration', icon: Users, category: 'Samarbeid', description: 'Samarbeidsfunksjoner og deling', isActive: false },
    { id: 'households', name: 'Husholdninger', href: '/households', icon: Users, category: 'Samarbeid', description: 'Administrer husholdninger og medlemmer', isActive: false },
    { id: 'social', name: 'Social', href: '/social', icon: Activity, category: 'Samarbeid', description: 'Sosiale funksjoner og fellesskap', isActive: false },
    
    // Advanced Features
    { id: 'smart-inventory', name: 'Smart Inventory', href: '/smart-inventory', icon: Package, category: 'Avanserte funksjoner', description: 'Intelligent inventarstyring', isActive: false },
    { id: 'gamification', name: 'Gamification', href: '/gamification', icon: Trophy, category: 'Avanserte funksjoner', description: 'Spillifiserte elementer og belønninger', isActive: false },
    { id: 'personalization', name: 'Personalization', href: '/personalization', icon: Settings, category: 'Avanserte funksjoner', description: 'Personlig tilpasning av brukergrensesnitt', isActive: false },
    
    // Integrations & External
    { id: 'integrations', name: 'Integrations', href: '/integrations', icon: ExternalLink, category: 'Integrasjoner', description: 'Tredjepartsintegrasjoner', isActive: false },
    { id: 'iot', name: 'IoT Devices', href: '/iot', icon: Wifi, category: 'Integrasjoner', description: 'IoT-enheter og smart hjem', isActive: false },
    { id: 'blockchain', name: 'Blockchain', href: '/blockchain', icon: LinkIcon, category: 'Integrasjoner', description: 'Blockchain-integrasjon og sikkerhet', isActive: false },
    
    // Specialized Tools
    { id: 'camera', name: 'Camera', href: '/camera', icon: Camera, category: 'Verktøy', description: 'Kamera og bildebehandling', isActive: false },
    { id: 'voice', name: 'Voice', href: '/voice', icon: Mic, category: 'Verktøy', description: 'Stemmeassistent og talegjenkjenning', isActive: false },
    { id: 'mobile', name: 'Mobile', href: '/mobile', icon: Smartphone, category: 'Verktøy', description: 'Mobiloptimaliserte funksjoner', isActive: false },
    
    // Management & Admin
    { id: 'admin', name: 'Admin', href: '/admin', icon: Settings, category: 'Administrasjon', description: 'Administrative verktøy og innstillinger', isActive: false },
    { id: 'security', name: 'Security', href: '/security', icon: Shield, category: 'Administrasjon', description: 'Sikkerhetsinnstillinger og overvåking', isActive: false },
    { id: 'notifications', name: 'Notifications', href: '/notifications', icon: Bell, category: 'Administrasjon', description: 'Varslingsinnstillinger og historikk', isActive: false },
    
    // Specialized Features
    { id: 'emergency', name: 'Emergency', href: '/emergency', icon: AlertTriangle, category: 'Spesialfunksjoner', description: 'Nødhjelp og krisestyring', isActive: false },
    { id: 'sustainability', name: 'Sustainability', href: '/sustainability', icon: Leaf, category: 'Spesialfunksjoner', description: 'Bærekraft og miljøovervåking', isActive: false },
    { id: 'test-features', name: 'Test Features', href: '/test-features', icon: Sparkles, category: 'Utvikling', description: 'Testfunksjoner og eksperimentelle features', isActive: false },
    
    // Import/Export
    { id: 'import-export', name: 'Import/Export', href: '/import-export', icon: Database, category: 'Data', description: 'Import og eksport av data', isActive: false },
    { id: 'categories', name: 'Kategorier', href: '/categories', icon: Grid3x3, category: 'Organisering', description: 'Kategoristyring og klassifisering', isActive: false },
    { id: 'location', name: 'Location', href: '/location', icon: MapPin, category: 'Organisering', description: 'Avansert lokasjonsstyring', isActive: false }
  ]

  // Load saved configuration on mount
  useEffect(() => {
    const updatedPages = allPages.map(page => ({
      ...page,
      isActive: activePagesConfig[page.id] !== undefined ? activePagesConfig[page.id] : page.isActive
    }))
    setPages(updatedPages)
  }, [activePagesConfig])

  // Save configuration to localStorage
  const handleSaveConfiguration = () => {
    try {
      const config = pages.reduce((acc, page) => {
        acc[page.id] = page.isActive
        return acc
      }, {} as Record<string, boolean>)
      
      saveConfiguration(config)
      setHasChanges(false)
      toast.success('Konfigurasjon lagret')
      
      // Force a page refresh to update the sidebar
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Error saving active pages configuration:', error)
      toast.error('Feil ved lagring av konfigurasjon')
    }
  }

  // Reset to defaults
  const handleResetToDefaults = () => {
    const defaultConfig = allPages.reduce((acc, page) => {
      acc[page.id] = page.isActive
      return acc
    }, {} as Record<string, boolean>)
    
    resetToDefaults(defaultConfig)
    setPages(allPages)
    setHasChanges(true)
    toast.info('Tilbakestilt til standardinnstillinger')
  }

  // Toggle page active state
  const togglePage = (pageId: string) => {
    setPages(prev => prev.map(page => 
      page.id === pageId ? { ...page, isActive: !page.isActive } : page
    ))
    setHasChanges(true)
  }

  // Group pages by category
  const groupedPages = pages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = []
    }
    acc[page.category].push(page)
    return acc
  }, {} as Record<string, PageConfig[]>)

  if (isLoading) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Laster innstillinger...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Aktive Sider</h1>
        <p className="text-muted-foreground">
          Kontroller hvilke sider som vises i sidemenyen
        </p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Button 
          onClick={handleSaveConfiguration} 
          disabled={!hasChanges}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Lagre endringer
        </Button>
        <Button 
          variant="outline" 
          onClick={handleResetToDefaults}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Tilbakestill til standard
        </Button>
        {hasChanges && (
          <Badge variant="secondary" className="ml-auto">
            Ulagrede endringer
          </Badge>
        )}
      </div>

      {/* Page Configuration */}
      <div className="space-y-6">
        {Object.entries(groupedPages).map(([category, categoryPages]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category}
                <Badge variant="outline" className="ml-auto">
                  {categoryPages.filter(p => p.isActive).length} / {categoryPages.length} aktive
                </Badge>
              </CardTitle>
              <CardDescription>
                {category === 'Kjerne' && 'Disse sidene er alltid tilgjengelige og kan ikke deaktiveres'}
                {category !== 'Kjerne' && 'Aktiver eller deaktiver sider i denne kategorien'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryPages.map((page) => {
                  const Icon = page.icon
                  return (
                    <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {page.name}
                            {page.isCore && (
                              <Badge variant="secondary" className="text-xs">Kjerne</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {page.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {page.href}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={page.isActive}
                          onCheckedChange={() => togglePage(page.id)}
                          disabled={page.isCore}
                        />
                        <Label className="text-sm">
                          {page.isActive ? 'Aktiv' : 'Inaktiv'}
                        </Label>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Informasjon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              • <strong>Kjerne-sider</strong> er alltid aktive og kan ikke deaktiveres
            </p>
            <p>
              • Endringer påvirker kun hva som vises i sidemenyen
            </p>
            <p>
              • Du kan fortsatt aksessere deaktiverte sider direkte via URL
            </p>
            <p>
              • Konfigurasjonen lagres lokalt i nettleseren
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
