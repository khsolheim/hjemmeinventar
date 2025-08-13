'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { BatchGrid } from '@/components/yarn/BatchGrid'

export default function YarnDetailPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)
  const router = useRouter()

  if (!id) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Garn-detaljer</h1>
          <p className="text-muted-foreground">Se batches og statistikk</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/garn">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Til oversikten
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detaljer og batches</CardTitle>
          <CardDescription>Administrer batches for dette garnet</CardDescription>
        </CardHeader>
        <CardContent>
          <BatchGrid masterId={id} />
        </CardContent>
      </Card>
    </div>
  )
}


