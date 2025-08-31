// tRPC client configuration
'use client'

import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import superjson from 'superjson'
import type { AppRouter } from './root'

export const trpc = createTRPCReact<AppRouter>()

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return '' // browser should use relative url
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}` // SSR should use vercel url
  }
  return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
          // Don't retry on auth errors
          if (error?.data?.code === 'UNAUTHORIZED') return false
          // Don't retry on client errors (4xx)
          if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) return false
          return failureCount < 2
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        onError: (error: any) => {
          console.error('❌ tRPC Query Error:', error)
          if (error?.data?.code === 'UNAUTHORIZED') {
            console.log('🔒 Global auth error detected - stopping retries')
          }
        }
      },
      mutations: {
        retry: 1,
        onError: (error) => {
          console.error('❌ tRPC Mutation Error:', error)
        }
      }
    }
  }))

  const [trpcClient] = useState(() =>
    trpc.createClient({
      // transformer: superjson, // Temporarily disabled for debugging
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error)
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          fetch: (input, init) =>
            fetch(input as RequestInfo, { ...(init || {}), credentials: 'include' })
        })
      ]
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
