'use client'

import { useSession } from 'next-auth/react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function DebugSessionPage() {
  const { data: session, status } = useSession()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Session Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Session Status</h2>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Session exists:</strong> {session ? 'Yes' : 'No'}</p>
          {session?.user && (
            <div className="mt-2">
              <p><strong>User ID:</strong> {session.user.id}</p>
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>Name:</strong> {session.user.name}</p>
            </div>
          )}
        </div>

        {!session && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="text-lg font-medium text-red-800 mb-2">❌ Ikke logget inn</h3>
            <p className="text-red-700 mb-4">
              Du må logge inn for at YarnWizard skal fungere. Dette er årsaken til feilene du ser.
            </p>
            <Button
              onClick={() => signIn('credentials', { 
                email: 'test@example.com',
                password: 'test123',
                callbackUrl: '/garn/register'
              })}
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
            >
              🧪 Test Innlogging
            </Button>
          </div>
        )}

        {session && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="text-lg font-medium text-green-800 mb-2">✅ Logget inn</h3>
            <p className="text-green-700 mb-4">
              Perfekt! Nå kan du bruke YarnWizard uten problemer.
            </p>
            <Button asChild>
              <a href="/garn/register">Gå til YarnWizard</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
