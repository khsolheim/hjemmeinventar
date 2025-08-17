// TypeScript definitions for DYMO Label Framework
export interface DymoFramework {
  init: () => Promise<void>
  getPrinters: () => DymoPrinter[]
  openLabelFile: (xmlData: string) => DymoLabelFile
  printLabel: (printer: string, printParameters: string, labelXml: string, labelData: string) => void
  printLabel2: (printer: string, printParameters: string, labelXml: string, labelData: string) => Promise<void>
  checkEnvironment: () => DymoEnvironmentCheck
}

export interface DymoPrinter {
  name: string
  modelName: string
  isConnected: boolean
  isLocal: boolean
  isTwinTurbo: boolean
  printerType: string
}

export interface DymoLabelFile {
  getAddressObjectCount: () => number
  getObjectText: (objectName: string) => string
  setObjectText: (objectName: string, text: string) => void
  getObjectNames: () => string[]
  getLabelXml: () => string
}

export interface DymoEnvironmentCheck {
  framework: boolean
  printers: boolean
  addIn: boolean
}

export interface DymoPrintParameters {
  copies: number
  jobTitle: string
  flowDirection?: 'LeftToRight' | 'RightToLeft'
  alignment?: 'Left' | 'Center' | 'Right'
  cutLines?: boolean
  printQuality?: 'Text' | 'BarcodeAndGraphics'
}

export interface DymoLabelData {
  [objectName: string]: string
}

// Global DYMO object
declare global {
  interface Window {
    dymo?: {
      label: {
        framework: DymoFramework
      }
    }
  }
}

export type DymoStatus = 'NotInstalled' | 'Installed' | 'Ready' | 'Error'

export interface DymoServiceConfig {
  timeout: number
  retryAttempts: number
  defaultPrintParameters: DymoPrintParameters
}