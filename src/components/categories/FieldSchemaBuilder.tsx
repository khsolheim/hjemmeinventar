'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Trash2, 
  GripVertical,
  Type,
  Hash,
  List,
  CheckSquare,
  Calendar,
  Info,
  Eye,
  EyeOff,
  Copy,
  Save
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'

// Type definitions
type FieldType = 'string' | 'number' | 'select' | 'boolean' | 'date'

interface FieldDefinition {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  description?: string
  required: boolean
  options?: string[] // For select fields
}

interface FieldSchema {
  type: 'object'
  properties: Record<string, Omit<FieldDefinition, 'id'>>
  required: string[]
}

interface FieldSchemaBuilderProps {
  initialSchema?: FieldSchema | null
  onChange: (schema: FieldSchema) => void
  disabled?: boolean
  categoryName?: string
}

// Field type icons and labels
const FIELD_TYPES = [
  { value: 'string', label: 'Tekst', icon: Type, description: 'Enkelt tekstfelt' },
  { value: 'number', label: 'Tall', icon: Hash, description: 'Numerisk verdi' },
  { value: 'select', label: 'Dropdown', icon: List, description: 'Valgmeny med alternativer' },
  { value: 'boolean', label: 'Avkrysning', icon: CheckSquare, description: 'Ja/nei valg' },
  { value: 'date', label: 'Dato', icon: Calendar, description: 'Datovelger' }
] as const

// Individual field editor component
const FieldEditor = ({ 
  field, 
  onUpdate, 
  onDelete, 
  disabled = false 
}: {
  field: FieldDefinition
  onUpdate: (field: FieldDefinition) => void
  onDelete: () => void
  disabled?: boolean
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [options, setOptions] = useState<string[]>(field.options || [])
  const [newOption, setNewOption] = useState('')

  const fieldTypeInfo = FIELD_TYPES.find(t => t.value === field.type)

  const updateField = (updates: Partial<FieldDefinition>) => {
    onUpdate({ ...field, ...updates })
  }

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      const updatedOptions = [...options, newOption.trim()]
      setOptions(updatedOptions)
      updateField({ options: updatedOptions })
      setNewOption('')
    }
  }

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index)
    setOptions(updatedOptions)
    updateField({ options: updatedOptions })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addOption()
    }
  }

  return (
    <Card className={cn("transition-all", isExpanded ? "shadow-md" : "shadow-sm")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-move">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              {fieldTypeInfo?.icon && (
                <fieldTypeInfo.icon className="w-4 h-4 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">
                {field.label || 'Nytt felt'}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </CardTitle>
              <CardDescription className="text-xs">
                {fieldTypeInfo?.label} • {fieldTypeInfo?.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={disabled}
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={disabled}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Basic field properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`field-${field.id}-label`}>Feltnavn *</Label>
              <Input
                id={`field-${field.id}-label`}
                value={field.label}
                onChange={(e) => updateField({ label: e.target.value })}
                placeholder="F.eks. Produsent, Farge, Størrelse"
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor={`field-${field.id}-type`}>Felttype</Label>
              <Select 
                value={field.type} 
                onValueChange={(value: FieldType) => updateField({ type: value, options: value === 'select' ? options : undefined })}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor={`field-${field.id}-placeholder`}>Plassholdertekst</Label>
            <Input
              id={`field-${field.id}-placeholder`}
              value={field.placeholder || ''}
              onChange={(e) => updateField({ placeholder: e.target.value })}
              placeholder="Tekst som vises i tomt felt"
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor={`field-${field.id}-description`}>Beskrivelse</Label>
            <Textarea
              id={`field-${field.id}-description`}
              value={field.description || ''}
              onChange={(e) => updateField({ description: e.target.value })}
              placeholder="Hjelpetekst for brukeren"
              rows={2}
              disabled={disabled}
            />
          </div>

          {/* Options for select fields */}
          {field.type === 'select' && (
            <div className="space-y-3">
              <Label>Dropdown alternativer</Label>
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Legg til nytt alternativ"
                  onKeyPress={handleKeyPress}
                  disabled={disabled}
                />
                <Button 
                  onClick={addOption} 
                  disabled={!newOption.trim() || disabled}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {options.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {options.map((option, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {option}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 w-4 h-4"
                        onClick={() => removeOption(index)}
                        disabled={disabled}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Required checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`field-${field.id}-required`}
              checked={field.required}
              onCheckedChange={(checked) => updateField({ required: checked === true })}
              disabled={disabled}
            />
            <Label htmlFor={`field-${field.id}-required`} className="text-sm">
              Påkrevd felt
            </Label>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Main component
export function FieldSchemaBuilder({ 
  initialSchema, 
  onChange, 
  disabled = false,
  categoryName 
}: FieldSchemaBuilderProps) {
  const [fields, setFields] = useState<FieldDefinition[]>([])
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isLoadingInitialFields, setIsLoadingInitialFields] = useState(false)
  
  // Reset initialization when initialSchema changes
  useEffect(() => {
    setHasInitialized(false)
    setIsLoadingInitialFields(true)
  }, [initialSchema])
  
  // Debounce fields changes to avoid too many server calls
  const debouncedFields = useDebounce(fields, 1000) // 1 second delay

  // Initialize fields from schema
  useEffect(() => {
    if (initialSchema?.properties && Object.keys(initialSchema.properties).length > 0) {
      const initialFields: FieldDefinition[] = Object.entries(initialSchema.properties).map(([key, field]) => ({
        id: key,
        type: field.type as FieldType,
        label: field.label || key,
        placeholder: field.placeholder,
        description: field.description,
        required: initialSchema.required?.includes(key) || false,
        options: field.options
      }))
      
      setFields(initialFields)
      setHasInitialized(true)
      setIsLoadingInitialFields(false)
    } else {
      setFields([])
      setHasInitialized(true)
      setIsLoadingInitialFields(false)
    }
  }, [initialSchema])

  // Generate schema from fields
  const generateSchema = (fieldsToUse: FieldDefinition[] = fields) => {
    const properties: Record<string, Omit<FieldDefinition, 'id'>> = {}
    const required: string[] = []

    fieldsToUse.forEach(field => {
      if (field.label.trim()) {
        const key = generatePropertyKey(field)
        properties[key] = {
          type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          description: field.description,
          required: field.required,
          options: field.options
        }

        if (field.required) {
          required.push(key)
        }
      }
    })

    // Safety check: Don't return empty schema if we started with a non-empty initialSchema
    // This prevents accidentally clearing existing field definitions
    const hasInitialFields = initialSchema?.properties && Object.keys(initialSchema.properties).length > 0
    const hasCurrentProperties = Object.keys(properties).length > 0
    
    if (!hasCurrentProperties && hasInitialFields && hasInitialized) {
      // Only warn in development mode to avoid console spam
      if (process.env.NODE_ENV === 'development') {
        console.warn('FieldSchemaBuilder: Preventing empty schema generation when initialSchema had fields')
      }
      return initialSchema
    }

    return {
      type: 'object',
      properties,
      required
    } as FieldSchema
  }

  // Call onChange when debounced fields change, but not during initial loading
  useEffect(() => {
    // Only call onChange if we have been initialized AND we're not loading initial fields
    if (hasInitialized && !isLoadingInitialFields && debouncedFields.length >= 0) {
      const newSchema = generateSchema(debouncedFields)
      
      // Additional safeguard: Don't call onChange if we would be sending back the same initialSchema
      // This prevents infinite loops when the safeguard in generateSchema kicks in
      if (newSchema !== initialSchema) {
        onChange(newSchema)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFields, hasInitialized, isLoadingInitialFields])

  const addField = () => {
    const newField: FieldDefinition = {
      id: `field_${Date.now()}`,
      type: 'string',
      label: '',
      required: false
    }
    setFields(prev => [...prev, newField])
  }

  // Generate a safe property key from field label or use existing ID
  const generatePropertyKey = (field: FieldDefinition) => {
    // If field has an existing ID that's not a generated one, use it
    if (field.id && !field.id.startsWith('field_') && field.label) {
      return field.id
    }
    
    // Otherwise generate from label
    if (field.label.trim()) {
      return field.label
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || field.id
    }
    
    return field.id
  }

  const updateField = (index: number, updatedField: FieldDefinition) => {
    setFields(prev => {
      const newFields = [...prev]
      newFields[index] = updatedField
      return newFields
    })
  }

  const deleteField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index))
  }

  const duplicateField = (index: number) => {
    const fieldToDuplicate = fields[index]
    const duplicatedField: FieldDefinition = {
      ...fieldToDuplicate,
      id: `field_${Date.now()}`,
      label: `${fieldToDuplicate.label} (kopi)`
    }
    setFields(prev => [...prev, duplicatedField])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Felt-editor</h3>
          <p className="text-sm text-muted-foreground">
            {categoryName ? `Definer felt for ${categoryName}` : 'Definer kategori-spesifikke felt'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {fields.length} felt
          </Badge>
          <Badge variant="outline">
            {fields.filter(f => f.required).length} påkrevd
          </Badge>
        </div>
      </div>

      {/* Fields list */}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <FieldEditor
            key={field.id}
            field={field}
            onUpdate={(updatedField) => updateField(index, updatedField)}
            onDelete={() => deleteField(index)}
            disabled={disabled}
          />
        ))}

        {fields.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">Ingen felt definert</h4>
                  <p className="text-sm text-muted-foreground">
                    Legg til felt som skal dukke opp når brukere registrerer gjenstander i denne kategorien
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add field button */}
      <Button 
        onClick={addField} 
        variant="outline" 
        className="w-full"
        disabled={disabled}
      >
        <Plus className="w-4 h-4 mr-2" />
        Legg til nytt felt
      </Button>

      {/* Preview */}
      {fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Forhåndsvisning
            </CardTitle>
            <CardDescription>
              Slik vil feltene se ut når brukere registrerer gjenstander
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.filter(f => f.label.trim()).map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                    {field.description && (
                      <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                  </Label>
                  
                  {field.type === 'string' && (
                    <Input 
                      placeholder={field.placeholder || `Skriv inn ${field.label.toLowerCase()}`}
                      disabled 
                    />
                  )}
                  
                  {field.type === 'number' && (
                    <Input 
                      type="number"
                      placeholder={field.placeholder || `Skriv inn ${field.label.toLowerCase()}`}
                      disabled 
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder={`Velg ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                    </Select>
                  )}
                  
                  {field.type === 'boolean' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox disabled />
                      <Label className="text-sm">{field.label}</Label>
                    </div>
                  )}
                  
                  {field.type === 'date' && (
                    <Button variant="outline" disabled className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Velg {field.label.toLowerCase()}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export type { FieldDefinition, FieldSchema }
