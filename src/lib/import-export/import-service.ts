import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { z } from 'zod'

// Import data schemas
export const ImportItemSchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd'),
  description: z.string().optional(),
  categoryName: z.string().optional(),
  locationName: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  unit: z.string().optional().default('stk'),
  price: z.coerce.number().optional(),
  purchaseDate: z.string().optional(),
  expiryDate: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  barcode: z.string().optional(),
  tags: z.string().optional(), // Comma-separated
  notes: z.string().optional(),
  condition: z.enum(['NEW', 'USED', 'DAMAGED', 'REPAIR', 'DISPOSED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).optional()
})

export const ImportLocationSchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd'),
  description: z.string().optional(),
  type: z.enum(['ROOM', 'SHELF', 'BOX', 'CONTAINER', 'DRAWER', 'CABINET', 'OTHER']).default('OTHER'),
  parentName: z.string().optional(), // Parent location name
  capacity: z.coerce.number().optional(),
  notes: z.string().optional()
})

export const ImportCategorySchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional()
})

export type ImportItem = z.infer<typeof ImportItemSchema>
export type ImportLocation = z.infer<typeof ImportLocationSchema>
export type ImportCategory = z.infer<typeof ImportCategorySchema>

export interface ImportResult<T> {
  success: boolean
  data: T[]
  errors: ImportError[]
  summary: {
    totalRows: number
    validRows: number
    invalidRows: number
    duplicates: number
  }
}

export interface ImportError {
  row: number
  field?: string
  message: string
  data?: any
}

export interface ImportOptions {
  skipDuplicates?: boolean
  updateExisting?: boolean
  createMissingReferences?: boolean
  dryRun?: boolean
  encoding?: string
}

class ImportService {
  // Parse CSV file
  async parseCSV<T extends object>(file: File, schema: z.ZodSchema<T>, options: ImportOptions = {}): Promise<ImportResult<T>> {
    return new Promise((resolve) => {
      const errors: ImportError[] = []
      const validData: T[] = []
      let totalRows = 0
      let duplicateCount = 0

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: options.encoding || 'UTF-8',
        transformHeader: (header) => {
          // Normalize headers to match schema fields
          return this.normalizeHeader(header)
        },
        step: (result, parser) => {
          totalRows++
          
          try {
            // Validate row data
            const validatedData = schema.parse(result.data)
            
            // Check for duplicates if enabled
            if (options.skipDuplicates && this.isDuplicate(validatedData, validData)) {
              duplicateCount++
              return
            }
            
            validData.push(validatedData)
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.issues.forEach((err: any) => {
                errors.push({
                  row: totalRows,
                  field: err.path.join('.'),
                  message: err.message,
                  data: result.data
                })
              })
            } else {
              errors.push({
                row: totalRows,
                message: 'Ukjent feil ved parsing av rad',
                data: result.data
              })
            }
          }
        },
        complete: () => {
          resolve({
            success: errors.length === 0,
            data: validData,
            errors,
            summary: {
              totalRows,
              validRows: validData.length,
              invalidRows: errors.length,
              duplicates: duplicateCount
            }
          })
        },
        error: (error) => {
          resolve({
            success: false,
            data: [],
            errors: [{ row: 0, message: `CSV parsing feilet: ${error.message}` }],
            summary: { totalRows: 0, validRows: 0, invalidRows: 1, duplicates: 0 }
          })
        }
      })
    })
  }

  // Parse Excel file
  async parseExcel<T extends object>(file: File, schema: z.ZodSchema<T>, options: ImportOptions = {}): Promise<ImportResult<T>> {
    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      
      // Use first worksheet
      const worksheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[worksheetName]
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        raw: false
      })

      if (jsonData.length === 0) {
        return {
          success: false,
          data: [],
          errors: [{ row: 0, message: 'Excel-filen er tom' }],
          summary: { totalRows: 0, validRows: 0, invalidRows: 1, duplicates: 0 }
        }
      }

      // Extract headers and data
      const headers = (jsonData[0] as string[]).map(h => this.normalizeHeader(h))
      const dataRows = jsonData.slice(1) as any[][]

      const errors: ImportError[] = []
      const validData: T[] = []
      let duplicateCount = 0

      dataRows.forEach((row, index) => {
        const rowNumber = index + 2 // +2 because we skipped header and arrays are 0-indexed
        
        try {
          // Convert array row to object using headers
          const rowObject: any = {}
          headers.forEach((header, headerIndex) => {
            if (header && row[headerIndex] !== undefined) {
              rowObject[header] = row[headerIndex]
            }
          })

          // Validate row data
          const validatedData = schema.parse(rowObject)
          
          // Check for duplicates if enabled
          if (options.skipDuplicates && this.isDuplicate(validatedData, validData)) {
            duplicateCount++
            return
          }
          
          validData.push(validatedData)
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.issues.forEach((err: any) => {
              errors.push({
                row: rowNumber,
                field: err.path.join('.'),
                message: err.message,
                data: row
              })
            })
          } else {
            errors.push({
              row: rowNumber,
              message: 'Ukjent feil ved validering av rad',
              data: row
            })
          }
        }
      })

      return {
        success: errors.length === 0,
        data: validData,
        errors,
        summary: {
          totalRows: dataRows.length,
          validRows: validData.length,
          invalidRows: errors.length,
          duplicates: duplicateCount
        }
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [{ 
          row: 0, 
          message: `Excel parsing feilet: ${error instanceof Error ? error.message : 'Ukjent feil'}` 
        }],
        summary: { totalRows: 0, validRows: 0, invalidRows: 1, duplicates: 0 }
      }
    }
  }

  // Detect file type and parse accordingly
  async parseFile<T extends object>(file: File, schema: z.ZodSchema<T>, options: ImportOptions = {}): Promise<ImportResult<T>> {
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'csv':
        return this.parseCSV(file, schema, options)
      case 'xlsx':
      case 'xls':
        return this.parseExcel(file, schema, options)
      default:
        return {
          success: false,
          data: [],
          errors: [{ row: 0, message: `Filtype .${extension} støttes ikke. Kun CSV og Excel (.xlsx/.xls) er støttet.` }],
          summary: { totalRows: 0, validRows: 0, invalidRows: 1, duplicates: 0 }
        }
    }
  }

  // Normalize header names to match schema fields
  private normalizeHeader(header: string): string {
    const normalizations: Record<string, string> = {
      // Items
      'navn': 'name',
      'beskrivelse': 'description',
      'kategori': 'categoryName',
      'lokasjon': 'locationName',
      'antall': 'quantity',
      'enhet': 'unit',
      'pris': 'price',
      'kjøpsdato': 'purchaseDate',
      'utløpsdato': 'expiryDate',
      'merke': 'brand',
      'modell': 'model',
      'serienummer': 'serialNumber',
      'strekkode': 'barcode',
      'tags': 'tags',
      'notater': 'notes',
      'tilstand': 'condition',
      'prioritet': 'priority',
      
      // Locations
      'forelder': 'parentName',
      'kapasitet': 'capacity',
      
      // Categories
      'ikon': 'icon',
      'farge': 'color',
      
      // English alternatives
      'category': 'categoryName',
      'location': 'locationName',
      'amount': 'quantity',
      'qty': 'quantity',
      'cost': 'price',
      'purchase date': 'purchaseDate',
      'expiry date': 'expiryDate',
      'expiration date': 'expiryDate',
      'serial number': 'serialNumber',
      'serial': 'serialNumber'
    }

    const normalized = header.toLowerCase().trim()
    return normalizations[normalized] || normalized
  }

  // Check if data is duplicate (basic implementation)
  private isDuplicate<T extends object>(newItem: T, existingItems: T[]): boolean {
    if ('name' in newItem) {
      return existingItems.some(item => 
        'name' in item && (item as any).name === (newItem as any).name
      )
    }
    return false
  }

  // Generate import template
  generateTemplate(type: 'items' | 'locations' | 'categories', format: 'csv' | 'xlsx' = 'csv'): Blob {
    const templates = {
      items: {
        headers: [
          'navn', 'beskrivelse', 'kategori', 'lokasjon', 'antall', 'enhet', 
          'pris', 'kjøpsdato', 'utløpsdato', 'merke', 'modell', 'serienummer', 
          'strekkode', 'tags', 'notater', 'tilstand', 'prioritet'
        ],
        example: [
          'iPhone 15 Pro', 'Telefon i bra stand', 'Elektronikk', 'Soverom', '1', 'stk',
          '12000', '2024-01-15', '', 'Apple', 'iPhone 15 Pro', 'ABC123', 
          '1234567890123', 'telefon,apple,elektronikk', 'Kjøpt på Black Friday', 'NEW', 'NORMAL'
        ]
      },
      locations: {
        headers: ['navn', 'beskrivelse', 'type', 'forelder', 'kapasitet', 'notater'],
        example: ['Soverom', 'Hovedsoverom på andre etasje', 'ROOM', '', '', 'Stort rom med garderobe']
      },
      categories: {
        headers: ['navn', 'beskrivelse', 'ikon', 'farge'],
        example: ['Elektronikk', 'Alle elektroniske enheter', '💻', '#3B82F6']
      }
    }

    const template = templates[type]
    
    if (format === 'csv') {
      const csvContent = [
        template.headers.join(','),
        template.example.join(',')
      ].join('\n')
      
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    } else {
      // Excel format
      const ws = XLSX.utils.aoa_to_sheet([template.headers, template.example])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, type)
      
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    }
  }

  // Validate import preview
  validateImportData<T extends object>(data: T[], existingData: T[], type: string): {
    valid: T[]
    duplicates: T[]
    errors: { item: T, error: string }[]
  } {
    const valid: T[] = []
    const duplicates: T[] = []
    const errors: { item: T, error: string }[] = []

    data.forEach(item => {
      try {
        // Check for duplicates
        if (this.isDuplicate(item, existingData)) {
          duplicates.push(item)
          return
        }

        // Additional validation can be added here
        valid.push(item)
      } catch (error) {
        errors.push({
          item,
          error: error instanceof Error ? error.message : 'Ukjent valideringsfeil'
        })
      }
    })

    return { valid, duplicates, errors }
  }
}

// Export singleton instance
export const importService = new ImportService()

