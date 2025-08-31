'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CameraTestPage() {
  const [status, setStatus] = useState<string>('Ikke testet')
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const testBasicCamera = async () => {
    setStatus('Tester grunnleggende kamera...')
    setError(null)
    
    try {
      console.log('🔍 Testing basic camera access...')
      
      // Sjekk om MediaDevices API er tilgjengelig
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API ikke støttet')
      }
      
      console.log('✅ MediaDevices API available')
      
      // Test grunnleggende kamera-tilgang
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      })
      
      console.log('✅ Camera access successful:', mediaStream)
      
      setStream(mediaStream)
      setStatus('✅ Kamera fungerer!')
      
      // Vis video
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
      
    } catch (err: any) {
      console.error('❌ Camera test failed:', err)
      setError(err.message || 'Ukjent feil')
      setStatus('❌ Kamera-test feilet')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setStatus('Kamera stoppet')
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  const testEnumerateDevices = async () => {
    try {
      console.log('🔍 Enumerating devices...')
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      console.log('📹 Video devices found:', videoDevices)
      console.log('Total devices:', devices.length)
      
      setStatus(`Funnet ${videoDevices.length} kamera(er)`)
    } catch (err: any) {
      console.error('❌ Device enumeration failed:', err)
      setError(err.message)
    }
  }

  // Test ved lasting
  useEffect(() => {
    testEnumerateDevices()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Kamera-test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Status:</strong> {status}</p>
            {error && (
              <p className="text-red-500"><strong>Feil:</strong> {error}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={testBasicCamera} disabled={!!stream}>
              Test kamera
            </Button>
            <Button onClick={stopCamera} disabled={!stream} variant="outline">
              Stopp kamera
            </Button>
            <Button onClick={testEnumerateDevices} variant="outline">
              List enheter
            </Button>
          </div>

          {stream && (
            <div>
              <h3 className="font-semibold mb-2">Kamera-feed:</h3>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md border rounded"
              />
            </div>
          )}

          <div className="text-sm text-gray-600">
            <h3 className="font-semibold mb-2">Debug info:</h3>
            <ul className="space-y-1">
              <li>• Åpne Developer Console (F12) for detaljerte logger</li>
              <li>• URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</li>
              <li>• HTTPS: {typeof window !== 'undefined' ? (window.location.protocol === 'https:' ? '✅' : '❌') : 'N/A'}</li>
              <li>• User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
