"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps & { enableColorScheme?: boolean }) {
  // Default: do not set color-scheme to unngå SSR/CSR mismatch
  const { enableColorScheme = false, ...rest } = props as any
  return <NextThemesProvider enableColorScheme={enableColorScheme} {...(rest as any)}>{children}</NextThemesProvider>
}
