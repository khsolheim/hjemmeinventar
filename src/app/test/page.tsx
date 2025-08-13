'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  const [formData, setFormData] = useState({
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpassword123'
  })
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<any>(null)

  // Test endpoint
  const testQuery = trpc.users.test.useQuery()
  
  // Register mutation
  const registerMutation = trpc.users.register.useMutation({
    onSuccess: (data) => {
      setResult(data)
      setError(null)
      console.log('Success:', data)
    },
    onError: (error) => {
      setError(error)
      setResult(null)
      console.error('Error:', error)
    }
  })

  const handleSubmit = () => {
    registerMutation.mutate(formData)
  }

  return (
    <div className="page cq container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Brukerregistrering (Uten Superjson)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Query Result */}
          <div>
            <h3 className="font-medium">Test Query:</h3>
            <p className="text-sm text-muted-foreground">
              {testQuery.isLoading ? 'Loading...' : JSON.stringify(testQuery.data)}
            </p>
          </div>

          {/* Form */}
          <div>
            <Label htmlFor="name">Navn</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="password">Passord</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={registerMutation.isPending}
            className="w-full"
          >
            {registerMutation.isPending ? 'Registrerer...' : 'Test Registrering'}
          </Button>

          {/* Results */}
          {result && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-medium text-green-800">Suksess:</h4>
              <pre className="text-xs text-green-700">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <h4 className="font-medium text-red-800">Feil:</h4>
              <pre className="text-xs text-red-700">{JSON.stringify(error, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
