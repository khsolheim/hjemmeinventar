import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const iotRouter = createTRPCRouter({
  // Get IoT devices
  getDevices: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's IoT devices
        const devices = await ctx.db.iotDevice.findMany({
          where: { userId },
          orderBy: { name: 'asc' }
        })

        return devices.map(device => ({
          id: device.id,
          name: device.name,
          type: device.type,
          location: device.location,
          connectionType: device.connectionType,
          status: device.status,
          enabled: device.enabled,
          lastSeen: device.lastSeen,
          batteryLevel: device.batteryLevel
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente IoT-enheter'
        })
      }
    }),

  // Get IoT sensors
  getSensors: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's IoT sensors
        const sensors = await ctx.db.iotSensor.findMany({
          where: { userId },
          orderBy: { name: 'asc' }
        })

        return sensors.map(sensor => ({
          id: sensor.id,
          name: sensor.name,
          type: sensor.type,
          currentValue: sensor.currentValue,
          unit: sensor.unit,
          batteryLevel: sensor.batteryLevel,
          lastUpdate: sensor.lastUpdate,
          trend: sensor.trend,
          trendValue: sensor.trendValue,
          location: sensor.location
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente IoT-sensorer'
        })
      }
    }),

  // Get wearables
  getWearables: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's wearables
        const wearables = await ctx.db.wearable.findMany({
          where: { userId },
          orderBy: { name: 'asc' }
        })

        return wearables.map(wearable => ({
          id: wearable.id,
          name: wearable.name,
          type: wearable.type,
          brand: wearable.brand,
          status: wearable.status,
          batteryLevel: wearable.batteryLevel,
          steps: wearable.steps,
          heartRate: wearable.heartRate,
          lastSync: wearable.lastSync
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente wearables'
        })
      }
    }),

  // Get IoT automations
  getAutomations: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's IoT automations
        const automations = await ctx.db.iotAutomation.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })

        return automations.map(automation => ({
          id: automation.id,
          name: automation.name,
          description: automation.description,
          enabled: automation.enabled,
          triggerCount: automation.triggerCount,
          lastTriggered: automation.lastTriggered,
          trigger: automation.trigger,
          actions: automation.actions
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente IoT-automatiseringer'
        })
      }
    }),

  // Add IoT device
  addDevice: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.string(),
      location: z.string(),
      connectionType: z.enum(['wifi', 'bluetooth', 'zigbee', 'z-wave']),
      deviceId: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        const device = await ctx.db.iotDevice.create({
          data: {
            name: input.name,
            type: input.type,
            location: input.location,
            connectionType: input.connectionType,
            status: 'connecting',
            enabled: true,
            deviceId: input.deviceId,
            userId
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'IOT_DEVICE_ADDED',
            description: `La til IoT-enhet: ${input.name}`,
            userId,
            metadata: {
              deviceId: device.id,
              deviceType: input.type,
              connectionType: input.connectionType
            }
          }
        })

        return device
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke legge til IoT-enhet'
        })
      }
    }),

  // Toggle IoT device
  toggleDevice: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
      enabled: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Verify user owns the device
        const device = await ctx.db.iotDevice.findFirst({
          where: {
            id: input.deviceId,
            userId
          }
        })

        if (!device) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'IoT-enhet ikke funnet'
          })
        }

        // Update device status
        const updatedDevice = await ctx.db.iotDevice.update({
          where: { id: input.deviceId },
          data: { 
            enabled: input.enabled,
            status: input.enabled ? 'online' : 'offline'
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'IOT_DEVICE_TOGGLED',
            description: `${input.enabled ? 'Aktivert' : 'Deaktivert'} ${device.name}`,
            userId,
            metadata: {
              deviceId: device.id,
              deviceName: device.name,
              newStatus: input.enabled
            }
          }
        })

        return updatedDevice
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke endre IoT-enhet-status'
        })
      }
    }),

  // Update sensor data
  updateSensor: protectedProcedure
    .input(z.object({
      sensorId: z.string(),
      data: z.object({
        currentValue: z.number(),
        trend: z.string().optional(),
        trendValue: z.number().optional(),
        batteryLevel: z.number().optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Verify user owns the sensor
        const sensor = await ctx.db.iotSensor.findFirst({
          where: {
            id: input.sensorId,
            userId
          }
        })

        if (!sensor) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'IoT-sensor ikke funnet'
          })
        }

        // Update sensor data
        const updatedSensor = await ctx.db.iotSensor.update({
          where: { id: input.sensorId },
          data: {
            currentValue: input.data.currentValue,
            trend: input.data.trend,
            trendValue: input.data.trendValue,
            batteryLevel: input.data.batteryLevel,
            lastUpdate: new Date()
          }
        })

        // Log activity if significant change
        if (Math.abs(input.data.currentValue - sensor.currentValue) > 5) {
          await ctx.db.activity.create({
            data: {
              type: 'SENSOR_DATA_UPDATED',
              description: `${sensor.name} verdi endret til ${input.data.currentValue} ${sensor.unit}`,
              userId,
              metadata: {
                sensorId: sensor.id,
                sensorName: sensor.name,
                oldValue: sensor.currentValue,
                newValue: input.data.currentValue
              }
            }
          })
        }

        return updatedSensor
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke oppdatere sensor-data'
        })
      }
    }),

  // Sync wearable data
  syncWearable: protectedProcedure
    .input(z.object({
      wearableId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Verify user owns the wearable
        const wearable = await ctx.db.wearable.findFirst({
          where: {
            id: input.wearableId,
            userId
          }
        })

        if (!wearable) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Wearable ikke funnet'
          })
        }

        // Simulate data sync
        const updatedWearable = await ctx.db.wearable.update({
          where: { id: input.wearableId },
          data: {
            steps: Math.floor(Math.random() * 10000) + 1000,
            heartRate: Math.floor(Math.random() * 40) + 60,
            lastSync: new Date(),
            batteryLevel: Math.floor(Math.random() * 30) + 70
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'WEARABLE_SYNCED',
            description: `Synkroniserte data fra ${wearable.name}`,
            userId,
            metadata: {
              wearableId: wearable.id,
              wearableName: wearable.name,
              steps: updatedWearable.steps,
              heartRate: updatedWearable.heartRate
            }
          }
        })

        return updatedWearable
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke synkronisere wearable'
        })
      }
    }),

  // Create IoT automation
  createAutomation: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      trigger: z.object({
        type: z.string(),
        conditions: z.any()
      }),
      actions: z.array(z.object({
        type: z.string(),
        deviceId: z.string().optional(),
        parameters: z.any()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        const automation = await ctx.db.iotAutomation.create({
          data: {
            name: input.name,
            description: input.description,
            trigger: input.trigger,
            actions: input.actions,
            enabled: true,
            triggerCount: 0,
            userId
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'IOT_AUTOMATION_CREATED',
            description: `Opprettet IoT-automatisering: ${input.name}`,
            userId,
            metadata: {
              automationId: automation.id,
              triggerType: input.trigger.type
            }
          }
        })

        return automation
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke opprette IoT-automatisering'
        })
      }
    }),

  // Get IoT statistics
  getIoTStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get IoT statistics
        const [devices, sensors, wearables, automations] = await Promise.all([
          ctx.db.iotDevice.count({ where: { userId } }),
          ctx.db.iotSensor.count({ where: { userId } }),
          ctx.db.wearable.count({ where: { userId } }),
          ctx.db.iotAutomation.count({ where: { userId } })
        ])

        // Get online devices
        const onlineDevices = await ctx.db.iotDevice.count({
          where: {
            userId,
            status: 'online'
          }
        })

        // Calculate IoT score
        const iotScore = calculateIoTScore(devices, sensors, wearables, automations, onlineDevices)

        return {
          totalDevices: devices,
          totalSensors: sensors,
          totalWearables: wearables,
          totalAutomations: automations,
          onlineDevices,
          iotScore,
          connectivity: Math.round((onlineDevices / devices) * 100) || 0
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente IoT-statistikk'
        })
      }
    }),

  // Search for nearby devices
  searchDevices: protectedProcedure
    .input(z.object({
      connectionType: z.enum(['wifi', 'bluetooth', 'zigbee', 'z-wave']).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Simulate device discovery
        const discoveredDevices = [
          {
            id: 'discovered-1',
            name: 'Smart Light Bulb',
            type: 'light',
            connectionType: 'wifi',
            signalStrength: 85
          },
          {
            id: 'discovered-2',
            name: 'Temperature Sensor',
            type: 'temperature_sensor',
            connectionType: 'bluetooth',
            signalStrength: 72
          },
          {
            id: 'discovered-3',
            name: 'Smart Plug',
            type: 'plug',
            connectionType: 'wifi',
            signalStrength: 91
          }
        ]

        // Filter by connection type if specified
        const filteredDevices = input.connectionType 
          ? discoveredDevices.filter(device => device.connectionType === input.connectionType)
          : discoveredDevices

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'IOT_DEVICE_SEARCH',
            description: `Søkte etter IoT-enheter (${filteredDevices.length} funnet)`,
            userId,
            metadata: {
              connectionType: input.connectionType,
              devicesFound: filteredDevices.length
            }
          }
        })

        return filteredDevices
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke søke etter enheter'
        })
      }
    })
})

// Helper function to calculate IoT score
function calculateIoTScore(
  devices: number,
  sensors: number,
  wearables: number,
  automations: number,
  onlineDevices: number
): number {
  let score = 0
  
  // Devices (max 25 points)
  score += Math.min(devices * 5, 25)
  
  // Sensors (max 25 points)
  score += Math.min(sensors * 5, 25)
  
  // Wearables (max 20 points)
  score += Math.min(wearables * 4, 20)
  
  // Automations (max 20 points)
  score += Math.min(automations * 4, 20)
  
  // Connectivity bonus (max 10 points)
  if (devices > 0) {
    score += Math.round((onlineDevices / devices) * 10)
  }
  
  return Math.max(0, Math.min(100, score))
}
