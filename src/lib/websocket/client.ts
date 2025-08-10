import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { 
  ServerToClientEvents, 
  ClientToServerEvents 
} from './server'

// Client-side socket instance
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export const initializeSocket = (token: string) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      auth: { token: { userId: token } },
      transports: ['websocket', 'polling'],
      autoConnect: false
    })

    socket.on('connect', () => {
      console.log('Connected to WebSocket server')
    })

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason)
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect manually
        socket?.connect()
      }
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      toast.error('Tilkoblingsfeil til live-tjenester')
    })
  }

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// React hook for using WebSocket
export function useSocket() {
  const { data: session, status } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Map<string, any>>(new Map())
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const socketInstance = initializeSocket(session.user.id)
      socketRef.current = socketInstance

      socketInstance.connect()

      // Set up event listeners
      socketInstance.on('connect', () => {
        setIsConnected(true)
      })

      socketInstance.on('disconnect', () => {
        setIsConnected(false)
      })

      // Handle user online/offline events
      socketInstance.on('user:online', ({ user, householdId }) => {
        setOnlineUsers(prev => {
          const updated = new Map(prev)
          updated.set(`${user.id}-${householdId}`, { ...user, householdId })
          return updated
        })
        
        toast.success(`${user.name || user.email} kom online`, {
          duration: 2000
        })
      })

      socketInstance.on('user:offline', ({ user, householdId }) => {
        setOnlineUsers(prev => {
          const updated = new Map(prev)
          updated.delete(`${user.id}-${householdId}`)
          return updated
        })
        
        toast.info(`${user.name || user.email} gikk offline`, {
          duration: 2000
        })
      })

      return () => {
        socketInstance.disconnect()
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [session, status])

  const joinHousehold = (householdId: string) => {
    socketRef.current?.emit('auth:join_household', householdId)
  }

  const leaveHousehold = (householdId: string) => {
    socketRef.current?.emit('auth:leave_household', householdId)
  }

  const startTyping = (context: string, householdId: string) => {
    socketRef.current?.emit('user:start_typing', { context, householdId })
  }

  const stopTyping = (context: string, householdId: string) => {
    socketRef.current?.emit('user:stop_typing', { context, householdId })
  }

  const viewPage = (page: string, householdId: string) => {
    socketRef.current?.emit('user:view_page', { page, householdId })
  }

  const startEditingForm = (formId: string, field: string, householdId: string) => {
    socketRef.current?.emit('form:start_editing', { formId, field, householdId })
  }

  const stopEditingForm = (formId: string, householdId: string) => {
    socketRef.current?.emit('form:stop_editing', { formId, householdId })
  }

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers: Array.from(onlineUsers.values()),
    joinHousehold,
    leaveHousehold,
    startTyping,
    stopTyping,
    viewPage,
    startEditingForm,
    stopEditingForm
  }
}

// Hook for listening to specific real-time events
export function useRealtimeEvents() {
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [liveEditing, setLiveEditing] = useState<Map<string, any>>(new Map())
  
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    // Item events
    const handleItemCreated = ({ item, householdId, createdBy }: any) => {
      setRecentActivities(prev => [{
        type: 'item_created',
        item,
        user: createdBy,
        householdId,
        timestamp: new Date()
      }, ...prev.slice(0, 49)]) // Keep last 50 activities
      
      toast.success(`${createdBy.name || createdBy.email} la til "${item.name}"`, {
        duration: 3000
      })
    }

    const handleItemUpdated = ({ item, householdId, updatedBy }: any) => {
      setRecentActivities(prev => [{
        type: 'item_updated',
        item,
        user: updatedBy,
        householdId,
        timestamp: new Date()
      }, ...prev.slice(0, 49)])
      
      toast.info(`${updatedBy.name || updatedBy.email} oppdaterte "${item.name}"`, {
        duration: 2000
      })
    }

    const handleItemDeleted = ({ itemId, householdId, deletedBy }: any) => {
      setRecentActivities(prev => [{
        type: 'item_deleted',
        itemId,
        user: deletedBy,
        householdId,
        timestamp: new Date()
      }, ...prev.slice(0, 49)])
      
      toast.warning(`${deletedBy.name || deletedBy.email} slettet en gjenstand`, {
        duration: 2000
      })
    }

    // Live collaboration events
    const handleFormEditing = ({ user, formId, field, householdId }: any) => {
      setLiveEditing(prev => {
        const updated = new Map(prev)
        updated.set(`${formId}-${field}`, { user, formId, field, householdId })
        return updated
      })
    }

    const handleFormStoppedEditing = ({ user, formId, householdId }: any) => {
      setLiveEditing(prev => {
        const updated = new Map(prev)
        // Remove all editing sessions for this form by this user
        for (const [key, value] of updated) {
          if (value.formId === formId && value.user.id === user.id) {
            updated.delete(key)
          }
        }
        return updated
      })
    }

    // Loan events
    const handleLoanCreated = ({ loan, householdId, createdBy }: any) => {
      setRecentActivities(prev => [{
        type: 'loan_created',
        loan,
        user: createdBy,
        householdId,
        timestamp: new Date()
      }, ...prev.slice(0, 49)])
      
      toast.info(`${createdBy.name || createdBy.email} lånte ut en gjenstand`, {
        duration: 2000
      })
    }

    const handleLoanReturned = ({ loan, householdId, returnedBy }: any) => {
      setRecentActivities(prev => [{
        type: 'loan_returned',
        loan,
        user: returnedBy,
        householdId,
        timestamp: new Date()
      }, ...prev.slice(0, 49)])
      
      toast.success(`${returnedBy.name || returnedBy.email} returnerte en gjenstand`, {
        duration: 2000
      })
    }

    // System events
    const handleSystemMaintenance = ({ message, timestamp }: any) => {
      toast.warning(`Systemvedlikehold: ${message}`, {
        duration: 5000
      })
    }

    // Register event listeners
    socket.on('item:created', handleItemCreated)
    socket.on('item:updated', handleItemUpdated)
    socket.on('item:deleted', handleItemDeleted)
    socket.on('form:editing', handleFormEditing)
    socket.on('form:stopped_editing', handleFormStoppedEditing)
    socket.on('loan:created', handleLoanCreated)
    socket.on('loan:returned', handleLoanReturned)
    socket.on('system:maintenance', handleSystemMaintenance)

    return () => {
      socket.off('item:created', handleItemCreated)
      socket.off('item:updated', handleItemUpdated)
      socket.off('item:deleted', handleItemDeleted)
      socket.off('form:editing', handleFormEditing)
      socket.off('form:stopped_editing', handleFormStoppedEditing)
      socket.off('loan:created', handleLoanCreated)
      socket.off('loan:returned', handleLoanReturned)
      socket.off('system:maintenance', handleSystemMaintenance)
    }
  }, [])

  return {
    recentActivities,
    liveEditing: Array.from(liveEditing.values())
  }
}

// Hook for typing indicators
export function useTypingIndicator(context: string, householdId: string) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [isTyping, setIsTyping] = useState(false)
  const { startTyping, stopTyping } = useSocket()
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleUserTyping = ({ user, householdId: eventHouseholdId, context: eventContext }: any) => {
      if (eventHouseholdId === householdId && eventContext === context) {
        setTypingUsers(prev => new Set([...prev, user.id]))
        
        // Remove after 3 seconds of no activity
        setTimeout(() => {
          setTypingUsers(prev => {
            const updated = new Set(prev)
            updated.delete(user.id)
            return updated
          })
        }, 3000)
      }
    }

    socket.on('user:typing', handleUserTyping)

    return () => {
      socket.off('user:typing', handleUserTyping)
    }
  }, [context, householdId])

  const handleStartTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      startTyping(context, householdId)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      stopTyping(context, householdId)
    }, 2000)
  }

  const handleStopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    setIsTyping(false)
    stopTyping(context, householdId)
  }

  return {
    typingUsers: Array.from(typingUsers),
    handleStartTyping,
    handleStopTyping
  }
}
