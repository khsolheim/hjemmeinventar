'use client'

import { useState, useEffect } from 'react'
import { LocationType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Save,
  Sparkles,
  Lock,
  Unlock,
  Palette,
  Tag,
  Home,
  Package,
  Archive,
  Folder,
  ShoppingBag,
  FileText,
  BookOpen,
  Square
} from 'lucide-react'
import { WizardLocation } from './LocationWizardProvider'

interface LocationFormProps {
  type: LocationType
  parent?: WizardLocation
  editingLocation?: WizardLocation
  suggestedName?: string
  suggestedAutoNumber?: string
  onSave: (locationData: LocationFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export interface LocationFormData {
  name: string
  displayName?: string
  description?: string
  type: LocationType
  parentId?: string
  autoNumber?: string
  isPrivate: boolean
  colorCode?: string
  tags: string[]
}

const locationTypeIcons = {
  [LocationType.ROOM]: Home,
  [LocationType.CABINET]: Package,
  [LocationType.RACK]: BookOpen,
  [LocationType.WALL_SHELF]: Square,
  [LocationType.SHELF]: Folder,
  [LocationType.DRAWER]: FileText,
  [LocationType.BOX]: Archive,
  [LocationType.BAG]: ShoppingBag,
  [LocationType.CONTAINER]: Package,
  [LocationType.SHELF_COMPARTMENT]: Folder,
  [LocationType.SECTION]: Square
}

const locationTypeLabels = {
  [LocationType.ROOM]: 'Rom',
  [LocationType.CABINET]: 'Skap',
  [LocationType.RACK]: 'Reol',
  [LocationType.WALL_SHELF]: 'Vegghengt hylle',
  [LocationType.SHELF]: 'Hylle',
  [LocationType.DRAWER]: 'Skuff',
  [LocationType.BOX]: 'Boks',
  [LocationType.BAG]: 'Pose',
  [LocationType.CONTAINER]: 'Beholder',
  [LocationType.SHELF_COMPARTMENT]: 'Hylle',
  [LocationType.SECTION]: 'Avsnitt'
}

const predefinedColors = [
  '#3B82F6', // Blue
  '#10B981', // Green  
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#1F2937'  // Dark Gray
]

const commonTags = [
  'Vinterklaer', 'Sommerklaer', 'Elektronikk', 'Dokumenter', 
  'Leker', 'Kjøkkenredskap', 'Bøker', 'Håndverk', 'Sport', 'Verktøy'
]

export function LocationForm({ 
  type, 
  parent, 
  editingLocation,
  suggestedName,
  suggestedAutoNumber,
  onSave, 
  onCancel,
  isLoading = false
}: LocationFormProps) {
  
  const [formData, setFormData] = useState<LocationFormData>({
    name: editingLocation?.name || suggestedName || '',
    displayName: editingLocation?.displayName || '',
    description: '',
    type,
    parentId: parent?.id,
    autoNumber: editingLocation?.autoNumber || suggestedAutoNumber || '',
    isPrivate: editingLocation?.isPrivate || false,
    colorCode: editingLocation?.colorCode || '',
    tags: editingLocation?.tags || []
  })

  const [customName, setCustomName] = useState(false)
  const [newTag, setNewTag] = useState('')

  const Icon = locationTypeIcons[type]
  const typeLabel = locationTypeLabels[type]

  // Oppdater navn når forslag endres
  useEffect(() => {
    if (suggestedName && !customName && !editingLocation) {
      setFormData(prev => ({ ...prev, name: suggestedName }))
    }
  }, [suggestedName, customName, editingLocation])

  // Oppdater autoNumber når forslag endres
  useEffect(() => {
    if (suggestedAutoNumber && !editingLocation) {
      setFormData(prev => ({ ...prev, autoNumber: suggestedAutoNumber }))
    }
  }, [suggestedAutoNumber, editingLocation])

  const handleSave = () => {
    if (!formData.name.trim()) return
    onSave(formData)
  }

  const handleNameChange = (value: string) => {
    setCustomName(true)
    setFormData(prev => ({ ...prev, name: value }))
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Icon className="h-8 w-8 text-blue-600" />
              {editingLocation ? 'Rediger' : 'Opprett'} {typeLabel}
            </h1>
            {parent && (
              <p className="text-lg text-gray-600">
                I: <span className="font-medium">{parent.name}</span>
              </p>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-6 w-6 text-blue-600" />
              {typeLabel} detaljer
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            
            {/* Auto-generated info */}
            {suggestedName && !customName && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Automatisk generert navn
                  </span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Dette navnet ble generert automatisk basert på eksisterende struktur.
                  Du kan endre det hvis du ønsker.
                </p>
              </div>
            )}

            {/* Name Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Navn *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={`Skriv inn navn for ${typeLabel.toLowerCase()}`}
                  className="mt-1"
                />
                {formData.autoNumber && (
                  <p className="text-xs text-gray-500 mt-1">
                    Automatisk nummer: <span className="font-mono">{formData.autoNumber}</span>
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="displayName">Visningsnavn (valgfritt)</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Egendefinert navn som vises i stedet"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hvis satt, vil dette navnet vises i stedet for det automatiske navnet
                </p>
              </div>

              <div>
                <Label htmlFor="description">Beskrivelse (valgfritt)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beskriv hva som oppbevares her"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {formData.isPrivate ? (
                    <Lock className="h-5 w-5 text-red-600" />
                  ) : (
                    <Unlock className="h-5 w-5 text-green-600" />
                  )}
                  <div>
                    <Label htmlFor="privacy">Privat lokasjon</Label>
                    <p className="text-sm text-gray-500">
                      Kun du kan se og redigere denne lokasjonen
                    </p>
                  </div>
                </div>
                <Switch
                  id="privacy"
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isPrivate: checked }))
                  }
                />
              </div>
            </div>

            {/* Color Coding */}
            <div>
              <Label>Fargekoding (valgfritt)</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData(prev => ({ ...prev, colorCode: color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.colorCode === color 
                        ? 'border-gray-900 scale-110' 
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <input
                  type="color"
                  value={formData.colorCode || '#3B82F6'}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                  title="Velg egen farge"
                />
              </div>
              {formData.colorCode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, colorCode: '' }))}
                  className="mt-2 text-xs"
                >
                  Fjern farge
                </Button>
              )}
            </div>

            {/* Tags */}
            <div>
              <Label>Etiketter</Label>
              <div className="mt-2 space-y-3">
                
                {/* Current Tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
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
                )}

                {/* Add New Tag */}
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Legg til etikett"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(newTag)
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => addTag(newTag)}
                    disabled={!newTag.trim()}
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>

                {/* Common Tags */}
                <div className="flex flex-wrap gap-2">
                  {commonTags
                    .filter(tag => !formData.tags.includes(tag))
                    .slice(0, 6)
                    .map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        onClick={() => addTag(tag)}
                        className="text-xs"
                      >
                        + {tag}
                      </Button>
                    ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Forhåndsvisning:</h4>
              <div className="flex items-center space-x-3">
                <Icon className={`h-6 w-6 ${formData.colorCode ? 'text-current' : 'text-gray-600'}`}
                      style={formData.colorCode ? { color: formData.colorCode } : {}} />
                <div>
                  <div className="font-medium text-gray-900">
                    {formData.displayName || formData.name}
                  </div>
                  {formData.autoNumber && (
                    <div className="text-sm text-gray-500">
                      Automatisk nummer: {formData.autoNumber}
                    </div>
                  )}
                  {parent && (
                    <div className="text-sm text-gray-500">
                      I: {parent.name}
                    </div>
                  )}
                </div>
                {formData.isPrivate && (
                  <Badge variant="destructive" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Privat
                  </Badge>
                )}
              </div>
              {formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Avbryt
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.name.trim() || isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingLocation ? 'Lagre endringer' : 'Opprett lokasjon'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}