'use client'

import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc/client'

export default function TestSessionPage() {
  const { data: session, status } = useSession()
  const { data: labelSizes, error, isLoading } = trpc.labelSizes.getAll.useQuery()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Session Status:</h2>
          <p>Status: {status}</p>
          <p>User: {session?.user?.email || 'Not logged in'}</p>
          <p>User ID: {session?.user?.id || 'No ID'}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Label Sizes Test:</h2>
          {isLoading && <p>Loading...</p>}
          {error && (
            <div className="text-red-600">
              <p>Error: {error.message}</p>
              <p>Code: {error.data?.code}</p>
            </div>
          )}
          {labelSizes && (
            <div>
              <p>Found {labelSizes.length} label sizes</p>
              <ul>
                {labelSizes.map((size) => (
                  <li key={size.id}>
                    {size.name} ({size.widthMm}×{size.heightMm}mm)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
