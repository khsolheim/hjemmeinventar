import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface SocketUser {
  id: string
  name: string | null
  email: string
  householdIds: string[]
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser
}

export interface ServerToClientEvents {
  // Item events
  'item:created': (data: { item: any; householdId: string; createdBy: SocketUser }) => void
  'item:updated': (data: { item: any; householdId: string; updatedBy: SocketUser }) => void
  'item:deleted': (data: { itemId: string; householdId: string; deletedBy: SocketUser }) => void
  'item:moved': (data: { itemId: string; oldLocationId: string; newLocationId: string; householdId: string; movedBy: SocketUser }) => void

  // Location events
  'location:created': (data: { location: any; householdId: string; createdBy: SocketUser }) => void
  'location:updated': (data: { location: any; householdId: string; updatedBy: SocketUser }) => void
  'location:deleted': (data: { locationId: string; householdId: string; deletedBy: SocketUser }) => void

  // Loan events
  'loan:created': (data: { loan: any; householdId: string; createdBy: SocketUser }) => void
  'loan:returned': (data: { loan: any; householdId: string; returnedBy: SocketUser }) => void
  'loan:updated': (data: { loan: any; householdId: string; updatedBy: SocketUser }) => void

  // User activity events
  'user:online': (data: { user: SocketUser; householdId: string }) => void
  'user:offline': (data: { user: SocketUser; householdId: string }) => void
  'user:typing': (data: { user: SocketUser; householdId: string; context: string }) => void

  // Live collaboration events
  'page:view': (data: { user: SocketUser; page: string; householdId: string }) => void
  'form:editing': (data: { user: SocketUser; formId: string; field: string; householdId: string }) => void
  'form:stopped_editing': (data: { user: SocketUser; formId: string; householdId: string }) => void

  // System events
  'notification:new': (data: { title: string; message: string; type: string; householdId: string }) => void
  'system:maintenance': (data: { message: string; timestamp: Date }) => void
}

export interface ClientToServerEvents {
  // Authentication
  'auth:join_household': (householdId: string) => void
  'auth:leave_household': (householdId: string) => void

  // User activity
  'user:start_typing': (data: { context: string; householdId: string }) => void
  'user:stop_typing': (data: { context: string; householdId: string }) => void
  'user:view_page': (data: { page: string; householdId: string }) => void

  // Live collaboration
  'form:start_editing': (data: { formId: string; field: string; householdId: string }) => void
  'form:stop_editing': (data: { formId: string; householdId: string }) => void
  'form:field_changed': (data: { formId: string; field: string; value: any; householdId: string }) => void

  // Manual sync requests
  'sync:request_full': (householdId: string) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  user: SocketUser
  householdIds: string[]
}

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

export const initSocket = (httpServer: HTTPServer) => {
  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
  })

  // Middleware for authentication
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const { token } = socket.handshake.auth
      
      if (!token) {
        return next(new Error('Authentication error'))
      }

      // In a real implementation, you'd verify the JWT token here
      // For this example, we'll simulate token verification
      const userId = token.userId
      
      if (!userId) {
        return next(new Error('Invalid token'))
      }

      // Get user and their households
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          households: {
            include: {
              household: true
            }
          }
        }
      })

      if (!user) {
        return next(new Error('User not found'))
      }

      socket.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        householdIds: user.households.map(h => h.householdId)
      }

      next()
    } catch (error) {
      console.error('Socket authentication error:', error)
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    if (!socket.user) return

    console.log(`User ${socket.user.email} connected`)

    // Join user to their household rooms
    socket.user.householdIds.forEach(householdId => {
      socket.join(`household:${householdId}`)
      
      // Notify others that user is online
      socket.to(`household:${householdId}`).emit('user:online', {
        user: socket.user!,
        householdId
      })
    })

    // Handle household-specific events
    socket.on('auth:join_household', async (householdId) => {
      if (!socket.user) return

      // Verify user has access to this household
      const membership = await db.householdMember.findFirst({
        where: {
          userId: socket.user.id,
          householdId
        }
      })

      if (membership) {
        socket.join(`household:${householdId}`)
        socket.to(`household:${householdId}`).emit('user:online', {
          user: socket.user,
          householdId
        })
        console.log(`User ${socket.user.email} joined household ${householdId}`)
      }
    })

    socket.on('auth:leave_household', (householdId) => {
      if (!socket.user) return

      socket.leave(`household:${householdId}`)
      socket.to(`household:${householdId}`).emit('user:offline', {
        user: socket.user,
        householdId
      })
      console.log(`User ${socket.user.email} left household ${householdId}`)
    })

    // Typing indicators
    socket.on('user:start_typing', ({ context, householdId }) => {
      if (!socket.user) return

      socket.to(`household:${householdId}`).emit('user:typing', {
        user: socket.user,
        householdId,
        context
      })
    })

    socket.on('user:stop_typing', ({ context, householdId }) => {
      if (!socket.user) return

      // For stop typing, we might want to emit a specific event or just let it timeout
      // This is a simple implementation
    })

    // Page viewing tracking
    socket.on('user:view_page', ({ page, householdId }) => {
      if (!socket.user) return

      socket.to(`household:${householdId}`).emit('page:view', {
        user: socket.user,
        page,
        householdId
      })
    })

    // Live form collaboration
    socket.on('form:start_editing', ({ formId, field, householdId }) => {
      if (!socket.user) return

      socket.to(`household:${householdId}`).emit('form:editing', {
        user: socket.user,
        formId,
        field,
        householdId
      })
    })

    socket.on('form:stop_editing', ({ formId, householdId }) => {
      if (!socket.user) return

      socket.to(`household:${householdId}`).emit('form:stopped_editing', {
        user: socket.user,
        formId,
        householdId
      })
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      if (!socket.user) return

      console.log(`User ${socket.user.email} disconnected`)

      // Notify all households that user is offline
      socket.user.householdIds.forEach(householdId => {
        socket.to(`household:${householdId}`).emit('user:offline', {
          user: socket.user!,
          householdId
        })
      })
    })
  })

  return io
}

export const getSocket = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized')
  }
  return io
}

// Helper functions to emit events from other parts of the application
export const emitToHousehold = (householdId: string, event: keyof ServerToClientEvents, data: any) => {
  if (io) {
    io.to(`household:${householdId}`).emit(event, data)
  }
}

export const emitToUser = (userId: string, event: keyof ServerToClientEvents, data: any) => {
  if (io) {
    // Find all sockets for this user and emit to them
    for (const [socketId, socket] of io.sockets.sockets) {
      const authSocket = socket as AuthenticatedSocket
      if (authSocket.user?.id === userId) {
        authSocket.emit(event, data)
      }
    }
  }
}

export const broadcastSystemMessage = (message: string) => {
  if (io) {
    io.emit('system:maintenance', {
      message,
      timestamp: new Date()
    })
  }
}
