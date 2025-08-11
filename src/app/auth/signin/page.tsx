'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { toast } from 'sonner'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        toast.error('Ugyldig e-post eller passord')
      } else if (result?.ok) {
        toast.success('Velkommen tilbake!')
        // Wait a moment for session to be established, then redirect
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 500)
      } else {
        toast.error('Innlogging feilet. Prøv igjen.')
      }
    } catch (error) {
      toast.error('Noe gikk galt. Prøv igjen.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      toast.error('Kunne ikke logge inn med Google')
      setIsLoading(false)
    }
  }

  const handleTestLogin = async () => {
    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        email: 'test@example.com',
        password: 'test123',
        redirect: false
      })

      if (result?.error) {
        toast.error('Test innlogging feilet')
      } else if (result?.ok) {
        toast.success('Test bruker logget inn!')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 500)
      } else {
        toast.error('Test innlogging feilet. Prøv igjen.')
      }
    } catch (error) {
      toast.error('Noe gikk galt med test innlogging.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            🏠 Hjemmeinventar
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Logg inn for å administrere inventaret ditt
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Logg inn</CardTitle>
            <CardDescription>
              Logg inn på ditt hjemmeinventar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-describedby="email-error"
                  placeholder="din@epost.no"
                />
              </div>

              <div>
                <Label htmlFor="password">Passord</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-describedby="password-error"
                  placeholder="Ditt passord"
                />
              </div>

              <AccessibleButton
                type="submit"
                className="w-full"
                loading={isLoading}
                loadingText="Logger inn..."
                aria-label="Logg inn med e-post og passord"
              >
                Logg inn
              </AccessibleButton>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Eller</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  aria-label="Logg inn med Google"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Fortsett med Google
                </Button>
              </div>

              {/* Development Test Login Button */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
                    onClick={handleTestLogin}
                    disabled={isLoading}
                    aria-label="Logg inn som test bruker"
                  >
                    🧪 Test Innlogging
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Har du ikke konto?{' '}
                <a
                  href="/auth/signup"
                  className="font-medium text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                >
                  Registrer deg her
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
