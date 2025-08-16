'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function DebugAuth() {
  const [result, setResult] = useState<string>('')
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Check current session
    getSession().then(session => {
      setSession(session)
    })
  }, [])

  const testCredentialsAuth = async () => {
    setResult('Testing credentials auth...')
    
    try {
      const response = await signIn('credentials', {
        email: 'test@example.com',
        password: 'test123',
        redirect: false
      })
      
      console.log('SignIn response:', response)
      
      if (response?.error) {
        setResult(`❌ Error: ${response.error}`)
      } else if (response?.ok) {
        setResult('✅ Success! Checking session...')
        
        // Wait a moment then check session
        setTimeout(async () => {
          const newSession = await getSession()
          if (newSession) {
            setResult(`✅ Logged in as: ${newSession.user?.email}`)
            setSession(newSession)
          } else {
            setResult('⚠️ Sign in OK but no session found')
          }
        }, 1000)
      } else {
        setResult(`⚠️ Unknown response: ${JSON.stringify(response)}`)
      }
    } catch (error) {
      console.error('Auth error:', error)
      setResult(`❌ Exception: ${error}`)
    }
  }

  const testSessionCheck = async () => {
    try {
      const currentSession = await getSession()
      setSession(currentSession)
      if (currentSession) {
        setResult(`✅ Current session: ${currentSession.user?.email}`)
      } else {
        setResult('❌ No active session')
      }
    } catch (error) {
      setResult(`❌ Session check error: ${error}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🔍 NextAuth Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Current Session:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(session, null, 2) || 'No session'}
          </pre>
        </div>

        <div className="space-x-2">
          <button 
            onClick={testCredentialsAuth}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Credentials Login
          </button>
          
          <button 
            onClick={testSessionCheck}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Check Session
          </button>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Result:</h2>
          <div className="text-sm">{result || 'No test run yet'}</div>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Environment Info:</h2>
          <div className="text-sm space-y-1">
            <div>Node ENV: {process.env.NODE_ENV}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
