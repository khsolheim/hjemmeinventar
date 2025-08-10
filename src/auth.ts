// NextAuth.js v5 configuration and export
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth'

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
