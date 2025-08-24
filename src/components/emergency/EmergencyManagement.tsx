'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  AlertTriangle,
  Phone,
  FileText,
  Shield,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Bell,
  Heart,
  Home,
  Car,
  FirstAid,
  FireExtinguisher
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface EmergencyManagementProps {
  className?: string
}

export function EmergencyManagement({ className }: EmergencyManagementProps) {
  const [selectedTab, setSelectedTab] = useState<'contacts' | 'documents' | 'equipment' | 'plans'>('contacts')
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalType, setModalType] = useState<'contact' | 'document' | 'equipment' | 'plan'>('contact')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    type: '',
    location: '',
    description: '',
    expiryDate: '',
    nextCheck: ''
  })
  const haptic = useHapticFeedback()

  // Emergency queries
  const contactsQuery = trpc.emergency.getContacts.useQuery()
  const documentsQuery = trpc.emergency.getDocuments.useQuery()
  const equipmentQuery = trpc.emergency.getEquipment.useQuery()
  const plansQuery = trpc.emergency.getPlans.useQuery()

  const addContactMutation = trpc.emergency.addContact.useMutation()
  const addDocumentMutation = trpc.emergency.addDocument.useMutation()
  const addEquipmentMutation = trpc.emergency.addEquipment.useMutation()
  const addPlanMutation = trpc.emergency.addPlan.useMutation()

  const handleAddItem = async () => {
    haptic.success()
    try {
      switch (modalType) {
        case 'contact':
          await addContactMutation.mutateAsync({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            relationship: formData.relationship
          })
          break
        case 'document':
          await addDocumentMutation.mutateAsync({
            name: formData.name,
            type: formData.type,
            location: formData.location,
            description: formData.description
          })
          break
        case 'equipment':
          await addEquipmentMutation.mutateAsync({
            name: formData.name,
            type: formData.type,
            location: formData.location,
            nextCheck: new Date(formData.nextCheck)
          })
          break
        case 'plan':
          await addPlanMutation.mutateAsync({
            name: formData.name,
            type: formData.type,
            description: formData.description
          })
          break
      }
      setShowAddModal(false)
      setFormData({ name: '', phone: '', email: '', relationship: '', type: '', location: '', description: '', expiryDate: '', nextCheck: '' })
    } catch (error) {
      console.error('Failed to add item:', error)
    }
  }

  const getEquipmentStatus = (nextCheck: Date) => {
    const now = new Date()
    const checkDate = new Date(nextCheck)
    const daysUntil = Math.ceil((checkDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) return { status: 'overdue', color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Forfalt' }
    if (daysUntil <= 7) return { status: 'urgent', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, text: 'Snart forfalt' }
    return { status: 'ok', color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'OK' }
  }

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'first_aid': return FirstAid
      case 'fire_extinguisher': return FireExtinguisher
      case 'smoke_detector': return AlertTriangle
      case 'emergency_light': return Home
      default: return Shield
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'insurance': return Shield
      case 'medical': return Heart
      case 'legal': return FileText
      case 'financial': return FileText
      default: return FileText
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Nød- og Sikkerhetsstyring</h2>
          <p className="text-muted-foreground">
            Administrer nødkontakter, viktige dokumenter og sikkerhetsutstyr
          </p>
        </div>
        <Button
          onClick={() => {
            setModalType(selectedTab.slice(0, -1) as any)
            setShowAddModal(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Legg til
        </Button>
      </div>

      {/* Emergency Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nødkontakter</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {contactsQuery.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Registrerte kontakter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viktige dokumenter</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {documentsQuery.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Lagrede dokumenter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sikkerhetsutstyr</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {equipmentQuery.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Registrert utstyr
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nødplaner</CardTitle>
            <MapPin className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {plansQuery.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktive planer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'contacts' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('contacts')}
          className="flex-1"
        >
          <Phone className="w-4 h-4 mr-2" />
          Kontakter
        </Button>
        <Button
          variant={selectedTab === 'documents' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('documents')}
          className="flex-1"
        >
          <FileText className="w-4 h-4 mr-2" />
          Dokumenter
        </Button>
        <Button
          variant={selectedTab === 'equipment' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('equipment')}
          className="flex-1"
        >
          <Shield className="w-4 h-4 mr-2" />
          Utstyr
        </Button>
        <Button
          variant={selectedTab === 'plans' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('plans')}
          className="flex-1"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Planer
        </Button>
      </div>

      {/* Contacts Tab */}
      {selectedTab === 'contacts' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Nødkontakter
              </CardTitle>
              <CardDescription>
                Viktige kontakter for nødsituasjoner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contactsQuery.data?.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {contact.relationship} • {contact.phone}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documents Tab */}
      {selectedTab === 'documents' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Viktige dokumenter
              </CardTitle>
              <CardDescription>
                Forsikring, medisinske og juridiske dokumenter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documentsQuery.data?.map((document) => {
                  const IconComponent = getDocumentIcon(document.type)
                  
                  return (
                    <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{document.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {document.type} • {document.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Equipment Tab */}
      {selectedTab === 'equipment' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sikkerhetsutstyr
              </CardTitle>
              <CardDescription>
                Førstehjelp, brannslukking og sikkerhetsutstyr
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {equipmentQuery.data?.map((equipment) => {
                  const IconComponent = getEquipmentIcon(equipment.type)
                  const status = getEquipmentStatus(equipment.nextCheck)
                  const StatusIcon = status.icon
                  
                  return (
                    <div key={equipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium">{equipment.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {equipment.type} • {equipment.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.text}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plans Tab */}
      {selectedTab === 'plans' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Nødplaner
              </CardTitle>
              <CardDescription>
                Evakueringsplaner og nødprosedyrer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plansQuery.data?.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {plan.type} • {plan.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                Legg til {modalType === 'contact' ? 'nødkontakt' : 
                         modalType === 'document' ? 'dokument' : 
                         modalType === 'equipment' ? 'sikkerhetsutstyr' : 'nødplan'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Navn på kontakt/dokument/utstyr/plan"
                />
              </div>
              
              {modalType === 'contact' && (
                <>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Telefonnummer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-post</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="E-postadresse"
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Forhold</Label>
                    <Input
                      id="relationship"
                      value={formData.relationship}
                      onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                      placeholder="F.eks. Familie, Lege, Advokat"
                    />
                  </div>
                </>
              )}
              
              {modalType === 'document' && (
                <>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Input
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      placeholder="F.eks. Forsikring, Medisinsk, Juridisk"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Plassering</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Hvor dokumentet er lagret"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Beskrivelse</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Beskrivelse av dokumentet"
                    />
                  </div>
                </>
              )}
              
              {modalType === 'equipment' && (
                <>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Input
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      placeholder="F.eks. Førstehjelp, Brannslukker"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Plassering</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Hvor utstyret er plassert"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nextCheck">Neste kontroll</Label>
                    <Input
                      id="nextCheck"
                      type="date"
                      value={formData.nextCheck}
                      onChange={(e) => setFormData(prev => ({ ...prev, nextCheck: e.target.value }))}
                    />
                  </div>
                </>
              )}
              
              {modalType === 'plan' && (
                <>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Input
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      placeholder="F.eks. Evakuering, Brann, Medisinsk"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Beskrivelse</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Beskrivelse av planen"
                    />
                  </div>
                </>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddItem}
                  disabled={!formData.name}
                  className="flex-1"
                >
                  Legg til
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Avbryt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
