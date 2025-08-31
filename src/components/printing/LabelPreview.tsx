'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QrCode, Barcode, Palette } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

interface LabelPreviewProps {
  name: string
  type: 'QR' | 'BARCODE' | 'CUSTOM'
  sizeId: string
  description?: string
}

export function LabelPreview({ name, type, sizeId, description }: LabelPreviewProps) {
  const { data: labelSize } = trpc.labelSizes.getById.useQuery(sizeId, {
    enabled: !!sizeId
  })

  const getIcon = () => {
    switch (type) {
      case 'QR':
        return <QrCode className="h-8 w-8" />
      case 'BARCODE':
        return <Barcode className="h-8 w-8" />
      case 'CUSTOM':
        return <Palette className="h-8 w-8" />
    }
  }

  const getTypeColor = () => {
    switch (type) {
      case 'QR':
        return 'bg-blue-100 text-blue-800'
      case 'BARCODE':
        return 'bg-green-100 text-green-800'
      case 'CUSTOM':
        return 'bg-purple-100 text-purple-800'
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Forhåndsvisning</h3>
        <p className="text-sm text-muted-foreground">
          Slik vil etiketten se ut når den skrives ut
        </p>
      </div>

      {/* Label Preview */}
      <div className="flex justify-center">
        <Card
          className="p-4 bg-white border-2 border-dashed border-gray-300"
          style={{
            width: labelSize ? `${labelSize.widthMm * 3.78}px` : '200px', // Convert mm to px (roughly)
            height: labelSize ? `${labelSize.heightMm * 3.78}px` : '100px',
            minWidth: '150px',
            minHeight: '80px'
          }}
        >
          <div className="flex flex-col h-full justify-between">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className={`text-xs ${getTypeColor()}`}>
                {type}
              </Badge>
              {labelSize && (
                <span className="text-xs text-muted-foreground">
                  {labelSize.widthMm}×{labelSize.heightMm}
                </span>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              {getIcon()}
              <div className="mt-2">
                <p className="text-xs font-medium truncate max-w-full">
                  {name || 'Eksempel gjenstand'}
                </p>
                {description && (
                  <p className="text-xs text-muted-foreground truncate max-w-full">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <div className="w-full bg-black h-8 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded border-2 border-black flex items-center justify-center">
                  <div className="w-3 h-3 bg-black rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Size Info */}
      {labelSize && (
        <div className="text-center space-y-1">
          <p className="text-sm font-medium">{labelSize.name}</p>
          <p className="text-xs text-muted-foreground">
            {labelSize.widthMm}mm × {labelSize.heightMm}mm
            {labelSize.paperType && ` • ${labelSize.paperType}`}
          </p>
        </div>
      )}

      {/* Template Info */}
      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
        <h4 className="font-medium text-sm">Mal-informasjon</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span>{type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Størrelse:</span>
            <span>{labelSize?.name || 'Ikke valgt'}</span>
          </div>
          {description && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Beskrivelse:</span>
              <span className="max-w-32 truncate" title={description}>
                {description}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
