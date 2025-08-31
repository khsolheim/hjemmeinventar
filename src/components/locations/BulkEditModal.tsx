'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Save, 
  Loader2, 
  Info, 
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { 
  enhanceLocationsWithPaths, 
  sortLocationsByPath,
  locationTypeLabels
} from '@/lib/utils/location-helpers'

interface BulkEditField {
  enabled: boolean
  value: any
}

interface BulkEditData {
  description: BulkEditField
  type: BulkEditField
  parentId: BulkEditField
}

interface BulkEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  locations: any[]
  allLocations: any[]
  isLoading?: boolean
}

export function BulkEditModal({ 
  isOpen, 
  onClose, 
  onSave, 
  locations, 
  allLocations, 
  isLoading = false 
}: BulkEditModalProps) {
  const [bulkData, setBulkData] = useState<BulkEditData>({
    description: { enabled: false, value: '' },
    type: { enabled: false, value: '' },
    parentId: { enabled: false, value: '' }
  })
  const [previewMode, setPreviewMode] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setBulkData({
        description: { enabled: false, value: '' },
        type: { enabled: false, value: '' },
        parentId: { enabled: false, value: '' }
      })
      setPreviewMode(false)
      setProgress(0)
      setCurrentStep('')
      setValidationErrors([])
    }
  }, [isOpen])

  const handleFieldToggle = (field: keyof BulkEditData, enabled: boolean) => {
    setBulkData(prev => ({
      ...prev,
      [field]: { ...prev[field], enabled }
    }))
  }

  const handleFieldChange = (field: keyof BulkEditData, value: any) => {
    setBulkData(prev => ({
      ...prev,
      [field]: { ...prev[field], value }
    }))
  }

  const validateChanges = () => {
    const errors: string[] = []
    
    // Check if at least one field is enabled
    const hasEnabledFields = Object.values(bulkData).some(field => field.enabled)
    if (!hasEnabledFields) {
      errors.push('Du må velge minst ett felt å endre')
    }
    
    // Validate type changes
    if (bulkData.type.enabled && bulkData.parentId.enabled) {
      const newType = bulkData.type.value
      const newParentId = bulkData.parentId.value
      
      if (newParentId && newParentId !== 'none') {
        const parent = allLocations.find(loc => loc.id === newParentId)
        if (parent) {
          // Check hierarchy rules (simplified validation)
          const canBeChild = true // TODO: Implement hierarchy validation
          if (!canBeChild) {
            errors.push(`Typen ${newType} kan ikke plasseres under ${parent.type}`)
          }
        }
      }
    }
    
    // Check for circular references if changing parent
    if (bulkData.parentId.enabled && bulkData.parentId.value && bulkData.parentId.value !== 'none') {
      const selectedIds = locations.map(loc => loc.id)
      if (selectedIds.includes(bulkData.parentId.value)) {
        errors.push('Kan ikke sette en valgt lokasjon som forelder til seg selv')
      }
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const generatePreview = () => {
    return locations.map(location => {
      const changes: any = {}
      
      if (bulkData.description.enabled) {
        changes.description = bulkData.description.value
      }
      if (bulkData.type.enabled) {
        changes.type = bulkData.type.value
      }
      if (bulkData.parentId.enabled) {
        changes.parentId = bulkData.parentId.value === 'none' ? null : bulkData.parentId.value
      }
      
      return {
        ...location,
        ...changes,
        _isChanged: Object.keys(changes).length > 0
      }
    })
  }

  const handleSave = async () => {
    if (!validateChanges()) {
      return
    }
    
    const enabledFields = Object.entries(bulkData)
      .filter(([_, field]) => field.enabled)
      .reduce((acc, [key, field]) => ({
        ...acc,
        [key]: key === 'parentId' && field.value === 'none' ? null : field.value
      }), {})
    
    // Simulate progress for bulk operation
    setCurrentStep('Validerer endringer...')
    setProgress(20)
    
    setTimeout(() => {
      setCurrentStep('Oppdaterer lokasjoner...')
      setProgress(60)
      
      setTimeout(() => {
        setCurrentStep('Ferdigstiller...')
        setProgress(100)
        
        setTimeout(() => {
          onSave({
            fields: enabledFields,
            locationIds: locations.map(loc => loc.id)
          })
        }, 500)
      }, 1000)
    }, 500)
  }

  const previewLocations = previewMode ? generatePreview() : locations
  const changedCount = previewMode ? previewLocations.filter(loc => loc._isChanged).length : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Bulk-rediger lokasjoner
          </DialogTitle>
          <DialogDescription>
            Gjør endringer på {locations.length} valgte lokasjoner samtidig
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">{currentStep}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {!isLoading && (
          <Tabs defaultValue="edit" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Rediger
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                {previewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Forhåndsvisning
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Sammendrag
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-6 mt-6">
              {/* Validation errors */}
              {validationErrors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-red-700">Valideringsfeil</span>
                  </div>
                  <ul className="text-sm text-red-600 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description field */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enable-description"
                    checked={bulkData.description.enabled}
                    onCheckedChange={(checked) => handleFieldToggle('description', !!checked)}
                  />
                  <Label htmlFor="enable-description" className="text-base font-medium">
                    Oppdater beskrivelse
                  </Label>
                </div>
                
                {bulkData.description.enabled && (
                  <Textarea
                    value={bulkData.description.value}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Ny beskrivelse for alle valgte lokasjoner"
                    className="min-h-[80px]"
                  />
                )}
              </div>

              {/* Type field */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enable-type"
                    checked={bulkData.type.enabled}
                    onCheckedChange={(checked) => handleFieldToggle('type', !!checked)}
                  />
                  <Label htmlFor="enable-type" className="text-base font-medium">
                    Endre type
                  </Label>
                </div>
                
                {bulkData.type.enabled && (
                  <Select 
                    value={bulkData.type.value} 
                    onValueChange={(value) => handleFieldChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Velg ny type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(locationTypeLabels).map(([type, label]) => (
                        <SelectItem key={type} value={type}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Parent location field */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enable-parent"
                    checked={bulkData.parentId.enabled}
                    onCheckedChange={(checked) => handleFieldToggle('parentId', !!checked)}
                  />
                  <Label htmlFor="enable-parent" className="text-base font-medium">
                    Flytt til ny overordnet lokasjon
                  </Label>
                </div>
                
                {bulkData.parentId.enabled && (
                  <Select 
                    value={bulkData.parentId.value} 
                    onValueChange={(value) => handleFieldChange('parentId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Velg overordnet lokasjon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen (rot-nivå)</SelectItem>
                      {sortLocationsByPath(
                        enhanceLocationsWithPaths(
                          allLocations.filter(loc => !locations.some(selected => selected.id === loc.id))
                        )
                      ).map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          <div className="flex items-start gap-2 py-1">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{loc.displayName}</div>
                              <div className="text-xs text-muted-foreground">
                                {locationTypeLabels[loc.type as keyof typeof locationTypeLabels]}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Preview toggle */}
              <div className="flex items-center space-x-2 pt-4 border-t">
                <Checkbox
                  id="preview-mode"
                  checked={previewMode}
                  onCheckedChange={(checked) => setPreviewMode(!!checked)}
                />
                <Label htmlFor="preview-mode">
                  Vis forhåndsvisning av endringer
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Forhåndsvisning av endringer</h3>
                <Badge variant={changedCount > 0 ? "default" : "secondary"}>
                  {changedCount} av {locations.length} vil bli endret
                </Badge>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {previewLocations.map((location) => (
                  <div 
                    key={location.id} 
                    className={`p-3 rounded border ${
                      location._isChanged ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{location.name}</span>
                        {location._isChanged && (
                          <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />
                        )}
                      </div>
                      <Badge variant="outline">
                        {locationTypeLabels[location.type as keyof typeof locationTypeLabels]}
                      </Badge>
                    </div>
                    
                    {location.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {location.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold">{locations.length}</div>
                  <div className="text-sm text-muted-foreground">Valgte lokasjoner</div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {Object.values(bulkData).filter(field => field.enabled).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Felt som endres</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Endringer som vil gjøres:</h4>
                {Object.entries(bulkData)
                  .filter(([_, field]) => field.enabled)
                  .map(([key, field]) => (
                    <div key={key} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium capitalize">{key}:</span>
                      <span className="text-muted-foreground">
                        {field.value || '(tom)'}
                      </span>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Avbryt
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || validationErrors.length > 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Oppdaterer...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lagre endringer ({locations.length})
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
