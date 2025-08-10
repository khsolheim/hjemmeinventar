'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Upload, 
  X, 
  RotateCcw, 
  Check, 
  AlertCircle,
  Image as ImageIcon,
  Crop,
  Download,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface CameraCaptureProps {
  onImageCapture: (imageData: string | File) => void
  onError?: (error: string) => void
  maxImages?: number
  className?: string
  accept?: string
}

interface CapturedImage {
  id: string
  dataUrl: string
  file?: File
  timestamp: Date
}

export function CameraCapture({ 
  onImageCapture, 
  onError, 
  maxImages = 5,
  className = '',
  accept = 'image/*'
}: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [currentPreview, setCurrentPreview] = useState<CapturedImage | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check camera permission
  useEffect(() => {
    const checkCameraSupport = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false)
        return
      }
      
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        })
        testStream.getTracks().forEach(track => track.stop())
        setHasPermission(true)
      } catch (error) {
        setHasPermission(false)
      }
    }
    
    checkCameraSupport()
  }, [])

  // Start camera stream
  const startCamera = useCallback(async () => {
    if (!hasPermission) {
      toast.error('Kamera-tilgang ikke tilgjengelig')
      return
    }

    try {
      setIsStreaming(true)
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Prefer rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
    } catch (error) {
      console.error('Camera access error:', error)
      setIsStreaming(false)
      toast.error('Kunne ikke få tilgang til kameraet')
      onError?.('Kamera-feil')
    }
  }, [hasPermission, onError])

  // Stop camera stream
  const stopCamera = useCallback(() => {
    setIsStreaming(false)
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [stream])

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    
    // Create captured image object
    const newImage: CapturedImage = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: new Date()
    }

    // Add to captured images
    setCapturedImages(prev => {
      const updated = [newImage, ...prev]
      if (updated.length > maxImages) {
        return updated.slice(0, maxImages)
      }
      return updated
    })

    // Notify parent component
    onImageCapture(dataUrl)
    
    toast.success('Bilde tatt!')
  }, [maxImages, onImageCapture])

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    Array.from(files).slice(0, maxImages - capturedImages.length).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string
          if (dataUrl) {
            const newImage: CapturedImage = {
              id: Date.now().toString() + Math.random().toString(),
              dataUrl,
              file,
              timestamp: new Date()
            }

            setCapturedImages(prev => {
              const updated = [newImage, ...prev]
              if (updated.length > maxImages) {
                return updated.slice(0, maxImages)
              }
              return updated
            })

            onImageCapture(file)
          }
        }
        reader.readAsDataURL(file)
      }
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [maxImages, capturedImages.length, onImageCapture])

  // Delete captured image
  const deleteImage = useCallback((imageId: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== imageId))
    toast.success('Bilde slettet')
  }, [])

  // Preview image
  const previewImage = useCallback((image: CapturedImage) => {
    setCurrentPreview(image)
    setPreviewMode(true)
  }, [])

  // Download image
  const downloadImage = useCallback((image: CapturedImage) => {
    const link = document.createElement('a')
    link.href = image.dataUrl
    link.download = `item-image-${image.timestamp.getTime()}.jpg`
    link.click()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className={`camera-capture ${className}`}>
      {/* Main Interface */}
      {!previewMode && (
        <div className="space-y-6">
          {/* Camera Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Ta bilde med kamera
              </CardTitle>
              <CardDescription>
                {hasPermission === false 
                  ? 'Kamera ikke tilgjengelig - bruk fil-opplasting nedenfor'
                  : 'Bruk kameraet til å ta bilder av gjenstanden'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasPermission === false ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Kamera ikke tilgjengelig. Bruk fil-opplasting nedenfor.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {!isStreaming ? (
                    <div className="text-center py-8">
                      <div className="w-32 h-32 mx-auto border-4 border-dashed border-muted rounded-lg flex items-center justify-center mb-4">
                        <Camera className="w-16 h-16 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Trykk på knappen for å starte kameraet
                      </p>
                      <Button onClick={startCamera}>
                        <Camera className="w-4 h-4 mr-2" />
                        Start kamera
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative max-w-md mx-auto">
                        <video
                          ref={videoRef}
                          className="w-full border rounded-lg"
                          autoPlay
                          playsInline
                          muted
                        />
                        <canvas
                          ref={canvasRef}
                          className="hidden"
                        />
                        
                        {/* Camera controls overlay */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          <Button
                            size="lg"
                            onClick={capturePhoto}
                            className="rounded-full w-16 h-16 p-0"
                            disabled={capturedImages.length >= maxImages}
                          >
                            <Camera className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          {capturedImages.length >= maxImages ? 
                            `Maksimalt ${maxImages} bilder tillatt` :
                            `${capturedImages.length}/${maxImages} bilder tatt`
                          }
                        </p>
                        <Button variant="outline" onClick={stopCamera}>
                          <X className="w-4 h-4 mr-2" />
                          Stopp kamera
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Last opp fra fil
              </CardTitle>
              <CardDescription>
                Velg bilder fra enheten din
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Velg bilder</Label>
                  <Input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept={accept}
                    multiple
                    onChange={handleFileUpload}
                    disabled={capturedImages.length >= maxImages}
                  />
                </div>
                
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={capturedImages.length >= maxImages}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {capturedImages.length >= maxImages ? 
                      `Maksimalt ${maxImages} bilder` :
                      `Velg bilder (${capturedImages.length}/${maxImages})`
                    }
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Captured Images Grid */}
          {capturedImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Bilder ({capturedImages.length})
                </CardTitle>
                <CardDescription>
                  Klikk på et bilde for å se eller redigere det
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {capturedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div 
                        className="aspect-square border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => previewImage(image)}
                      >
                        <img
                          src={image.dataUrl}
                          alt={`Captured at ${image.timestamp.toLocaleTimeString()}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Image actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              downloadImage(image)
                            }}
                            className="w-8 h-8 p-0"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteImage(image.id)
                            }}
                            className="w-8 h-8 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Timestamp badge */}
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          {image.timestamp.toLocaleTimeString('no-NO', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewMode && currentPreview && (
        <Card className="fixed inset-4 z-50 bg-background shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Forhåndsvisning</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPreviewMode(false)
                setCurrentPreview(null)
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={currentPreview.dataUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
            
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => downloadImage(currentPreview)}
              >
                <Download className="w-4 h-4 mr-2" />
                Last ned
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteImage(currentPreview.id)
                  setPreviewMode(false)
                  setCurrentPreview(null)
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Slett
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Compact version for inline use in forms
export function CameraCaptureCompact({ 
  onImageCapture, 
  maxImages = 3 
}: { 
  onImageCapture: (imageUrl: string) => void  // Now expects uploaded URL instead of raw data
  maxImages?: number 
}) {
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      return result.url
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Kunne ikke laste opp bilde')
      return null
    }
  }, [])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    
    try {
      const filesToUpload = Array.from(files).slice(0, maxImages - capturedImages.length)
      
      for (const file of filesToUpload) {
        if (file.type.startsWith('image/')) {
          // Show preview immediately
          const reader = new FileReader()
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            if (dataUrl) {
              const newImage: CapturedImage = {
                id: Date.now().toString() + Math.random().toString(),
                dataUrl,
                file,
                timestamp: new Date()
              }
              setCapturedImages(prev => [newImage, ...prev].slice(0, maxImages))
            }
          }
          reader.readAsDataURL(file)

          // Upload in background
          const uploadedUrl = await uploadImage(file)
          if (uploadedUrl) {
            onImageCapture(uploadedUrl)
            toast.success('Bilde lastet opp!')
          }
        }
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [maxImages, capturedImages.length, onImageCapture, uploadImage])

  const deleteImage = useCallback((imageId: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== imageId))
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={capturedImages.length >= maxImages || uploading}
          className="flex-1"
        >
          <Camera className="w-4 h-4 mr-2" />
          {uploading ? 'Laster opp...' : 
           capturedImages.length === 0 ? 'Legg til bilder' : 
           `${capturedImages.length}/${maxImages} bilder`}
        </Button>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {capturedImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {capturedImages.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square border rounded overflow-hidden">
                <img
                  src={image.dataUrl}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => deleteImage(image.id)}
                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
