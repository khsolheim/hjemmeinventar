'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  Camera,
  CameraOff,
  Image,
  ImageOff,
  QrCode,
  Scan,
  Upload,
  Download,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Star,
  Award,
  Trophy,
  Crown,
  Rocket,
  Sparkles,
  Camera as Photo,
  CameraOff as Disabled,
  Image as Picture,
  ImageOff as NoImage,
  QrCode as QR,
  Scan as Scanner,
  Upload as Import,
  Download as Export,
  Settings as Config,
  RefreshCw as Update,
  CheckCircle as Success,
  XCircle as Error,
  AlertTriangle as Warning,
  Info as Details,
  Star as Favorite,
  Award as Prize,
  Trophy as Victory,
  Crown as King,
  Rocket as Launch,
  Sparkles as Magic,
  Camera as Capture,
  CameraOff as Stop,
  Image as Gallery,
  ImageOff as Empty,
  QrCode as Code,
  Scan as Detect,
  Upload as Send,
  Download as Get,
  Settings as Setup,
  RefreshCw as Reload,
  CheckCircle as Done,
  XCircle as Fail,
  AlertTriangle as Notice,
  Info as Help,
  Star as Rate,
  Award as Win,
  Trophy as Success,
  Crown as Leader,
  Rocket as Boost,
  Sparkles as Shine,
  Eye,
  Search,
  Tag,
  Filter,
  Trash2,
  Edit,
  Share2,
  Heart,
  Bookmark,
  Calendar,
  MapPin,
  BarChart3
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedCameraProps {
  className?: string
}

export function AdvancedCamera({ className }: AdvancedCameraProps) {
  const [selectedTab, setSelectedTab] = useState<'camera' | 'recognition' | 'qr' | 'gallery'>('camera')
  const [isCapturing, setIsCapturing] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [scannedQR, setScannedQR] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const haptic = useHapticFeedback()

  // Camera queries
  const cameraQuery = trpc.camera.getCameraStatus.useQuery()
  const recognitionQuery = trpc.camera.getImageRecognition.useQuery()
  const qrQuery = trpc.camera.getQRScans.useQuery()
  const galleryQuery = trpc.camera.getPhotoGallery.useQuery()

  const captureImageMutation = trpc.camera.captureImage.useMutation()
  const recognizeImageMutation = trpc.camera.recognizeImage.useMutation()
  const scanQRMutation = trpc.camera.scanQR.useMutation()
  const updateSettingsMutation = trpc.camera.updateSettings.useMutation()

  useEffect(() => {
    // Initialize camera
    if (cameraEnabled && selectedTab === 'camera') {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [cameraEnabled, selectedTab])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Failed to start camera:', error)
      haptic.error()
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      setIsCapturing(true)
      haptic.success()

      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)

        const imageData = canvas.toDataURL('image/jpeg')
        setCapturedImage(imageData)

        // Process captured image
        const result = await captureImageMutation.mutateAsync({ imageData })
        
        if (result.success) {
          haptic.success()
        }
      }
    } catch (error) {
      console.error('Failed to capture image:', error)
      haptic.error()
    } finally {
      setIsCapturing(false)
    }
  }

  const recognizeImage = async (imageData: string) => {
    try {
      const result = await recognizeImageMutation.mutateAsync({ imageData })
      
      if (result.success) {
        haptic.success()
        return result.recognition
      } else {
        haptic.error()
        return null
      }
    } catch (error) {
      console.error('Failed to recognize image:', error)
      haptic.error()
      return null
    }
  }

  const scanQRCode = async () => {
    try {
      setIsScanning(true)
      haptic.selection()

      // Simulate QR scanning
      const result = await scanQRMutation.mutateAsync()
      
      if (result.success) {
        setScannedQR(result.qrData)
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to scan QR code:', error)
      haptic.error()
    } finally {
      setIsScanning(false)
    }
  }

  const handleToggleCamera = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ cameraEnabled: enabled })
      setCameraEnabled(enabled)
      if (!enabled) {
        stopCamera()
      }
    } catch (error) {
      console.error('Failed to toggle camera:', error)
    }
  }

  const getCameraStatus = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-green-600', label: 'Aktiv', icon: Camera }
      case 'inactive': return { color: 'text-red-600', label: 'Inaktiv', icon: CameraOff }
      case 'capturing': return { color: 'text-yellow-600', label: 'Kapturerer', icon: Camera }
      default: return { color: 'text-gray-600', label: 'Ukjent', icon: AlertTriangle }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Camera</h2>
          <p className="text-muted-foreground">
            Image recognition, QR scanning og photo management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Camera className="w-3 h-3" />
            Camera Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            AI Vision
          </Badge>
        </div>
      </div>

      {/* Camera Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Camera Status</CardTitle>
            <Camera className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {cameraEnabled ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {getCameraStatus(cameraEnabled ? 'active' : 'inactive').label}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Photos</CardTitle>
            <Image className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {galleryQuery.data?.totalPhotos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Captured images
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recognition</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {recognitionQuery.data?.accuracy || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Recognition accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
            <QrCode className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {qrQuery.data?.totalScans || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              QR codes scanned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'camera' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('camera')}
          className="flex-1"
        >
          <Camera className="w-4 h-4 mr-2" />
          Camera
        </Button>
        <Button
          variant={selectedTab === 'recognition' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('recognition')}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          Recognition
        </Button>
        <Button
          variant={selectedTab === 'qr' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('qr')}
          className="flex-1"
        >
          <QrCode className="w-4 h-4 mr-2" />
          QR Scan
        </Button>
        <Button
          variant={selectedTab === 'gallery' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('gallery')}
          className="flex-1"
        >
          <Image className="w-4 h-4 mr-2" />
          Gallery
        </Button>
      </div>

      {/* Camera Tab */}
      {selectedTab === 'camera' && (
        <div className="space-y-4">
          {/* Camera Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Camera Interface
              </CardTitle>
              <CardDescription>
                Capture images og video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Video Preview */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {cameraEnabled ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <CameraOff className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Camera Controls */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                    <Button
                      size="lg"
                      variant={isCapturing ? 'destructive' : 'default'}
                      onClick={captureImage}
                      disabled={!cameraEnabled || isCapturing}
                      className="w-16 h-16 rounded-full"
                    >
                      {isCapturing ? (
                        <RefreshCw className="w-8 h-8 animate-spin" />
                      ) : (
                        <Camera className="w-8 h-8" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Captured Image */}
                {capturedImage && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Captured Image</label>
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button size="sm" variant="secondary">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Camera Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <Camera className="w-5 h-5" />
                    <span className="text-sm">Capture</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">Upload</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <Settings className="w-5 h-5" />
                    <span className="text-sm">Settings</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <RefreshCw className="w-5 h-5" />
                    <span className="text-sm">Refresh</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Camera Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Camera Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cameraQuery.data?.cameraStatus?.map((status) => (
                  <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Camera className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{status.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {status.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{status.status}</div>
                        <div className="text-xs text-muted-foreground">
                          {status.lastUpdate}
                        </div>
                      </div>
                      
                      <Badge variant={status.isActive ? 'default' : 'secondary'}>
                        {status.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recognition Tab */}
      {selectedTab === 'recognition' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Image Recognition
              </CardTitle>
              <CardDescription>
                AI-powered image recognition og analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recognitionQuery.data?.recognitions?.map((recognition) => (
                  <div key={recognition.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Eye className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{recognition.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {recognition.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{recognition.confidence}%</div>
                        <div className="text-xs text-muted-foreground">
                          {recognition.category}
                        </div>
                      </div>
                      
                      <Badge variant={recognition.confidence > 80 ? 'default' : 'secondary'}>
                        {recognition.confidence > 80 ? 'High' : 'Medium'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recognition Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Recognition Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recognitionQuery.data?.categories?.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <category.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.count} items
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QR Scan Tab */}
      {selectedTab === 'qr' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code Scanner
              </CardTitle>
              <CardDescription>
                Scan QR codes og barcodes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* QR Scanner Interface */}
                <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                  {cameraEnabled ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <QrCode className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* QR Scanner Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                    </div>
                  </div>

                  {/* Scan Button */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <Button
                      size="lg"
                      variant={isScanning ? 'destructive' : 'default'}
                      onClick={scanQRCode}
                      disabled={!cameraEnabled || isScanning}
                      className="w-16 h-16 rounded-full"
                    >
                      {isScanning ? (
                        <RefreshCw className="w-8 h-8 animate-spin" />
                      ) : (
                        <Scan className="w-8 h-8" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Scanned QR Result */}
                {scannedQR && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Scanned QR Code</label>
                    <div className="p-4 border rounded-lg bg-muted">
                      <div className="font-medium">{scannedQR}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        QR code detected successfully
                      </div>
                    </div>
                  </div>
                )}

                {/* QR Scan History */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recent Scans</label>
                  <div className="space-y-2">
                    {qrQuery.data?.recentScans?.map((scan) => (
                      <div key={scan.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <QrCode className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{scan.data}</div>
                            <div className="text-sm text-muted-foreground">
                              {scan.timestamp}
                            </div>
                          </div>
                        </div>
                        
                        <Badge variant={scan.type === 'QR' ? 'default' : 'secondary'}>
                          {scan.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gallery Tab */}
      {selectedTab === 'gallery' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Photo Gallery
              </CardTitle>
              <CardDescription>
                Manage captured images og photos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {galleryQuery.data?.photos?.map((photo) => (
                  <div key={photo.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{photo.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {photo.size} • {photo.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{photo.category}</div>
                        <div className="text-xs text-muted-foreground">
                          {photo.tags.join(', ')}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gallery Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Gallery Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryQuery.data?.stats?.map((stat) => (
                  <div key={stat.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <stat.icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="font-medium">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Raske handlinger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Camera className="w-5 h-5" />
              <span className="text-sm">Take Photo</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <QrCode className="w-5 h-5" />
              <span className="text-sm">Scan QR</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm">Recognize</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Image className="w-5 h-5" />
              <span className="text-sm">Gallery</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
