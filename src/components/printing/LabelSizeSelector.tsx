'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'

interface LabelSizeSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function LabelSizeSelector({ 
  value, 
  onValueChange, 
  placeholder = "Velg størrelse",
  disabled = false 
}: LabelSizeSelectorProps) {
  const { data: labelSizes, isLoading } = trpc.labelSizes.getAll.useQuery()

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Laster..." />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {labelSizes?.map((size) => (
          <SelectItem key={size.id} value={size.id}>
            <div className="flex items-center justify-between w-full">
              <span>{size.name}</span>
              <span className="text-muted-foreground text-xs ml-2">
                {size.widthMm}×{size.heightMm}mm
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
