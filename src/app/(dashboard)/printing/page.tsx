import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

export default function PrintingHomePage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link href="/printing/templates">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Maler</CardTitle>
            <CardDescription>Administrer etikettmaler</CardDescription>
          </CardHeader>
          <CardContent>
            Åpne editor for å lage eller endre DYMO XML-maler.
          </CardContent>
        </Card>
      </Link>
      <Link href="/printing/wizard">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Utskriftsveiviser</CardTitle>
            <CardDescription>Stegvis assistent for utskrift</CardDescription>
          </CardHeader>
          <CardContent>
            Velg mal, kilde, innstillinger og skriv ut.
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}