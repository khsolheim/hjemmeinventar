// NextAuth.js v5 configuration
import { NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './db'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Validation schemas
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const authConfig = {
  adapter: PrismaAdapter(db), // Re-enable for proper database integration
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('🔍 NextAuth authorize called with:', { email: credentials?.email })
          console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')
          
          const validatedFields = signInSchema.safeParse(credentials)
          
          if (!validatedFields.success) {
            console.log('❌ Validation failed:', validatedFields.error)
            return null
          }
          
          const { email, password } = validatedFields.data
          console.log('✅ Fields validated, looking for user:', email)
          
          const user = await db.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              password: true
            }
          })
          
          if (!user) {
            console.log('❌ User not found:', email)
            return null
          }
          
          if (!user.password) {
            console.log('❌ User has no password:', email)
            return null
          }
          
          console.log('✅ User found, checking password')
          
          // Verify password
          const passwordsMatch = await bcrypt.compare(password, user.password)
          
          if (!passwordsMatch) {
            console.log('❌ Password mismatch for:', email)
            return null
          }
          
          console.log('✅ Authentication successful for:', email)
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image
          }
        } catch (error) {
          console.error('❌ Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
} satisfies NextAuthConfig

// Type definitions for enhanced session
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    }
  }
  
  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
  }
}

// declare module 'next-auth/jwt' {
//   interface JWT {
//     sub?: string
//   }
// }

// Export auth function for API routes
import NextAuth from 'next-auth'
export const { auth } = NextAuth(authConfig)
