'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Ruler, Monitor } from 'lucide-react'

interface LabelSizeFormProps {
  onSubmit: (data: {
    name: string
    widthMm: number
    heightMm: number
    description?: string
    isDefault: boolean
  }) => void
  isLoading?: boolean
  initialData?: {
    name: string
    widthMm: number
    heightMm: number
    description?: string
    isDefault: boolean
  }
}

export function LabelSizeForm({ onSubmit, isLoading = false, initialData }: LabelSizeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    widthMm: 54,
    heightMm: 25,
    description: '',
    isDefault: false
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        widthMm: initialData.widthMm,
        heightMm: initialData.heightMm,
        description: initialData.description || '',
        isDefault: initialData.isDefault
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Konverter mm til piksler (300 DPI)
  const widthPx = Math.round(formData.widthMm * 11.811)
  const heightPx = Math.round(formData.heightMm * 11.811)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Navn *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="f.eks. Standard, Liten, Stor"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="widthMm">Bredde (mm) *</Label>
          <Input
            id="widthMm"
            type="number"
            min="1"
            value={formData.widthMm}
            onChange={(e) => setFormData(prev => ({ ...prev, widthMm: parseInt(e.target.value) || 0 }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heightMm">Høyde (mm) *</Label>
          <Input
            id="heightMm"
            type="number"
            min="1"
            value={formData.heightMm}
            onChange={(e) => setFormData(prev => ({ ...prev, heightMm: parseInt(e.target.value) || 0 }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Beskrivelse (valgfritt)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="f.eks. Mest brukt størrelse, For små gjenstander"
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isDefault"
          checked={formData.isDefault}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
        />
        <Label htmlFor="isDefault">Sett som standard-størrelse</Label>
      </div>

      {/* Preview */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Ruler className="h-4 w-4" />
            <span className="text-sm font-medium">Forhåndsvisning</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              <span>Skjerm: {widthPx} × {heightPx} px</span>
            </div>
            <div className="flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              <span>Utskrift: {formData.widthMm} × {formData.heightMm} mm</span>
            </div>
          </div>
          <div 
            className="mt-2 border-2 border-dashed border-muted-foreground/30 rounded"
            style={{
              width: Math.min(widthPx / 4, 200),
              height: Math.min(heightPx / 4, 100),
              backgroundColor: 'white'
            }}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Lagrer...' : (initialData ? 'Oppdater' : 'Opprett')}
        </Button>
      </div>
    </form>
  )
}
