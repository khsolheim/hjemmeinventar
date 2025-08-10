// NextAuth.js API route for Next.js 15 App Router
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth'

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }
