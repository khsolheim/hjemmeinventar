'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LabelSizeSelector } from '@/components/printing/LabelSizeSelector'
import { LabelSizeManager } from '@/components/printing/LabelSizeManager'
import Link from 'next/link'

export default function TestPage() {
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [showManager, setShowManager] = useState(false)

  // Test label sizes
  const { data: labelSizes, isLoading } = trpc.labelSizes.getAll.useQuery()

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🧪 Test Side</h1>
        <p className="text-muted-foreground">Test av label sizes funksjonalitet</p>
      </div>

      {/* Label Sizes Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Label Sizes Test</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowManager(!showManager)}
              >
                {showManager ? 'Skjul' : 'Vis'} Manager
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/printing/sizes">
                  Gå til Sizes
                </Link>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Label Size Selector Test */}
          <div>
            <Label className="text-sm font-medium mb-2">Label Size Selector:</Label>
            <LabelSizeSelector
              value={selectedSize}
              onValueChange={setSelectedSize}
              placeholder="Velg en størrelse"
            />
            {selectedSize && (
              <div className="mt-2">
                <Badge variant="secondary">
                  Valgt: {labelSizes?.find(s => s.id === selectedSize)?.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Label Sizes List */}
          <div>
            <Label className="text-sm font-medium mb-2">Tilgjengelige størrelser:</Label>
            {isLoading ? (
              <p className="text-muted-foreground">Laster...</p>
            ) : labelSizes && labelSizes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {labelSizes.map((size) => (
                  <div 
                    key={size.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedSize(size.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{size.name}</span>
                      {size.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Standard
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {size.widthMm} × {size.heightMm} mm
                    </div>
                    {size.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {size.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Ingen størrelser funnet</p>
            )}
          </div>

          {/* Label Size Manager */}
          {showManager && (
            <div className="border-t pt-6">
              <LabelSizeManager />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
