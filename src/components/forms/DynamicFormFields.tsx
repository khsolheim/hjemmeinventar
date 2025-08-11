'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { Calendar as CalendarIcon, Info } from 'lucide-react'

// Type definitions for field schema
interface FieldDefinition {
  type: 'string' | 'number' | 'select' | 'boolean' | 'date'
  label: string
  options?: string[]
  placeholder?: string
  required?: boolean
  description?: string
}

interface FieldSchema {
  type: 'object'
  properties: Record<string, FieldDefinition>
  required?: string[]
}

interface DynamicFormFieldsProps {
  schema: FieldSchema | null
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  categoryName?: string
  disabled?: boolean
}

// Individual field renderers
const StringField = ({ 
  fieldKey, 
  field, 
  value, 
  onChange, 
  disabled = false,
  required = false 
}: {
  fieldKey: string
  field: FieldDefinition
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
}) => (
  <div className="space-y-2">
    <Label htmlFor={fieldKey} className="flex items-center gap-2">
      {field.label}
      {required && <span className="text-red-500">*</span>}
      {field.description && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
              <Info className="h-3 w-3 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm">
            {field.description}
          </PopoverContent>
        </Popover>
      )}
    </Label>
    <Input
      id={fieldKey}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder || `Skriv inn ${field.label.toLowerCase()}`}
      disabled={disabled}
      required={required}
    />
  </div>
)

const NumberField = ({ 
  fieldKey, 
  field, 
  value, 
  onChange, 
  disabled = false,
  required = false 
}: {
  fieldKey: string
  field: FieldDefinition
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  required?: boolean
}) => (
  <div className="space-y-2">
    <Label htmlFor={fieldKey} className="flex items-center gap-2">
      {field.label}
      {required && <span className="text-red-500">*</span>}
      {field.description && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
              <Info className="h-3 w-3 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm">
            {field.description}
          </PopoverContent>
        </Popover>
      )}
    </Label>
    <Input
      id={fieldKey}
      type="number"
      value={value || ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      placeholder={field.placeholder || `Skriv inn ${field.label.toLowerCase()}`}
      disabled={disabled}
      required={required}
    />
  </div>
)

const SelectField = ({ 
  fieldKey, 
  field, 
  value, 
  onChange, 
  disabled = false,
  required = false 
}: {
  fieldKey: string
  field: FieldDefinition
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
}) => (
  <div className="space-y-2">
    <Label htmlFor={fieldKey} className="flex items-center gap-2">
      {field.label}
      {required && <span className="text-red-500">*</span>}
      {field.description && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
              <Info className="h-3 w-3 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm">
            {field.description}
          </PopoverContent>
        </Popover>
      )}
    </Label>
    <Select 
      value={value || 'none'} 
      onValueChange={(val) => onChange(val === 'none' ? '' : val)}
      disabled={disabled}
      required={required}
    >
      <SelectTrigger>
        <SelectValue placeholder={`Velg ${field.label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {!required && (
          <SelectItem value="none">Ingen valg</SelectItem>
        )}
        {field.options?.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

const BooleanField = ({ 
  fieldKey, 
  field, 
  value, 
  onChange, 
  disabled = false,
  required = false 
}: {
  fieldKey: string
  field: FieldDefinition
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  required?: boolean
}) => (
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <Checkbox
        id={fieldKey}
        checked={value || false}
        onCheckedChange={(checked) => onChange(checked === true)}
        disabled={disabled}
      />
      <Label htmlFor={fieldKey} className="flex items-center gap-2">
        {field.label}
        {required && <span className="text-red-500">*</span>}
        {field.description && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                <Info className="h-3 w-3 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-sm">
              {field.description}
            </PopoverContent>
          </Popover>
        )}
      </Label>
    </div>
  </div>
)

const DateField = ({ 
  fieldKey, 
  field, 
  value, 
  onChange, 
  disabled = false,
  required = false 
}: {
  fieldKey: string
  field: FieldDefinition
  value: Date | null
  onChange: (value: Date | null) => void
  disabled?: boolean
  required?: boolean
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldKey} className="flex items-center gap-2">
        {field.label}
        {required && <span className="text-red-500">*</span>}
        {field.description && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                <Info className="h-3 w-3 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-sm">
              {field.description}
            </PopoverContent>
          </Popover>
        )}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP", { locale: nb }) : `Velg ${field.label.toLowerCase()}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={(date) => {
              onChange(date || null)
              setOpen(false)
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Main component
export function DynamicFormFields({ 
  schema, 
  values, 
  onChange, 
  categoryName,
  disabled = false 
}: DynamicFormFieldsProps) {
  // If no schema, show nothing
  if (!schema || !schema.properties) {
    return null
  }

  const properties = schema.properties
  const requiredFields = schema.required || []

  const handleFieldChange = (fieldKey: string, fieldValue: any) => {
    onChange({
      ...values,
      [fieldKey]: fieldValue
    })
  }

  const fieldEntries = Object.entries(properties)

  // If no fields, show nothing
  if (fieldEntries.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-accent/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-primary rounded-full"></div>
        <h4 className="text-sm font-medium text-foreground">
          {categoryName ? `${categoryName}-spesifikke felt` : 'Kategori-spesifikke felt'}
        </h4>
        <span className="text-xs text-muted-foreground">
          ({fieldEntries.length} felt)
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fieldEntries.map(([fieldKey, field]) => {
          const isRequired = requiredFields.includes(fieldKey)
          const currentValue = values[fieldKey]

          switch (field.type) {
            case 'string':
              return (
                <StringField
                  key={fieldKey}
                  fieldKey={fieldKey}
                  field={field}
                  value={currentValue}
                  onChange={(value) => handleFieldChange(fieldKey, value)}
                  disabled={disabled}
                  required={isRequired}
                />
              )
            case 'number':
              return (
                <NumberField
                  key={fieldKey}
                  fieldKey={fieldKey}
                  field={field}
                  value={currentValue}
                  onChange={(value) => handleFieldChange(fieldKey, value)}
                  disabled={disabled}
                  required={isRequired}
                />
              )
            case 'select':
              return (
                <SelectField
                  key={fieldKey}
                  fieldKey={fieldKey}
                  field={field}
                  value={currentValue}
                  onChange={(value) => handleFieldChange(fieldKey, value)}
                  disabled={disabled}
                  required={isRequired}
                />
              )
            case 'boolean':
              return (
                <BooleanField
                  key={fieldKey}
                  fieldKey={fieldKey}
                  field={field}
                  value={currentValue}
                  onChange={(value) => handleFieldChange(fieldKey, value)}
                  disabled={disabled}
                  required={isRequired}
                />
              )
            case 'date':
              return (
                <DateField
                  key={fieldKey}
                  fieldKey={fieldKey}
                  field={field}
                  value={currentValue ? new Date(currentValue) : null}
                  onChange={(value) => handleFieldChange(fieldKey, value)}
                  disabled={disabled}
                  required={isRequired}
                />
              )
            default:
              return (
                <div key={fieldKey} className="text-sm text-muted-foreground">
                  Ukjent felttype: {field.type}
                </div>
              )
          }
        })}
      </div>
    </div>
  )
}

export type { FieldDefinition, FieldSchema }
