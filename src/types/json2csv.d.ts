declare module 'json2csv' {
  export interface ParseOptions {
    delimiter?: string
    quote?: string
    escape?: string
    header?: boolean
    fields?: string[]
  }

  export class Parser {
    constructor(options?: ParseOptions)
    parse(data: any[]): string
  }
}
