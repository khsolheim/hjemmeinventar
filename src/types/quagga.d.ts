declare module 'quagga' {
  export interface QuaggaConfig {
    inputStream?: {
      name?: string
      type?: string
      target?: HTMLElement | string
      constraints?: {
        width?: number
        height?: number
        facingMode?: string
      }
    }
    locator?: {
      patchSize?: string
      halfSample?: boolean
    }
    numOfWorkers?: number
    frequency?: number
    decoder?: {
      readers?: string[]
    }
    locate?: boolean
  }

  export interface Result {
    codeResult?: {
      code: string
      format: string
    }
    line?: any
    angle?: number
    pattern?: any
    boxes?: any[]
  }

  export interface QuaggaStatic {
    init(config: QuaggaConfig, callback?: (err: any) => void): void
    start(): void
    stop(): void
    onDetected(callback: (result: Result) => void): void
    onProcessed(callback: (result: Result) => void): void
    offDetected(callback: (result: Result) => void): void
    offProcessed(callback: (result: Result) => void): void
  }

  const Quagga: QuaggaStatic
  export default Quagga
}
