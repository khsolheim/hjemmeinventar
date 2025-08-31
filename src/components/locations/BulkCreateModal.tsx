'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Trash2, 
  MapPin,
  Home,
  Package,
  Archive,
  Folder,
  FileText,
  Layers,
  ShoppingBag,
  Square
} from 'lucide-react'
import { LocationType } from '@prisma/client'

const locationTypeIcons = {
  ROOM: Home,
  CABINET: Package,
  RACK: Package,
  WALL_SHELF: Square,
  SHELF: Folder,
  DRAWER: FileText,
  BOX: Archive,
  BAG: ShoppingBag,
  CONTAINER: Package,
  SHELF_COMPARTMENT: Layers,
  SECTION: Square
}

const locationTypeLabels = {
  ROOM: 'Rom',
  CABINET: 'Skap',
  RACK: 'Reol',
  WALL_SHELF: 'Vegghengt hylle',
  SHELF: 'Hylle',
  DRAWER: 'Skuff',
  BOX: 'Boks',
  BAG: 'Pose',
  CONTAINER: 'Beholder',
  SHELF_COMPARTMENT: 'Hylle',
  SECTION: 'Avsnitt'
}

interface BulkLocationData {
  id: string
  name: string
  type: LocationType
  description?: string
  parentId?: string
}

interface BulkCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (locations: Omit<BulkLocationData, 'id'>[]) => void
  allLocations: any[]
  isLoading?: boolean
}

export function BulkCreateModal({ 
  isOpen, 
  onClose, 
  onSave, 
  allLocations, 
  isLoading = false 
}: BulkCreateModalProps) {
  const [locations, setLocations] = useState<BulkLocationData[]>([
    { id: '1', name: '', type: 'ROOM' as LocationType }
  ])
  const [bulkText, setBulkText] = useState('')
  const [commonParentId, setCommonParentId] = useState<string>('none')
  const [commonType, setCommonType] = useState<LocationType>('ROOM')
  const [mode, setMode] = useState<'individual' | 'bulk'>('individual')

  const addLocation = () => {
    const newId = (locations.length + 1).toString()
    setLocations(prev => [...prev, { 
      id: newId, 
      name: '', 
      type: commonType,
      parentId: commonParentId === 'none' ? undefined : commonParentId
    }])
  }

  const removeLocation = (id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id))
  }

  const updateLocation = (id: string, field: keyof BulkLocationData, value: any) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, [field]: value } : loc
    ))
  }

  const handleBulkTextChange = (text: string) => {
    setBulkText(text)
    
    // Parse bulk text into locations
    const lines = text.split('\n').filter(line => line.trim())
    const newLocations: BulkLocationData[] = lines.map((line, index) => ({
      id: (index + 1).toString(),
      name: line.trim(),
      type: commonType,
      parentId: commonParentId === 'none' ? undefined : commonParentId
    }))
    
    if (newLocations.length > 0) {
      setLocations(newLocations)
    }
  }

  const handleSave = () => {
    const validLocations = locations.filter(loc => loc.name.trim())
    if (validLocations.length === 0) return

    const locationsToSave = validLocations.map(({ id, ...loc }) => loc)
    onSave(locationsToSave)
  }

  const handleClose = () => {
    setLocations([{ id: '1', name: '', type: 'ROOM' as LocationType }])
    setBulkText('')
    setCommonParentId('none')
    setCommonType('ROOM')
    setMode('individual')
    onClose()
  }

  const LocationIcon = ({ type }: { type: string }) => {
    const Icon = locationTypeIcons[type as keyof typeof locationTypeIcons] || MapPin
    return <Icon className="w-4 h-4" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Legg til flere lokasjoner</DialogTitle>
          <DialogDescription>
            Opprett flere lokasjoner samtidig. Du kan legge dem til individuelt eller bruke bulk-modus.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode selector */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'individual' ? 'default' : 'outline'}
              onClick={() => setMode('individual')}
              size="sm"
            >
              Individuell
            </Button>
            <Button
              variant={mode === 'bulk' ? 'default' : 'outline'}
              onClick={() => setMode('bulk')}
              size="sm"
            >
              Bulk-tekst
            </Button>
          </div>

          {/* Common settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="commonType">Felles type</Label>
              <Select value={commonType} onValueChange={(value) => {
                setCommonType(value as LocationType)
                // Update all locations with new type
                setLocations(prev => prev.map(loc => ({ ...loc, type: value as LocationType })))
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(locationTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <LocationIcon type={value} />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="commonParent">Felles overordnet lokasjon</Label>
              <Select value={commonParentId} onValueChange={(value) => {
                setCommonParentId(value)
                // Update all locations with new parent
                const parentId = value === 'none' ? undefined : value
                setLocations(prev => prev.map(loc => ({ ...loc, parentId })))
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ingen overordnet</SelectItem>
                  {allLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex items-center gap-2">
                        <LocationIcon type={location.type} />
                        {location.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {mode === 'bulk' ? (
            /* Bulk text mode */
            <div>
              <Label htmlFor="bulkText">Skriv inn lokasjonsnavn (ett per linje)</Label>
              <Textarea
                id="bulkText"
                placeholder="Stue&#10;Kjøkken&#10;Soverom&#10;Bad"
                value={bulkText}
                onChange={(e) => handleBulkTextChange(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Skriv ett lokasjonsnavn per linje. Alle vil få samme type og overordnet lokasjon.
              </p>
            </div>
          ) : (
            /* Individual mode */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Lokasjoner ({locations.length})</Label>
                <Button onClick={addLocation} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Legg til
                </Button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {locations.map((location, index) => (
                  <Card key={location.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-5">
                          <Label htmlFor={`name-${location.id}`}>Navn</Label>
                          <Input
                            id={`name-${location.id}`}
                            value={location.name}
                            onChange={(e) => updateLocation(location.id, 'name', e.target.value)}
                            placeholder="Lokasjonsnavn"
                          />
                        </div>

                        <div className="col-span-3">
                          <Label htmlFor={`type-${location.id}`}>Type</Label>
                          <Select 
                            value={location.type} 
                            onValueChange={(value) => updateLocation(location.id, 'type', value as LocationType)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(locationTypeLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  <div className="flex items-center gap-2">
                                    <LocationIcon type={value} />
                                    {label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-3">
                          <Label htmlFor={`parent-${location.id}`}>Overordnet</Label>
                          <Select 
                            value={location.parentId || 'none'} 
                            onValueChange={(value) => updateLocation(location.id, 'parentId', value === 'none' ? undefined : value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Ingen</SelectItem>
                              {allLocations.map((loc) => (
                                <SelectItem key={loc.id} value={loc.id}>
                                  <div className="flex items-center gap-2">
                                    <LocationIcon type={loc.type} />
                                    {loc.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-1">
                          {locations.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLocation(location.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        <Label htmlFor={`description-${location.id}`}>Beskrivelse (valgfri)</Label>
                        <Input
                          id={`description-${location.id}`}
                          value={location.description || ''}
                          onChange={(e) => updateLocation(location.id, 'description', e.target.value)}
                          placeholder="Beskrivelse av lokasjonen"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {locations.some(loc => loc.name.trim()) && (
            <div>
              <Label>Forhåndsvisning ({locations.filter(loc => loc.name.trim()).length} lokasjoner)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {locations
                  .filter(loc => loc.name.trim())
                  .map((location) => (
                    <Badge key={location.id} variant="secondary" className="flex items-center gap-1">
                      <LocationIcon type={location.type} />
                      {location.name}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Avbryt
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !locations.some(loc => loc.name.trim())}
          >
            {isLoading ? 'Oppretter...' : `Opprett ${locations.filter(loc => loc.name.trim()).length} lokasjoner`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
