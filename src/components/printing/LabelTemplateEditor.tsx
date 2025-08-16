'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export function LabelTemplateEditorWireframe() {
  const [name, setName] = useState('')
  const [type, setType] = useState<'QR' | 'BARCODE' | 'CUSTOM'>('QR')
  const [size, setSize] = useState<'SMALL' | 'STANDARD' | 'LARGE'>('STANDARD')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rediger etikettmal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Navn</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="F.eks. Standard QR" />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QR">QR</SelectItem>
                  <SelectItem value="BARCODE">Strekkode</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="size">Størrelse</Label>
              <Select value={size} onValueChange={(v: any) => setSize(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg størrelse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMALL">Liten (30334)</SelectItem>
                  <SelectItem value="STANDARD">Standard (30252)</SelectItem>
                  <SelectItem value="LARGE">Stor (30323)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="xml">
            <TabsList>
              <TabsTrigger value="xml">XML-mal</TabsTrigger>
              <TabsTrigger value="mapping">Felttilordning</TabsTrigger>
              <TabsTrigger value="forhåndsvisning">Forhåndsvisning</TabsTrigger>
            </TabsList>
            <TabsContent value="xml" className="space-y-2">
              <div className="text-sm text-muted-foreground">
                XML-editor placeholder. Lim inn DYMO XML her i senere versjon.
              </div>
              <div className="border rounded p-3 bg-muted min-h-[160px]" />
            </TabsContent>
            <TabsContent value="mapping" className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Konfigurer hvilke datafelter som skal kobles til mal-objekter (placeholder).
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border rounded p-3">
                  <div className="font-medium mb-2">Mal-felter</div>
                  <ul className="text-sm space-y-1">
                    <li>ITEM_NAME</li>
                    <li>LOCATION_NAME</li>
                    <li>QR_CODE / BARCODE</li>
                  </ul>
                </div>
                <div className="border rounded p-3">
                  <div className="font-medium mb-2">Datakilder</div>
                  <ul className="text-sm space-y-1">
                    <li>item.name</li>
                    <li>location.name</li>
                    <li>item.barcode / distribution.qrCode</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="forhåndsvisning" className="space-y-2">
              <div className="text-sm text-muted-foreground">Forhåndsvisning placeholder (bruker eksisterende DYMO forhåndsvisning senere).</div>
              <div className="flex justify-center">
                <div className="w-48 h-32 bg-white border rounded" />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Avbryt</Button>
            <Button disabled>Save (kommer)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}