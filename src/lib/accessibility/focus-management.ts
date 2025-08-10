// Accessibility focus management utilities
import FocusLock from 'react-focus-lock'
import { LiveAnnouncer } from 'react-aria-live'

export { FocusLock }

// Create global announcer instance
export const announcer = new LiveAnnouncer()

// Utility for accessible route changes
export function announceRouteChange(routeName: string) {
  announcer.announce(`Navigert til ${routeName}`, 'polite')
}

// Utility for announcing status updates
export function announceStatus(message: string, priority: 'polite' | 'assertive' = 'polite') {
  announcer.announce(message, priority)
}

// Utility for announcing errors
export function announceError(message: string) {
  announcer.announce(message, 'assertive')
}

// Utility for announcing successful actions
export function announceSuccess(message: string) {
  announcer.announce(message, 'polite')
}

// Focus management utilities
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
  })
  
  // Focus first element initially
  firstElement?.focus()
}

// Restore focus helper
export function createFocusRestorer() {
  const previouslyFocused = document.activeElement as HTMLElement
  
  return () => {
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus()
    }
  }
}

// Skip to content functionality
export function skipToMainContent() {
  const mainContent = document.getElementById('main-content')
  if (mainContent) {
    mainContent.focus()
    mainContent.scrollIntoView()
  }
}

// Screen reader only text utility
export function createScreenReaderText(text: string): HTMLSpanElement {
  const span = document.createElement('span')
  span.textContent = text
  span.className = 'sr-only'
  span.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `
  return span
}
