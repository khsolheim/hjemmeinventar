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
        refetchOnWindowFocus: false
      }
    }
  }))

  const [trpcClient] = useState(() =>
    trpc.createClient({
      // Remove superjson transformer temporarily to fix serialization issues
      // transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error)
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`
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
