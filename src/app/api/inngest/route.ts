import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import {
  dailyInventoryMaintenance,
  weeklyInventoryCleanup,
  onItemCreated,
  sendUserNotification
} from '@/lib/inngest/functions/inventory-jobs'
import {
  generateAnalytics,
  monthlyAnalyticsReport
} from '@/lib/inngest/functions/analytics-jobs'

// Create the Inngest serve handler with all our functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Scheduled functions
    dailyInventoryMaintenance,
    weeklyInventoryCleanup,
    monthlyAnalyticsReport,

    // Event-driven functions
    onItemCreated,
    sendUserNotification,
    generateAnalytics,
  ],
  
  // Configuration for Next.js App Router
  servePath: '/api/inngest',
  
  // Security settings
  signingKey: process.env.INNGEST_SIGNING_KEY,
  
  // Logging configuration
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
})

// Export named functions for Next.js App Router
export { GET, POST, PUT }
