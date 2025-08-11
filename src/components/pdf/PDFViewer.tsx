'use client'

import { useState, useEffect, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  Maximize2,
  Minimize2,
  FileText,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PDFViewerProps {
  url: string
  title?: string
  className?: string
  height?: number
  defaultZoom?: number
  showControls?: boolean
  showDownload?: boolean
  onLoadSuccess?: (pdf: any) => void
  onLoadError?: (error: Error) => void
}

export function PDFViewer({
  url,
  title = "PDF Dokument",
  className = "",
  height = 600,
  defaultZoom = 1,
  showControls = true,
  showDownload = true,
  onLoadSuccess,
  onLoadError
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(defaultZoom)
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setIsLoading(false)
    setError(null)
    onLoadSuccess?.({ numPages })
  }

  function onDocumentLoadError(error: Error) {
    setIsLoading(false)
    setError(error.message)
    onLoadError?.(error)
  }

  const goToPrevPage = useCallback(() => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }, [])

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1))
  }, [numPages])

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.2, 3))
  }, [])

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }, [])

  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360)
  }, [])

  const resetView = useCallback(() => {
    setScale(defaultZoom)
    setRotation(0)
    setPageNumber(1)
  }, [defaultZoom])

  const downloadPDF = useCallback(() => {
    const link = document.createElement('a')
    link.href = url
    link.download = title || 'document.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [url, title])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.key) {
        case 'ArrowLeft':
          goToPrevPage()
          break
        case 'ArrowRight':
          goToNextPage()
          break
        case '+':
        case '=':
          event.preventDefault()
          zoomIn()
          break
        case '-':
          event.preventDefault()
          zoomOut()
          break
        case 'r':
          event.preventDefault()
          rotate()
          break
        case 'f':
          event.preventDefault()
          toggleFullscreen()
          break
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [goToPrevPage, goToNextPage, zoomIn, zoomOut, rotate, toggleFullscreen, isFullscreen])

  const containerClass = cn(
    "pdf-viewer",
    isFullscreen && "fixed inset-0 z-50 bg-background",
    className
  )

  const viewerHeight = isFullscreen ? '100vh' : height

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Kunne ikke laste PDF: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={containerClass}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {numPages && (
              <Badge variant="outline">
                Side {pageNumber} av {numPages}
              </Badge>
            )}
            
            {showDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={downloadPDF}
                title="Last ned PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Lukk fullskjerm" : "Åpne i fullskjerm"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="rounded-r-none"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-3 py-1 text-sm border-x min-w-[80px] text-center">
                {pageNumber} / {numPages || '?'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextPage}
                disabled={pageNumber >= (numPages || 1)}
                className="rounded-l-none"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className="rounded-r-none"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="px-3 py-1 text-sm border-x min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomIn}
                disabled={scale >= 3}
                className="rounded-l-none"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={rotate}
              title="Roter 90°"
            >
              <RotateCw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              title="Tilbakestill visning"
            >
              Tilbakestill
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div 
          className="pdf-container overflow-auto border-t"
          style={{ height: Number(viewerHeight) - 120 }}
        >
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Laster PDF...</p>
              </div>
            </div>
          )}

          <div className="flex justify-center p-4">
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              error=""
            >
              <Page 
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                loading={
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-96">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Kunne ikke laste side {pageNumber}
                      </AlertDescription>
                    </Alert>
                  </div>
                }
              />
            </Document>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Utility component for yarn pattern PDFs
export function YarnPatternViewer({ 
  patternUrl, 
  patternName,
  difficulty,
  yarnWeight,
  needleSize,
  ...props 
}: {
  patternUrl: string
  patternName: string
  difficulty?: string
  yarnWeight?: string
  needleSize?: string
} & Omit<PDFViewerProps, 'url' | 'title'>) {
  return (
    <div className="space-y-4">
      {/* Pattern Info */}
      {(difficulty || yarnWeight || needleSize) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold">Mønsterinformasjon</h3>
              <div className="flex items-center gap-2">
                {difficulty && (
                  <Badge variant="outline">
                    Vanskelighet: {difficulty}
                  </Badge>
                )}
                {yarnWeight && (
                  <Badge variant="outline">
                    Garntyngde: {yarnWeight}
                  </Badge>
                )}
                {needleSize && (
                  <Badge variant="outline">
                    Pinner: {needleSize}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Viewer */}
      <PDFViewer
        url={patternUrl}
        title={patternName}
        {...props}
      />
    </div>
  )
}
