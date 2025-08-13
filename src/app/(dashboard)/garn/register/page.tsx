'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { YarnWizard } from '@/components/yarn/YarnWizard'
import { useRouter } from 'next/navigation'

export default function RegisterYarnPage() {
  const router = useRouter()
  return (
    <div className="page cq container mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between cq">
        <div>
          <h1 className="text-3xl font-bold">Registrer Nytt Garn</h1>
          <p className="text-muted-foreground">Opprett en ny garn-type eller legg til batch</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/garn">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Til oversikten
          </Link>
        </Button>
      </div>

      <Card className="responsive-dialog">
        <CardHeader>
          <CardTitle>Veiviser</CardTitle>
          <CardDescription>Følg stegene for å registrere garn</CardDescription>
        </CardHeader>
        <CardContent>
          <YarnWizard onComplete={() => router.push('/garn')} />
        </CardContent>
      </Card>
    </div>
  )
}


