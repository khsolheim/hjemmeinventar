'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus,
  Camera,
  QrCode,
  Type,
  Package,
  Sparkles,
  Zap,
  Target,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react'
import { QuickAddModal } from '@/components/items/QuickAddModal'
import { BarcodeQuickAdd } from '@/components/items/BarcodeQuickAdd'
import { CameraQuickAdd } from '@/components/items/CameraQuickAdd'
import { TextQuickAdd } from '@/components/items/TextQuickAdd'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

export default function QuickAddPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'modal' | 'barcode' | 'camera' | 'text'>('modal')
  const haptic = useHapticFeedback()

  const handleQuickAdd = () => {
    haptic.success()
    setIsModalOpen(true)
  }

  const handleMethodSelect = (method: 'modal' | 'barcode' | 'camera' | 'text') => {
    haptic.selection()
    setSelectedMethod(method)
  }

  const quickMethods = [
    {
      id: 'modal',
      name: 'Smart Quick-Add',
      description: 'Intelligent form med forslag basert på tidligere gjenstander',
      icon: Sparkles,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      badge: 'Anbefalt'
    },
    {
      id: 'camera',
      name: 'Kamera',
      description: 'Ta bilde av gjenstanden for automatisk gjenkjenning',
      icon: Camera,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      badge: 'AI-Powered'
    },
    {
      id: 'barcode',
      name: 'Strekkode',
      description: 'Skann strekkode eller QR-kode for rask identifikasjon',
      icon: QrCode,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      badge: 'Rask'
    },
    {
      id: 'text',
      name: 'Tekst',
      description: 'Skriv inn gjenstandsinformasjon manuelt',
      icon: Type,
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      badge: 'Enkel'
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quick Add</h1>
          <p className="text-muted-foreground">
            Legg til gjenstander raskt og enkelt med smarte verktøy
          </p>
        </div>
        <Button onClick={handleQuickAdd} size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Legg til gjenstand
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Totalt gjenstander</span>
            </div>
            <p className="text-2xl font-bold">1,247</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Sist lagt til</span>
            </div>
            <p className="text-2xl font-bold">2 timer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Favoritter</span>
            </div>
            <p className="text-2xl font-bold">89</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Kategorier</span>
            </div>
            <p className="text-2xl font-bold">24</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Add Metoder
          </CardTitle>
          <CardDescription>
            Velg den beste måten å legge til gjenstander på
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickMethods.map((method) => {
              const Icon = method.icon
              const isSelected = selectedMethod === method.id
              
              return (
                <Card 
                  key={method.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleMethodSelect(method.id as any)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${method.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {method.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {method.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{method.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Method Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {quickMethods.find(m => m.id === selectedMethod)?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedMethod === 'modal' && (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Quick-Add</h3>
              <p className="text-muted-foreground mb-4">
                Klikk på "Legg til gjenstand" knappen for å åpne den smarte quick-add modalen
              </p>
              <Button onClick={handleQuickAdd} size="lg">
                Åpne Smart Quick-Add
              </Button>
            </div>
          )}
          
          {selectedMethod === 'barcode' && <BarcodeQuickAdd />}
          {selectedMethod === 'camera' && <CameraQuickAdd />}
          {selectedMethod === 'text' && <TextQuickAdd />}
        </CardContent>
      </Card>

      {/* Quick Add Modal */}
      <QuickAddModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
    </div>
  )
}
