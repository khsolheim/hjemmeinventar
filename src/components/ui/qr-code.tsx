'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Printer } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

interface QRCodeProps {
  value: string
  size?: number
  title?: string
  description?: string
  showActions?: boolean
  className?: string
}

export function QRCode({ 
  value, 
  size = 200, 
  title, 
  description, 
  showActions = true,
  className = "" 
}: QRCodeProps) {
  const handleDownload = () => {
    const canvas = document.querySelector(`#qr-canvas-${CSS.escape(value)}`) as HTMLCanvasElement | null
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-code-${value}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR-kode: ${value}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh;
              }
              .qr-container { 
                text-align: center; 
                border: 2px solid #000; 
                padding: 20px; 
                margin: 20px;
                background: white;
              }
              .qr-code { 
                max-width: 100%; 
                height: auto; 
              }
              .qr-title { 
                font-size: 18px; 
                font-weight: bold; 
                margin: 10px 0 5px 0; 
              }
              .qr-description { 
                font-size: 14px; 
                color: #666; 
                margin: 5px 0 15px 0; 
              }
              .qr-value { 
                font-family: monospace; 
                font-size: 12px; 
                margin-top: 10px; 
                word-break: break-all;
              }
              @media print {
                body { padding: 0; }
                .qr-container { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              ${title ? `<div class="qr-title">${title}</div>` : ''}
              ${description ? `<div class="qr-description">${description}</div>` : ''}
              <img src="${(document.querySelector(`#qr-canvas-${CSS.escape(value)}`) as HTMLCanvasElement)?.toDataURL('image/png') || ''}" alt="QR Code" class="qr-code" />
              <div class="qr-value">${value}</div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  return (
    <div className={`qr-code-component ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="qr-image-container border-2 border-gray-200 rounded-lg p-4 bg-white">
          <QRCodeCanvas id={`qr-canvas-${value}`} value={value} size={size} includeMargin={true} level="M" />
        </div>
        
        <div className="text-center">
          <div className="font-mono text-sm text-muted-foreground break-all">
            {value}
          </div>
          {title && (
            <div className="font-medium mt-1">{title}</div>
          )}
          {description && (
            <div className="text-sm text-muted-foreground mt-1">{description}</div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Last ned
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Skriv ut
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Compact QR Code for inline display
export function QRCodeCompact({ value, size = 80 }: { value: string; size?: number }) {
  return (
    <div className="inline-block">
      <QRCodeCanvas value={value} size={size} includeMargin={true} level="M" className="border border-gray-200 rounded" />
    </div>
  )
}

// QR Code Card for dashboard/overview display
export function QRCodeCard({ 
  value, 
  title, 
  description, 
  onPrint, 
  onDownload,
  size = 120 
}: {
  value: string
  title: string
  description?: string
  onPrint?: () => void
  onDownload?: () => void
  size?: number
}) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="border-2 border-gray-200 rounded-lg p-3 bg-white">
            <QRCodeCanvas id={`qr-card-${title}-${value}`} value={value} size={size} includeMargin={true} level="M" />
          </div>
        </div>
        
        <div className="text-center text-sm font-mono text-muted-foreground">
          {value}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1" 
            onClick={onDownload || (() => {
              const canvas = document.querySelector(`#qr-card-${CSS.escape(title)}-${CSS.escape(value)}`) as HTMLCanvasElement | null
              if (!canvas) return
              const link = document.createElement('a')
              link.download = `${title}-qr.png`
              link.href = canvas.toDataURL('image/png')
              link.click()
            })}
          >
            <Download className="w-4 h-4 mr-2" />
            Last ned
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onPrint || (() => {
              const printWindow = window.open('', '_blank')
              if (printWindow) {
                printWindow.document.write(`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <title>QR-kode: ${title}</title>
                      <style>
                        body { 
                          margin: 0; 
                          padding: 20px; 
                          font-family: Arial, sans-serif; 
                          display: flex; 
                          justify-content: center; 
                          align-items: center; 
                          min-height: 100vh;
                        }
                        .label { 
                          text-align: center; 
                          border: 2px solid #000; 
                          padding: 20px; 
                          background: white;
                          max-width: 300px;
                        }
                        .qr-code { width: 150px; height: 150px; }
                        .title { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
                        .code { font-family: monospace; font-size: 10px; margin-top: 10px; }
                      </style>
                    </head>
                    <body>
                      <div class="label">
                        <div class="title">${title}</div>
                        <img src="${(document.querySelector(`#qr-card-${CSS.escape(title)}-${CSS.escape(value)}`) as HTMLCanvasElement)?.toDataURL('image/png') || ''}" alt="QR Code" class="qr-code" />
                        <div class="code">${value}</div>
                      </div>
                    </body>
                  </html>
                `)
                printWindow.document.close()
                setTimeout(() => {
                  printWindow.print()
                  printWindow.close()
                }, 250)
              }
            })}
          >
            <Printer className="w-4 h-4 mr-2" />
            Skriv ut
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
