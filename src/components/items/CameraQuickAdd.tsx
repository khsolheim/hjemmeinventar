'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Sparkles,
  Check,
  RotateCcw,
  Loader2
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

interface CameraQuickAddProps {
  onComplete: () => void
  onProcessingChange: (processing: boolean) => void
}

export function CameraQuickAdd({ onComplete, onProcessingChange }: CameraQuickAddProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    category: '',
    description: ''
  })

  const analyzeImageMutation = trpc.ai.analyzeImage.useMutation()
  const createItemMutation = trpc.items.create.useMutation()

  const handleCapture = async (imageData: string) => {
    setCapturedImage(imageData)
    setIsAnalyzing(true)
    onProcessingChange(true)

    try {
      // Analyze image with AI
      const analysis = await analyzeImageMutation.mutateAsync({
        imageData,
        prompt: 'Describe this object and suggest a name, category, and typical location for a home inventory system'
      })

      setAiAnalysis(analysis)
      
      // Auto-fill form with AI suggestions
      setFormData({
        name: analysis.suggestedName || '',
        location: analysis.suggestedLocation || '',
        category: analysis.suggestedCategory || '',
        description: analysis.description || ''
      })
    } catch (error) {
      console.error('AI analysis failed:', error)
      // Fallback to manual input
      setFormData({
        name: '',
        location: '',
        category: '',
        description: ''
      })
    } finally {
      setIsAnalyzing(false)
      onProcessingChange(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) return

    onProcessingChange(true)

    try {
      await createItemMutation.mutateAsync({
        name: formData.name,
        locationId: formData.location,
        category: formData.category,
        description: formData.description,
        imageUrl: capturedImage
      })

      onComplete()
    } catch (error) {
      console.error('Failed to create item:', error)
    } finally {
      onProcessingChange(false)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setAiAnalysis(null)
    setFormData({
      name: '',
      location: '',
      category: '',
      description: ''
    })
  }

  if (!capturedImage) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">Ta bilde av gjenstanden</h3>
          <p className="text-sm text-muted-foreground mb-4">
            AI vil analysere bildet og foreslå informasjon
          </p>
        </div>

        <Button
          onClick={() => {
            // In a real implementation, this would open the camera
            // For now, we'll simulate with a file input
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                  handleCapture(e.target?.result as string)
                }
                reader.readAsDataURL(file)
              }
            }
            input.click()
          }}
          className="w-full"
        >
          <Camera className="w-4 h-4 mr-2" />
          Ta bilde
        </Button>

        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="w-3 h-3" />
            <span className="font-medium">AI-hjelp:</span>
          </div>
          <ul className="space-y-1">
            <li>• Ta et klart bilde av gjenstanden</li>
            <li>• AI vil foreslå navn, kategori og lokasjon</li>
            <li>• Du kan redigere forslagene etter behov</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Captured Image */}
      <div className="relative">
        <img
          src={capturedImage}
          alt="Captured item"
          className="w-full h-48 object-cover rounded-lg"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleRetake}
          className="absolute top-2 right-2"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="font-medium text-green-800">AI-analyse fullført</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Foreslått navn:</span>
              <Badge variant="outline" className="bg-white">
                {aiAnalysis.suggestedName}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Foreslått kategori:</span>
              <Badge variant="outline" className="bg-white">
                {aiAnalysis.suggestedCategory}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Foreslått lokasjon:</span>
              <Badge variant="outline" className="bg-white">
                {aiAnalysis.suggestedLocation}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {isAnalyzing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className="font-medium text-blue-800">Analyserer bilde...</p>
              <p className="text-sm text-blue-600">AI analyserer gjenstanden</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Navn *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="location">Lokasjon</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="mt-1"
            placeholder="F.eks. 'Kjøkken' eller 'Stue'"
          />
        </div>

        <div>
          <Label htmlFor="category">Kategori</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="mt-1"
            placeholder="F.eks. 'Kjøkkenutstyr' eller 'Elektronikk'"
          />
        </div>

        <div>
          <Label htmlFor="description">Beskrivelse</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1"
            placeholder="Legg til mer informasjon"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!formData.name.trim() || createItemMutation.isLoading}
        >
          {createItemMutation.isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Legger til...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Lagre gjenstand
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
