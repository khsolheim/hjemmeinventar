'use client'

import { Suspense, ComponentType, ReactNode, lazy } from 'react'

interface LazyWrapperProps {
  fallback?: ReactNode
  children: ReactNode
}

export function LazyWrapper({ 
  fallback = <div className="flex items-center justify-center p-8 text-muted-foreground">Laster...</div>, 
  children 
}: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

// Helper function for creating lazy components with default fallback
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T } | { [key: string]: T }>,
  componentName?: string
) {
  return lazy(() => 
    importFn().then(module => {
      // Handle both default exports and named exports
      if ('default' in module) {
        return { default: module.default as T }
      } else if (componentName && componentName in module) {
        return { default: module[componentName as keyof typeof module] as T }
      } else {
        // Fallback to first available export
        const firstKey = Object.keys(module)[0]
        return { default: module[firstKey as keyof typeof module] as T }
      }
    })
  )
}
