'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  UserPlus, 
  Mail, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  Shield,
  Eye
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { HouseholdRole } from '@prisma/client'

interface InviteForm {
  email: string
  role: HouseholdRole
}

export default function InviteUserPage() {
  const params = useParams()
  const router = useRouter()
  const householdId = params.id as string

  const [form, setForm] = useState<InviteForm>({
    email: '',
    role: 'MEMBER'
  })

  const { 
    data: household, 
    isLoading: householdLoading 
  } = trpc.households.getHousehold.useQuery(householdId)

  const inviteMutation = trpc.households.inviteUser.useMutation({
    onSuccess: () => {
      toast.success('Invitasjon sendt!')
      router.push(`/households/${householdId}`)
    },
    onError: (error) => {
      toast.error(`Feil ved invitasjon: ${error.message}`)
    }
  })

  const handleInvite = async () => {
    if (!form.email.trim()) {
      toast.error('E-postadresse er påkrevd')
      return
    }

    inviteMutation.mutate({
      householdId,
      email: form.email.trim(),
      role: form.role
    })
  }

  const getRoleInfo = (role: HouseholdRole) => {
    const roleInfo = {
      ADMIN: {
        icon: <Shield className="w-5 h-5 text-blue-600" />,
        title: 'Administrator',
        description: 'Full tilgang til husholdningen. Kan invitere og fjerne medlemmer, samt redigere alle innstillinger.'
      },
      MEMBER: {
        icon: <Users className="w-5 h-5 text-green-600" />,
        title: 'Medlem',
        description: 'Kan legge til, redigere og slette sine egne gjenstander. Kan se alle gjenstander i husholdningen.'
      },
      READONLY: {
        icon: <Eye className="w-5 h-5 text-gray-600" />,
        title: 'Kun visning',
        description: 'Kan bare se inventaret. Kan ikke legge til eller redigere gjenstander.'
      }
    }
    return roleInfo[role]
  }

  if (householdLoading) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!household || household.myRole !== 'ADMIN') {
    return (
      <div className="page container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600">Ingen tilgang</h2>
              <p className="text-gray-500 mb-4">Du må være administrator for å invitere medlemmer</p>
              <Button asChild>
                <Link href={`/households/${householdId}`}>Tilbake til husholdning</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="page container mx-auto px-4 py-8 max-w-2xl cq">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/households/${householdId}`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Tilbake til {household.name}
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Inviter nytt medlem</h1>
            <p className="text-muted-foreground">
              Legg til et nytt medlem i "{household.name}"
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Invitasjonsdetaljer</CardTitle>
          <CardDescription>
            Send en invitasjon til en person via e-post
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">E-postadresse</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="navn@example.com"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Personen må allerede ha en konto i systemet
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label>Rolle</Label>
            <Select 
              value={form.role} 
              onValueChange={(value: HouseholdRole) => setForm(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Medlem</SelectItem>
                <SelectItem value="READONLY">Kun visning</SelectItem>
                <SelectItem value="ADMIN">Administrator</SelectItem>
              </SelectContent>
            </Select>

            {/* Role Information */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {getRoleInfo(form.role).icon}
                  <div>
                    <h4 className="font-medium">{getRoleInfo(form.role).title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getRoleInfo(form.role).description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warning for Admin Role */}
          {form.role === 'ADMIN' && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Administratorer har full tilgang til husholdningen og kan invitere eller fjerne andre medlemmer. 
                Vær forsiktig med hvem du gir administratortilgang.
              </AlertDescription>
            </Alert>
          )}

          {/* Current Members Info */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Nåværende medlemmer ({household.memberCount})</h4>
            <div className="text-sm text-muted-foreground">
              Den inviterte personen vil bli lagt til som medlem #{household.memberCount + 1}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" asChild>
              <Link href={`/households/${householdId}`}>
                Avbryt
              </Link>
            </Button>
            
            <Button 
              onClick={handleInvite}
              disabled={inviteMutation.isPending || !form.email.trim()}
            >
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sender invitasjon...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send invitasjon
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Hvordan fungerer invitasjoner?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">1</div>
            <div>
              <p className="font-medium">Verifisering</p>
              <p className="text-sm text-muted-foreground">Vi sjekker om e-postadressen tilhører en eksisterende bruker</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">2</div>
            <div>
              <p className="font-medium">Automatisk tillegg</p>
              <p className="text-sm text-muted-foreground">Brukeren blir automatisk lagt til i husholdningen med valgt rolle</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">3</div>
            <div>
              <p className="font-medium">Umiddelbar tilgang</p>
              <p className="text-sm text-muted-foreground">Personen kan umiddelbart se og bruke husholdningens inventar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
