'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const steps = ['Velg mal', 'Velg kilde', 'Innstillinger', 'Forhåndsvis & skriv ut'] as const

type Step = typeof steps[number]

export function PrintWizardWireframe() {
  const [stepIndex, setStepIndex] = useState(0)
  const step: Step = steps[stepIndex]

  const next = () => setStepIndex((s) => Math.min(s + 1, steps.length - 1))
  const prev = () => setStepIndex((s) => Math.max(s - 1, 0))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Utskriftsveiviser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 text-sm">
            {steps.map((s, i) => (
              <div key={s} className={`flex items-center gap-2 ${i === stepIndex ? 'font-semibold' : 'text-muted-foreground'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${i <= stepIndex ? 'bg-primary text-primary-foreground' : ''}`}>{i + 1}</div>
                <span>{s}</span>
                {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>

          {step === 'Velg mal' && (
            <div className="space-y-3">
              <Label>Mal</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Velg mal (system/bruker)" />
                </SelectTrigger>
                <SelectContent>
                  {/* Populeres fra server senere */}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 'Velg kilde' && (
            <div className="space-y-2 text-sm text-muted-foreground">
              Velg datakilde (kommer): skann QR, velg lokasjoner/varer, eller importer.
              <div className="border rounded p-6 bg-muted" />
            </div>
          )}

          {step === 'Innstillinger' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Skriver</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg skriver" />
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </div>
              <div>
                <Label>Størrelse</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMALL">Liten (30334)</SelectItem>
                    <SelectItem value="STANDARD">Standard (30252)</SelectItem>
                    <SelectItem value="LARGE">Stor (30323)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kopier</Label>
                <input type="number" min={1} defaultValue={1} className="border rounded px-3 py-2 w-full" />
              </div>
            </div>
          )}

          {step === 'Forhåndsvis & skriv ut' && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Forhåndsvisning placeholder</div>
              <div className="flex gap-4 flex-wrap">
                <div className="w-48 h-32 bg-white border rounded" />
                <div className="w-48 h-32 bg-white border rounded" />
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={prev} disabled={stepIndex === 0}>Tilbake</Button>
            {stepIndex < steps.length - 1 ? (
              <Button onClick={next}>Neste</Button>
            ) : (
              <Button disabled>Skriv ut (kommer)</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}