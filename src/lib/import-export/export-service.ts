import * as XLSX from 'xlsx'
import { Parser } from 'json2csv'

// Type definitions for export data
interface LocationWithCount {
  _count?: { items?: number }
}

interface ItemWithValue {
  estimatedValue?: number
}

interface LocationWithItems {
  items?: ItemWithValue[]
}

interface LoanData {
  status: string
  expectedReturnDate?: Date | string
}

// Export format options
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json'
  includeHeaders?: boolean
  encoding?: string
  delimiter?: string
  filename?: string
}

export interface ExportConfig {
  title: string
  description?: string
  fields: ExportField[]
  filters?: ExportFilter[]
  groupBy?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ExportField {
  key: string
  label: string
  type?: 'string' | 'number' | 'date' | 'boolean' | 'currency'
  format?: string
  transform?: (value: unknown) => unknown
}

export interface ExportFilter {
  field: string
  operator: 'equals' | 'contains' | 'startsWith' | 'gt' | 'lt' | 'between' | 'in'
  value: unknown
}

// Pre-configured export templates
export const ExportTemplates = {
  // Inventory Report
  INVENTORY_FULL: {
    title: 'Komplett Inventarliste',
    description: 'Alle gjenstander med full informasjon',
    fields: [
      { key: 'name', label: 'Navn', type: 'string' },
      { key: 'description', label: 'Beskrivelse', type: 'string' },
      { key: 'category.name', label: 'Kategori', type: 'string' },
      { key: 'location.name', label: 'Lokasjon', type: 'string' },
      { key: 'totalQuantity', label: 'Antall', type: 'number' },
      { key: 'unit', label: 'Enhet', type: 'string' },
      { key: 'estimatedValue', label: 'Estimert verdi', type: 'currency' },
      { key: 'purchaseDate', label: 'Kjøpsdato', type: 'date' },
      { key: 'expiryDate', label: 'Utløpsdato', type: 'date' },
      { key: 'brand', label: 'Merke', type: 'string' },
      { key: 'model', label: 'Modell', type: 'string' },
      { key: 'serialNumber', label: 'Serienummer', type: 'string' },
      { key: 'barcode', label: 'Strekkode', type: 'string' },
      { key: 'condition', label: 'Tilstand', type: 'string' },
      { key: 'priority', label: 'Prioritet', type: 'string' },
      { key: 'createdAt', label: 'Opprettet', type: 'date' },
      { key: 'updatedAt', label: 'Oppdatert', type: 'date' }
    ]
  } as ExportConfig,

  // Insurance Report
  INSURANCE: {
    title: 'Forsikringsrapport',
    description: 'Verdifulle gjenstander for forsikringsformål',
    fields: [
      { key: 'name', label: 'Gjenstand', type: 'string' },
      { key: 'description', label: 'Beskrivelse', type: 'string' },
      { key: 'category.name', label: 'Kategori', type: 'string' },
      { key: 'brand', label: 'Merke', type: 'string' },
      { key: 'model', label: 'Modell', type: 'string' },
      { key: 'serialNumber', label: 'Serienummer', type: 'string' },
      { key: 'estimatedValue', label: 'Verdi (NOK)', type: 'currency' },
      { key: 'purchaseDate', label: 'Kjøpsdato', type: 'date' },
      { key: 'condition', label: 'Tilstand', type: 'string' },
      { key: 'location.name', label: 'Oppbevaringssted', type: 'string' }
    ],
    filters: [
      { field: 'estimatedValue', operator: 'gt', value: 1000 } // Only items > 1000 NOK
    ]
  } as ExportConfig,

  // Expiry Report
  EXPIRY_TRACKING: {
    title: 'Utløpsdato Oversikt',
    description: 'Gjenstander som utløper eller er utløpt',
    fields: [
      { key: 'name', label: 'Gjenstand', type: 'string' },
      { key: 'category.name', label: 'Kategori', type: 'string' },
      { key: 'location.name', label: 'Lokasjon', type: 'string' },
      { key: 'totalQuantity', label: 'Antall', type: 'number' },
      { key: 'expiryDate', label: 'Utløpsdato', type: 'date' },
      { 
        key: 'daysUntilExpiry', 
        label: 'Dager til utløp', 
        type: 'number',
        transform: (item: { expiryDate?: Date | string }) => {
          if (!item.expiryDate) return null
          const today = new Date()
          const expiry = new Date(item.expiryDate)
          return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        }
      },
      { key: 'priority', label: 'Prioritet', type: 'string' }
    ],
    filters: [
      { field: 'expiryDate', operator: 'lt', value: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) } // Next 90 days
    ],
    sortBy: 'expiryDate',
    sortOrder: 'asc'
  } as ExportConfig,

  // Location Summary
  LOCATION_SUMMARY: {
    title: 'Lokasjonsoversikt',
    description: 'Oversikt over alle lokasjoner og antall gjenstander',
    fields: [
      { key: 'name', label: 'Lokasjon', type: 'string' },
      { key: 'description', label: 'Beskrivelse', type: 'string' },
      { key: 'type', label: 'Type', type: 'string' },
      { key: 'parent.name', label: 'Overordnet', type: 'string' },
      { key: 'capacity', label: 'Kapasitet', type: 'number' },
      { 
        key: 'itemCount', 
        label: 'Antall gjenstander', 
        type: 'number',
        transform: (location: LocationWithCount) => location._count?.items || 0
      },
      { 
        key: 'totalValue', 
        label: 'Total verdi', 
        type: 'currency',
        transform: (location: LocationWithItems) => {
          return location.items?.reduce((sum: number, item: ItemWithValue) => sum + (item.estimatedValue || 0), 0) || 0
        }
      }
    ]
  } as ExportConfig,

  // Loan Tracking
  LOAN_TRACKING: {
    title: 'Utlånsrapport',
    description: 'Oversikt over utlånte gjenstander',
    fields: [
      { key: 'item.name', label: 'Gjenstand', type: 'string' },
      { key: 'borrowerName', label: 'Låntaker', type: 'string' },
      { key: 'borrowerContact', label: 'Kontaktinfo', type: 'string' },
      { key: 'loanDate', label: 'Utlånt dato', type: 'date' },
      { key: 'expectedReturnDate', label: 'Forventet retur', type: 'date' },
      { key: 'actualReturnDate', label: 'Faktisk retur', type: 'date' },
      { key: 'status', label: 'Status', type: 'string' },
      { 
        key: 'daysOverdue', 
        label: 'Dager forsinket', 
        type: 'number',
        transform: (loan: LoanData) => {
          if (loan.status !== 'OUT' || !loan.expectedReturnDate) return 0
          const today = new Date()
          const expected = new Date(loan.expectedReturnDate)
          const overdue = Math.ceil((today.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24))
          return overdue > 0 ? overdue : 0
        }
      }
    ]
  } as ExportConfig
}

class ExportService {
  // Main export function
  async exportData(
    data: Record<string, unknown>[], 
    config: ExportConfig, 
    options: ExportOptions = { format: 'csv' }
  ): Promise<Blob> {
    // Apply filters
    let filteredData = this.applyFilters(data, config.filters || [])
    
    // Apply sorting
    if (config.sortBy) {
      filteredData = this.applySorting(filteredData, config.sortBy, config.sortOrder || 'asc')
    }

    // Transform data according to field configurations
    const transformedData = this.transformData(filteredData, config.fields)

    // Generate export based on format
    switch (options.format) {
      case 'csv':
        return this.generateCSV(transformedData, config, options)
      case 'xlsx':
        return this.generateExcel(transformedData, config, options)
      case 'json':
        return this.generateJSON(transformedData, config, options)
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  // Apply data filters
  private applyFilters(data: Record<string, unknown>[], filters: ExportFilter[]): Record<string, unknown>[] {
    return data.filter(item => {
      return filters.every(filter => {
        const value = this.getNestedValue(item, filter.field)
        return this.applyFilter(value, filter.operator, filter.value)
      })
    })
  }

  // Apply single filter
  private applyFilter(value: unknown, operator: string, filterValue: unknown): boolean {
    switch (operator) {
      case 'equals':
        return value === filterValue
      case 'contains':
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
      case 'startsWith':
        return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase())
      case 'gt':
        return Number(value) > Number(filterValue)
      case 'lt':
        return Number(value) < Number(filterValue)
      case 'between':
        return Array.isArray(filterValue) && 
               Number(value) >= Number(filterValue[0]) && 
               Number(value) <= Number(filterValue[1])
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value)
      default:
        return true
    }
  }

  // Apply sorting
  private applySorting(data: Record<string, unknown>[], sortBy: string, sortOrder: 'asc' | 'desc'): Record<string, unknown>[] {
    return [...data].sort((a, b) => {
      const aValue = this.getNestedValue(a, sortBy)
      const bValue = this.getNestedValue(b, sortBy)
      
      if ((aValue as any) < (bValue as any)) return sortOrder === 'asc' ? -1 : 1
      if ((aValue as any) > (bValue as any)) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  // Transform data according to field configuration
  private transformData(data: Record<string, unknown>[], fields: ExportField[]): Record<string, unknown>[] {
    return data.map(item => {
      const transformedItem: Record<string, unknown> = {}
      
      fields.forEach(field => {
        let value = this.getNestedValue(item, field.key)
        
        // Apply custom transform function
        if (field.transform) {
          value = field.transform(item)
        }
        
        // Apply type-specific formatting
        value = this.formatValue(value, field.type, field.format)
        
        transformedItem[field.label] = value
      })
      
      return transformedItem
    })
  }

  // Format value based on type
  private formatValue(value: unknown, type?: string, format?: string): unknown {
    if (value === null || value === undefined) return ''
    
    switch (type) {
      case 'date':
        if (value instanceof Date) {
          return format ? value.toLocaleDateString('nb-NO') : value.toISOString()
        }
        return value
        
      case 'currency':
        return new Intl.NumberFormat('nb-NO', {
          style: 'currency',
          currency: 'NOK'
        }).format(Number(value) || 0)
        
      case 'number':
        return Number(value) || 0
        
      case 'boolean':
        return value ? 'Ja' : 'Nei'
        
      default:
        return String(value)
    }
  }

  // Get nested object value by dot notation
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: any, key) => current?.[key], obj)
  }

  // Generate CSV
  private generateCSV(data: Record<string, unknown>[], config: ExportConfig, options: ExportOptions): Blob {
    try {
      const parser = new Parser({
        delimiter: options.delimiter || ',',
        quote: '"',
        escape: '"',
        header: options.includeHeaders !== false
      })
      
      const csv = parser.parse(data)
      return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    } catch (error) {
      throw new Error(`CSV generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Generate Excel
  private generateExcel(data: Record<string, unknown>[], config: ExportConfig, options: ExportOptions): Blob {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      
      // Add title and description if provided
      if (config.title) {
        XLSX.utils.book_append_sheet(workbook, worksheet, config.title.substring(0, 31)) // Excel sheet name limit
      } else {
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
      }
      
      // Auto-size columns
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
      const colWidths: { width: number }[] = []
      
      for (let col = range.s.c; col <= range.e.c; col++) {
        let maxWidth = 10
        for (let row = range.s.r; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          const cell = worksheet[cellAddress]
          if (cell && cell.v) {
            const cellLength = String(cell.v).length
            maxWidth = Math.max(maxWidth, cellLength)
          }
        }
        colWidths[col] = { width: Math.min(maxWidth + 2, 50) }
      }
      
      worksheet['!cols'] = colWidths
      
      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    } catch (error) {
      throw new Error(`Excel generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Generate JSON
  private generateJSON(data: Record<string, unknown>[], config: ExportConfig, options: ExportOptions): Blob {
    try {
      const exportData = {
        metadata: {
          title: config.title,
          description: config.description,
          exportDate: new Date().toISOString(),
          recordCount: data.length
        },
        data
      }
      
      const json = JSON.stringify(exportData, null, 2)
      return new Blob([json], { type: 'application/json;charset=utf-8;' })
    } catch (error) {
      throw new Error(`JSON generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Utility: Download blob as file
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Get suggested filename based on config and format
  generateFilename(config: ExportConfig, format: string): string {
    const timestamp = new Date().toISOString().split('T')[0]
    const title = config.title.toLowerCase().replace(/[^a-z0-9]/g, '-')
    return `${title}-${timestamp}.${format}`
  }

  // Validate export configuration
  validateConfig(config: ExportConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!config.title) {
      errors.push('Export title is required')
    }
    
    if (!config.fields || config.fields.length === 0) {
      errors.push('At least one field must be specified')
    }
    
    config.fields?.forEach((field, index) => {
      if (!field.key) {
        errors.push(`Field ${index + 1}: key is required`)
      }
      if (!field.label) {
        errors.push(`Field ${index + 1}: label is required`)
      }
    })
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const exportService = new ExportService()

