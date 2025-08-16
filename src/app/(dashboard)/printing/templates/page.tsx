import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Maler</h1>
        <Link href="/printing/editor">
          <Button>Ny mal</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Ingen maler å vise ennå. Opprett en ny mal.</div>
        </CardContent>
      </Card>
    </div>
  )
}