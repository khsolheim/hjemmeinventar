import { Inngest } from 'inngest'

// Create the main Inngest client
export const inngest = new Inngest({ 
  id: 'hms',
  name: 'HMS Background Jobs',
  retries: 3,
  eventKey: process.env.INNGEST_EVENT_KEY,
  isDev: process.env.NODE_ENV === 'development'
})

// Event types for type safety
export type InngestEvents = {
  'inventory/item.created': {
    data: {
      itemId: string
      userId: string
      categoryId?: string
      locationId?: string
      expiryDate?: string
    }
  }
  'inventory/item.updated': {
    data: {
      itemId: string
      userId: string
      changes: Record<string, any>
      oldValues: Record<string, any>
    }
  }
  'inventory/item.deleted': {
    data: {
      itemId: string
      userId: string
    }
  }
  'inventory/loan.created': {
    data: {
      loanId: string
      itemId: string
      userId: string
      loanedTo: string
      expectedReturnDate: string
    }
  }
  'inventory/loan.overdue': {
    data: {
      loanId: string
      itemId: string
      userId: string
      daysOverdue: number
    }
  }
  'inventory/expiry.approaching': {
    data: {
      itemId: string
      userId: string
      expiryDate: string
      daysUntilExpiry: number
    }
  }
  'maintenance/daily': {
    data: {
      date: string
    }
  }
  'maintenance/weekly': {
    data: {
      date: string
      week: number
    }
  }
  'user/notification.send': {
    data: {
      userId: string
      type: 'expiry' | 'loan' | 'general'
      title: string
      message: string
      data?: any
    }
  }
  'analytics/generate': {
    data: {
      userId?: string
      type: 'daily' | 'weekly' | 'monthly'
      date: string
    }
  }
}

// Utility function to send events
export async function sendEvent<T extends keyof InngestEvents>(
  name: T,
  data: InngestEvents[T]['data']
) {
  try {
    const result = await inngest.send({
      name,
      data
    })
    console.log(`Event sent: ${name}`, result)
    return result
  } catch (error) {
    console.error(`Failed to send event: ${name}`, error)
    throw error
  }
}

// Batch event sending for efficiency
export async function sendEvents(
  events: Array<{
    name: keyof InngestEvents
    data: any
  }>
) {
  try {
    const result = await inngest.send(events)
    console.log(`Batch events sent: ${events.length}`, result)
    return result
  } catch (error) {
    console.error(`Failed to send batch events`, error)
    throw error
  }
}

// Helper to create type-safe event data
export function createEvent<T extends keyof InngestEvents>(
  name: T,
  data: InngestEvents[T]['data']
): { name: T; data: InngestEvents[T]['data'] } {
  return { name, data }
}
