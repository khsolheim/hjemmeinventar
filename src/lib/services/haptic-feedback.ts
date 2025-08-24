export class HapticFeedbackService {
  private isSupported(): boolean {
    return typeof window !== 'undefined' && 'vibrate' in navigator
  }

  // Light haptic feedback for button presses
  light() {
    if (this.isSupported()) {
      navigator.vibrate(10)
    }
  }

  // Medium haptic feedback for important actions
  medium() {
    if (this.isSupported()) {
      navigator.vibrate(50)
    }
  }

  // Strong haptic feedback for critical actions
  strong() {
    if (this.isSupported()) {
      navigator.vibrate(100)
    }
  }

  // Pattern haptic feedback for complex interactions
  pattern(pattern: number[]) {
    if (this.isSupported()) {
      navigator.vibrate(pattern)
    }
  }

  // Success pattern
  success() {
    this.pattern([50, 10, 50])
  }

  // Error pattern
  error() {
    this.pattern([100, 50, 100])
  }

  // Warning pattern
  warning() {
    this.pattern([50, 50, 50])
  }

  // Scan success pattern
  scanSuccess() {
    this.pattern([25, 25, 25, 25])
  }

  // Add item success pattern
  addItemSuccess() {
    this.pattern([30, 10, 30, 10, 30])
  }

  // Navigation pattern
  navigation() {
    this.light()
  }

  // Selection pattern
  selection() {
    this.medium()
  }

  // Confirmation pattern
  confirmation() {
    this.success()
  }

  // Cancel pattern
  cancel() {
    this.error()
  }
}

// Singleton instance
export const hapticFeedback = new HapticFeedbackService()

// React hook for haptic feedback
export function useHapticFeedback() {
  return {
    light: () => hapticFeedback.light(),
    medium: () => hapticFeedback.medium(),
    strong: () => hapticFeedback.strong(),
    success: () => hapticFeedback.success(),
    error: () => hapticFeedback.error(),
    warning: () => hapticFeedback.warning(),
    scanSuccess: () => hapticFeedback.scanSuccess(),
    addItemSuccess: () => hapticFeedback.addItemSuccess(),
    navigation: () => hapticFeedback.navigation(),
    selection: () => hapticFeedback.selection(),
    confirmation: () => hapticFeedback.confirmation(),
    cancel: () => hapticFeedback.cancel(),
    isSupported: () => hapticFeedback.isSupported()
  }
}
