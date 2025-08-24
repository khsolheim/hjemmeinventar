'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Wand2, 
  Palette, 
  Tag, 
  Eye, 
  EyeOff,
  Save,
  RotateCcw,
  Info,
  Sparkles,
  Home,
  Package,
  Archive,
  Folder,
  ShoppingBag,
  FileText,
  BookOpen,
  Square
} from 'lucide-react'
import { LocationType } from '@prisma/client'
import { toast } from 'sonner'

interface WizardSettingsData {
  autoNamingEnabled: boolean
  showWelcomeTutorial: boolean
  defaultColorScheme: 'none' | 'by-type' | 'by-level' | 'custom'
  customColors: Record<LocationType, string>
  defaultPrivacy: 'public' | 'private'
  autoGenerateQR: boolean
  defaultTags: string[]
  namingPrefix: string
  maxHierarchyDepth: number
}

const locationTypeOptions = [
  { type: LocationType.ROOM, label: 'Rom', icon: Home, defaultColor: '#3B82F6' },
  { type: LocationType.CABINET, label: 'Skap', icon: Package, defaultColor: '#10B981' },
  { type: LocationType.RACK, label: 'Reol', icon: BookOpen, defaultColor: '#8B5CF6' },
  { type: LocationType.WALL_SHELF, label: 'Vegghengt hylle', icon: Square, defaultColor: '#F59E0B' },
  { type: LocationType.SHELF, label: 'Hylle', icon: Folder, defaultColor: '#EF4444' },
  { type: LocationType.DRAWER, label: 'Skuff', icon: FileText, defaultColor: '#06B6D4' },
  { type: LocationType.BOX, label: 'Boks', icon: Archive, defaultColor: '#F97316' },
  { type: LocationType.BAG, label: 'Pose', icon: ShoppingBag, defaultColor: '#EC4899' }
]

const predefinedTags = [
  'Vinterklaer', 'Sommerklaer', 'Elektronikk', 'Dokumenter', 
  'Leker', 'Kjøkkenredskap', 'Bøker', 'Håndverk', 'Sport', 'Verktøy',
  'Medisiner', 'Rengjøring', 'Dekorasjoner', 'Julepynt', 'Garn'
]

export function WizardSettings() {
  const [settings, setSettings] = useState<WizardSettingsData>({
    autoNamingEnabled: true,
    showWelcomeTutorial: true,
    defaultColorScheme: 'by-type',
    customColors: {} as Record<LocationType, string>,
    defaultPrivacy: 'public',
    autoGenerateQR: true,
    defaultTags: [],
    namingPrefix: '',
    maxHierarchyDepth: 5
  })
  
  const [hasChanges, setHasChanges] = useState(false)
  const [newTag, setNewTag] = useState('')

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('wizard-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Error loading wizard settings:', error)
      }
    }

    // Initialize default colors
    const defaultColors: Record<LocationType, string> = {} as Record<LocationType, string>
    locationTypeOptions.forEach(option => {
      defaultColors[option.type] = option.defaultColor
    })
    setSettings(prev => ({ 
      ...prev, 
      customColors: { ...defaultColors, ...prev.customColors }
    }))
  }, [])

  const updateSetting = <K extends keyof WizardSettingsData>(
    key: K, 
    value: WizardSettingsData[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const updateCustomColor = (type: LocationType, color: string) => {
    setSettings(prev => ({
      ...prev,
      customColors: { ...prev.customColors, [type]: color }
    }))
    setHasChanges(true)
  }

  const addTag = () => {
    if (!newTag.trim() || settings.defaultTags.includes(newTag.trim())) return
    
    updateSetting('defaultTags', [...settings.defaultTags, newTag.trim()])
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    updateSetting('defaultTags', settings.defaultTags.filter(tag => tag !== tagToRemove))
  }

  const saveSettings = () => {
    try {
      localStorage.setItem('wizard-settings', JSON.stringify(settings))
      setHasChanges(false)
      toast.success('Wizard innstillinger lagret')
    } catch (error) {
      console.error('Error saving wizard settings:', error)
      toast.error('Kunne ikke lagre innstillinger')
    }
  }

  const resetToDefaults = () => {
    const defaultSettings: WizardSettingsData = {
      autoNamingEnabled: true,
      showWelcomeTutorial: true,
      defaultColorScheme: 'by-type',
      customColors: {} as Record<LocationType, string>,
      defaultPrivacy: 'public',
      autoGenerateQR: true,
      defaultTags: [],
      namingPrefix: '',
      maxHierarchyDepth: 5
    }
    
    setSettings(defaultSettings)
    setHasChanges(true)
    toast.info('Innstillinger tilbakestilt til standard')
  }

  const resetTutorial = () => {
    localStorage.removeItem('location-wizard-skip-tutorial')
    updateSetting('showWelcomeTutorial', true)
    toast.success('Tutorial tilbakestilt - vil vises neste gang du starter wizard')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-blue-600" />
            Wizard innstillinger
          </h2>
          <p className="text-gray-600">
            Konfigurer hvordan lokasjonswizard oppfører seg
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Tilbakestill
            </Button>
            <Button onClick={saveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Lagre endringer
            </Button>
          </div>
        )}
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generelle innstillinger
          </CardTitle>
          <CardDescription>
            Grunnleggende wizard oppførsel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Auto Naming */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Automatisk navngiving</Label>
              <p className="text-sm text-gray-500">
                Generer automatiske navn som A1, B2, etc.
              </p>
            </div>
            <Switch
              checked={settings.autoNamingEnabled}
              onCheckedChange={(checked) => updateSetting('autoNamingEnabled', checked)}
            />
          </div>

          {/* Welcome Tutorial */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Vis velkomst tutorial</Label>
              <p className="text-sm text-gray-500">
                Vis forklaring første gang wizard åpnes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.showWelcomeTutorial}
                onCheckedChange={(checked) => updateSetting('showWelcomeTutorial', checked)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={resetTutorial}
              >
                Tilbakestill
              </Button>
            </div>
          </div>

          {/* Auto Generate QR */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Automatisk QR-kode generering</Label>
              <p className="text-sm text-gray-500">
                Generer QR-koder automatisk for nye lokasjoner
              </p>
            </div>
            <Switch
              checked={settings.autoGenerateQR}
              onCheckedChange={(checked) => updateSetting('autoGenerateQR', checked)}
            />
          </div>

          {/* Default Privacy */}
          <div className="space-y-2">
            <Label>Standard privacy nivå</Label>
            <Select 
              value={settings.defaultPrivacy} 
              onValueChange={(value: any) => updateSetting('defaultPrivacy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Offentlig - synlig for alle i husholdning
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    Privat - kun synlig for deg
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Hierarchy Depth */}
          <div className="space-y-2">
            <Label>Maksimal hierarki dybde</Label>
            <Input
              type="number"
              min={3}
              max={10}
              value={settings.maxHierarchyDepth}
              onChange={(e) => updateSetting('maxHierarchyDepth', parseInt(e.target.value) || 5)}
            />
            <p className="text-xs text-gray-500">
              Hvor mange nivåer dypt hierarkiet kan være (3-10)
            </p>
          </div>

          {/* Naming Prefix */}
          <div className="space-y-2">
            <Label>Navngiving prefiks (valgfritt)</Label>
            <Input
              placeholder="f.eks. SKP-, HYL-"
              value={settings.namingPrefix}
              onChange={(e) => updateSetting('namingPrefix', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Prefiks som legges til automatisk genererte navn
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Color Coding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Fargekoding
          </CardTitle>
          <CardDescription>
            Konfigurer standard farger for forskjellige lokasjon typer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Color Scheme */}
          <div className="space-y-2">
            <Label>Fargeskjema</Label>
            <Select 
              value={settings.defaultColorScheme} 
              onValueChange={(value: any) => updateSetting('defaultColorScheme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ingen automatisk fargekoding</SelectItem>
                <SelectItem value="by-type">Farge basert på lokasjon type</SelectItem>
                <SelectItem value="by-level">Farge basert på hierarki level</SelectItem>
                <SelectItem value="custom">Egendefinerte farger</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Colors */}
          {settings.defaultColorScheme === 'custom' && (
            <div className="space-y-4">
              <Label>Egendefinerte farger per type</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {locationTypeOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <div key={option.type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{option.label}</span>
                      </div>
                      <input
                        type="color"
                        value={settings.customColors[option.type] || option.defaultColor}
                        onChange={(e) => updateCustomColor(option.type, e.target.value)}
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Color Preview */}
          {settings.defaultColorScheme !== 'none' && (
            <div className="p-4 bg-gray-50 border rounded-lg">
              <Label className="mb-2 block">Forhåndsvisning:</Label>
              <div className="flex flex-wrap gap-2">
                {locationTypeOptions.map((option) => {
                  const Icon = option.icon
                  const color = settings.defaultColorScheme === 'custom' 
                    ? settings.customColors[option.type] || option.defaultColor
                    : option.defaultColor
                  
                  return (
                    <div key={option.type} className="flex items-center gap-1 px-2 py-1 bg-white border rounded">
                      <Icon className="h-4 w-4" style={{ color }} />
                      <span className="text-sm">{option.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Default Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Standard etiketter
          </CardTitle>
          <CardDescription>
            Etiketter som foreslås når nye lokasjoner opprettes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Current Tags */}
          {settings.defaultTags.length > 0 && (
            <div>
              <Label className="mb-2 block">Aktive standard etiketter:</Label>
              <div className="flex flex-wrap gap-2">
                {settings.defaultTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add New Tag */}
          <div className="flex gap-2">
            <Input
              placeholder="Legg til ny standard etikett"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              className="flex-1"
            />
            <Button onClick={addTag} disabled={!newTag.trim()}>
              <Tag className="h-4 w-4 mr-2" />
              Legg til
            </Button>
          </div>

          {/* Predefined Tags */}
          <div>
            <Label className="mb-2 block">Forhåndsdefinerte etiketter:</Label>
            <div className="flex flex-wrap gap-2">
              {predefinedTags
                .filter(tag => !settings.defaultTags.includes(tag))
                .map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => updateSetting('defaultTags', [...settings.defaultTags, tag])}
                    className="text-xs"
                  >
                    + {tag}
                  </Button>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Avanserte innstillinger</CardTitle>
          <CardDescription>
            Ekspert-nivå konfigurasjon for wizard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Merk:</p>
                <p>Disse innstillingene påvirker kun nye lokasjoner opprettet via wizard. 
                   Eksisterende lokasjoner endres ikke.</p>
              </div>
            </div>
          </div>

          {/* Export/Import Settings */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const dataStr = JSON.stringify(settings, null, 2)
                const dataBlob = new Blob([dataStr], { type: 'application/json' })
                const url = URL.createObjectURL(dataBlob)
                const link = document.createElement('a')
                link.href = url
                link.download = 'wizard-settings.json'
                link.click()
                URL.revokeObjectURL(url)
                toast.success('Innstillinger eksportert')
              }}
            >
              Eksporter innstillinger
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.json'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      try {
                        const imported = JSON.parse(e.target?.result as string)
                        setSettings(prev => ({ ...prev, ...imported }))
                        setHasChanges(true)
                        toast.success('Innstillinger importert')
                      } catch (error) {
                        toast.error('Ugyldig innstillinger fil')
                      }
                    }
                    reader.readAsText(file)
                  }
                }
                input.click()
              }}
            >
              Importer innstillinger
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Du har ulagrede endringer</p>
                <p className="text-sm text-blue-700">Klikk "Lagre endringer" for å beholde innstillingene</p>
              </div>
              <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Lagre endringer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}