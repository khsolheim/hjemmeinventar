"use client"

import { useState, useEffect } from 'react'

export function useCompactMode() {
  const [isCompact, setIsCompact] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved preference from localStorage
    const saved = localStorage.getItem('compact-mode')
    if (saved !== null) {
      const parsedValue = JSON.parse(saved)
      setIsCompact(parsedValue)
    }
  }, [])

  const setCompactMode = (compact: boolean) => {
    setIsCompact(compact)
    localStorage.setItem('compact-mode', JSON.stringify(compact))
    
    // Add/remove compact class from document
    if (compact) {
      document.documentElement.classList.add('compact')
    } else {
      document.documentElement.classList.remove('compact')
    }
  }

  // Apply initial compact class if needed
  useEffect(() => {
    if (mounted && isCompact) {
      document.documentElement.classList.add('compact')
    } else if (mounted && !isCompact) {
      document.documentElement.classList.remove('compact')
    }
  }, [isCompact, mounted])

  return { isCompact, setCompactMode }
}
