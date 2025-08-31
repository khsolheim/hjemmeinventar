'use client'
  
 import { useState, useEffect } from 'react'
 import type { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QRCodeCard } from '@/components/ui/qr-code'
import { 
  Save, 
  Loader2, 
  QrCode, 
  Info, 
  Settings,
  BarChart3,
  MapPin,
  Home,
  Package,
  Archive,
  Folder,
  FileText,
  Printer,
  Layers,
  ShoppingBag,
  Square
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { 
  getLocationPath, 
  enhanceLocationsWithPaths, 
  sortLocationsByPath,
  locationTypeLabels
} from '@/lib/utils/location-helpers'

const locationTypeIcons = {
  ROOM: Home,
  SHELF: Package,
  BOX: Archive,
  CONTAINER: Package,
  DRAWER: Folder,
  CABINET: FileText,
  SHELF_COMPARTMENT: Layers,
  BAG: ShoppingBag,
  SECTION: Square
}



// Fallback hierarchy rules (used if API fails)
const FALLBACK_HIERARCHY_RULES: Record<string, string[]> = {
  ROOM: ['SHELF', 'CABINET', 'CONTAINER', 'RACK', 'WALL_SHELF', 'BOX', 'DRAWER', 'BAG'],
  SHELF: ['SHELF_COMPARTMENT', 'BOX', 'DRAWER', 'BAG', 'CONTAINER'],
  RACK: ['SHELF_COMPARTMENT', 'BOX', 'DRAWER', 'BAG', 'CONTAINER'],
  WALL_SHELF: ['SHELF_COMPARTMENT', 'BOX', 'BAG', 'CONTAINER'],
  SHELF_COMPARTMENT: ['BOX', 'BAG', 'CONTAINER', 'SECTION'],
  BOX: ['BAG', 'SECTION', 'CONTAINER'],
  BAG: ['SECTION'],
  CABINET: ['DRAWER', 'SHELF_COMPARTMENT', 'CONTAINER', 'BOX', 'BAG', 'SHELF'],
  DRAWER: ['SECTION', 'BAG', 'CONTAINER', 'BOX'],
  CONTAINER: ['BAG', 'SECTION', 'BOX'],
  SECTION: ['BAG']
}

function canBeChildOf(
  childType: string, 
  parentType: string, 
  hierarchyMatrix?: Record<string, Record<string, boolean>>
): boolean {
  if (hierarchyMatrix) {
    return hierarchyMatrix[parentType]?.[childType] ?? false
  }
  // Fallback to hardcoded rules if no matrix available
  return FALLBACK_HIERARCHY_RULES[parentType]?.includes(childType) || false
}

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  location?: any
  allLocations: any[]
  isLoading?: boolean
  mode: 'create' | 'edit'
  initialData?: any
}

export function LocationModal({ 
  isOpen, 
  onClose, 
  onSave, 
  location, 
  allLocations, 
  isLoading = false,
  mode,
  initialData
}: LocationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'ROOM' as const,
    description: '',
    parentId: 'none'
  })
  const [activeTab, setActiveTab] = useState('basic')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Determine user's active household (use first as default)
  const { data: myHouseholds } = trpc.households.getMyHouseholds.useQuery(undefined, { staleTime: 5 * 60 * 1000 })
  const householdId = myHouseholds?.[0]?.id
  
  // Fetch hierarchy rules for validation
  const { data: hierarchyData } = trpc.hierarchy.getMatrix.useQuery(
    { householdId: householdId as string },
    { 
      enabled: isOpen && !!householdId, // Only fetch when modal is open and household is known
      retry: 1, // Don't retry too much
      staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    }
  )

  // Reset form when location changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && location) {
        setFormData({
          name: location.name || '',
          type: location.type || 'ROOM',
          description: location.description || '',
          parentId: location.parentId || 'none'
        })
      } else {
        setFormData({
          name: '',
          type: 'ROOM',
          description: '',
          parentId: initialData?.parentId || 'none'
        })
      }
      setErrors({})
      setActiveTab('basic')
    }
  }, [isOpen, location, mode, initialData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Navn er påkrevd'
    }
    
    if (formData.parentId && formData.parentId !== 'none') {
      const parent = allLocations.find(loc => loc.id === formData.parentId)
      if (parent && !canBeChildOf(formData.type, parent.type, hierarchyData?.matrix)) {
        const parentLabel = locationTypeLabels[parent.type as keyof typeof locationTypeLabels] || parent.type
        const childLabel = locationTypeLabels[formData.type as keyof typeof locationTypeLabels] || formData.type
        newErrors.parentId = `${childLabel} kan ikke plasseres i ${parentLabel.toLowerCase()}. Gå til Innstillinger → Hierarki-regler for å endre dette.`
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    // Prevent duplicate submissions
    if (isLoading) {
      return
    }
    
    if (!validateForm()) {
      setActiveTab('basic') // Switch to basic tab if there are errors
      return
    }
    
    const saveData = {
      name: formData.name,
      type: formData.type,
      description: formData.description || undefined,
      parentId: formData.parentId === 'none' ? undefined : formData.parentId
    }
    
    if (mode === 'edit' && location) {
      onSave({ id: location.id, ...saveData })
    } else {
      onSave(saveData)
    }
  }

  const validParentLocations = sortLocationsByPath(
    enhanceLocationsWithPaths(
      allLocations.filter(loc => {
        if (mode === 'edit' && location && loc.id === location.id) {
          return false // Can't be parent of itself
        }
        return canBeChildOf(formData.type, loc.type, hierarchyData?.matrix)
      })
    )
  )

  const LocationIcon = ({ type }: { type: string }) => {
    const Icon = locationTypeIcons[type as keyof typeof locationTypeIcons] || MapPin
    return <Icon className="w-4 h-4" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="responsive-dialog max-w-2xl max-h-[90vh] overflow-y-auto cq">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'edit' ? (
              <>
                <LocationIcon type={location?.type || 'ROOM'} />
                Rediger {location?.name}
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                Opprett ny lokasjon
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Oppdater informasjon om lokasjonen' 
              : 'Legg til et nytt rom eller oppbevaringssted'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Grunnleggende
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              QR-kode
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistikk
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-6">
            <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location-name">
                  Navn på lokasjon
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="location-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="F.eks. Kjøkken, Soverom, Plastboks A"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="location-type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: any) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(locationTypeLabels).map(([type, label]) => (
                      <SelectItem key={type} value={type} className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <LocationIcon type={type} />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="location-description">Beskrivelse (valgfritt)</Label>
              <Textarea
                id="location-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Tilleggsinformasjon om lokasjonen"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="parent-location">Overordnet lokasjon (valgfritt)</Label>
              <Select 
                value={formData.parentId} 
                onValueChange={(value) => setFormData({...formData, parentId: value})}
              >
                <SelectTrigger className={errors.parentId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Velg overordnet lokasjon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ingen (rot-nivå)</SelectItem>
                  {validParentLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      <div className="flex items-start gap-2 py-1">
                        <LocationIcon type={loc.type} />
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
              {errors.parentId && (
                <p className="text-sm text-red-500 mt-1">{errors.parentId}</p>
              )}
            </div>

            {/* Hierarchy preview */}
            {formData.parentId && formData.parentId !== 'none' && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Forhåndsvisning av hierarki:</h4>
                <div className="flex items-center gap-1 text-sm flex-wrap">
                  {(() => {
                    const parent = allLocations.find(loc => loc.id === formData.parentId)
                    if (!parent) return null
                    
                    const fullPath = getLocationPath(parent.id, allLocations)
                    const elements: JSX.Element[] = []
                    
                    // Show full path to parent
                    fullPath.forEach((pathName, index) => {
                      const pathLocation = allLocations.find(loc => loc.name === pathName)
                      if (pathLocation) {
                        elements.push(
                          <div key={`path-${index}`} className="flex items-center gap-1">
                            <LocationIcon type={pathLocation.type} />
                            <span>{pathName}</span>
                          </div>
                        )
                        if (index < fullPath.length - 1 || formData.name) {
                          elements.push(
                            <span key={`arrow-${index}`} className="text-muted-foreground mx-1">→</span>
                          )
                        }
                      }
                    })
                    
                    // Add new location
                    if (formData.name) {
                      elements.push(
                        <div key="new-location" className="flex items-center gap-1">
                          <LocationIcon type={formData.type} />
                          <span className="font-medium">{formData.name}</span>
                        </div>
                      )
                    }
                    
                    return elements
                  })()}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Den nye lokasjonen vil plasseres i: {getLocationPath(formData.parentId!, allLocations).join(' → ')}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="qr" className="space-y-4 mt-6">
            <div className="text-center">
              {mode === 'edit' && location?.qrCode ? (
                <div className="space-y-4">
                  <QRCodeCard 
                    value={location.qrCode} 
                    title={`Lokasjon: ${location.name}`}
                    description="Skann denne koden for å finne lokasjonen"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <QrCode className="w-3 h-3" />
                      {location.qrCode}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>QR-kode vil bli generert automatisk når lokasjonen opprettes</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 mt-6">
            {mode === 'edit' && location ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-2xl font-bold">{location._count?.items || 0}</div>
                    <div className="text-sm text-muted-foreground">Gjenstander</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-2xl font-bold">{location.children?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Underlokasjoner</div>
                  </div>
                </div>
                
                {location.children && location.children.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Underlokasjoner:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {location.children.map((child: any) => (
                        <div key={child.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <LocationIcon type={child.type} />
                            <span className="text-sm">{child.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {child._count?.items || 0} ting
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Opprettet:</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(location.createdAt).toLocaleDateString('no-NO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Statistikk vil være tilgjengelig etter at lokasjonen er opprettet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="dialog-actions flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Avbryt
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'edit' ? 'Lagrer...' : 'Oppretter...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'edit' ? 'Lagre endringer' : 'Opprett lokasjon'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
