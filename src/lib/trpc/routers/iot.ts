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

  // Get devices data
  getDevicesData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock devices data
      const devicesData = {
        connectedDevices: 12,
        devices: [
          {
            id: 'device_1',
            name: 'Smart Thermostat',
            description: 'Temperature control system',
            type: 'Climate Control',
            lastSeen: '2 minutes ago',
            battery: 85,
            status: 'connected',
            icon: 'IoTDevice'
          },
          {
            id: 'device_2',
            name: 'Security Camera',
            description: 'HD surveillance camera',
            type: 'Security',
            lastSeen: '1 minute ago',
            battery: 92,
            status: 'connected',
            icon: 'IoTDevice'
          },
          {
            id: 'device_3',
            name: 'Smart Lock',
            description: 'Digital door lock',
            type: 'Security',
            lastSeen: '5 minutes ago',
            battery: 78,
            status: 'connected',
            icon: 'IoTDevice'
          },
          {
            id: 'device_4',
            name: 'Smart Speaker',
            description: 'Voice-controlled speaker',
            type: 'Entertainment',
            lastSeen: '10 minutes ago',
            battery: 95,
            status: 'disconnected',
            icon: 'IoTDevice'
          }
        ],
        deviceAnalytics: [
          {
            id: 'total_devices',
            name: 'Total Devices',
            value: '12',
            icon: 'IoTDevice'
          },
          {
            id: 'connected_rate',
            name: 'Connection Rate',
            value: '92%',
            icon: 'IoT'
          },
          {
            id: 'avg_battery',
            name: 'Avg Battery',
            value: '87%',
            icon: 'Battery'
          },
          {
            id: 'device_health',
            name: 'Device Health',
            value: 'Good',
            icon: 'CheckCircle'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'IOT_DEVICES_VIEWED',
          description: 'Viewed IoT devices data',
          metadata: { connectedDevices: devicesData.connectedDevices }
        }
      })

      return devicesData
    }),

  // Get sensors data
  getSensorsData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock sensors data
      const sensorsData = {
        activeSensors: 8,
        sensors: [
          {
            id: 'sensor_1',
            name: 'Temperature Sensor',
            description: 'Room temperature monitoring',
            value: 22.5,
            unit: '°C',
            lastReading: '1 minute ago',
            location: 'Living Room',
            status: 'active',
            icon: 'Sensor'
          },
          {
            id: 'sensor_2',
            name: 'Humidity Sensor',
            description: 'Air humidity monitoring',
            value: 45,
            unit: '%',
            lastReading: '2 minutes ago',
            location: 'Bedroom',
            status: 'active',
            icon: 'Sensor'
          },
          {
            id: 'sensor_3',
            name: 'Motion Sensor',
            description: 'Movement detection',
            value: 1,
            unit: 'detections',
            lastReading: '30 seconds ago',
            location: 'Hallway',
            status: 'active',
            icon: 'Sensor'
          },
          {
            id: 'sensor_4',
            name: 'Light Sensor',
            description: 'Ambient light monitoring',
            value: 650,
            unit: 'lux',
            lastReading: '5 minutes ago',
            location: 'Kitchen',
            status: 'inactive',
            icon: 'Sensor'
          }
        ],
        sensorAnalytics: [
          {
            id: 'active_sensors',
            name: 'Active Sensors',
            value: '8/10',
            percentage: 80
          },
          {
            id: 'data_accuracy',
            name: 'Data Accuracy',
            value: '95%',
            percentage: 95
          },
          {
            id: 'sensor_health',
            name: 'Sensor Health',
            value: 'Good',
            percentage: 88
          },
          {
            id: 'calibration_status',
            name: 'Calibration Status',
            value: 'Up to date',
            percentage: 92
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'IOT_SENSORS_VIEWED',
          description: 'Viewed IoT sensors data',
          metadata: { activeSensors: sensorsData.activeSensors }
        }
      })

      return sensorsData
    }),

  // Get smart home data
  getSmartHomeData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock smart home data
      const smartHomeData = {
        smartHomeDevices: 6,
        smartHomeDevices: [
          {
            id: 'smart_1',
            name: 'Smart Lights',
            description: 'LED lighting system',
            room: 'Living Room',
            status: 'on',
            lastAction: '2 minutes ago',
            icon: 'SmartHome'
          },
          {
            id: 'smart_2',
            name: 'Smart Blinds',
            description: 'Automated window blinds',
            room: 'Bedroom',
            status: 'off',
            lastAction: '1 hour ago',
            icon: 'SmartHome'
          },
          {
            id: 'smart_3',
            name: 'Smart Coffee Maker',
            description: 'Programmable coffee machine',
            room: 'Kitchen',
            status: 'on',
            lastAction: '30 minutes ago',
            icon: 'SmartHome'
          },
          {
            id: 'smart_4',
            name: 'Smart Vacuum',
            description: 'Robot vacuum cleaner',
            room: 'Entire House',
            status: 'off',
            lastAction: '3 hours ago',
            icon: 'SmartHome'
          }
        ],
        smartHomeAnalytics: [
          {
            id: 'energy_usage',
            name: 'Energy Usage',
            value: '2.3 kWh',
            icon: 'Zap'
          },
          {
            id: 'automation_count',
            name: 'Automations',
            value: '15 active',
            icon: 'Workflow'
          },
          {
            id: 'comfort_score',
            name: 'Comfort Score',
            value: '92%',
            icon: 'Heart'
          },
          {
            id: 'security_status',
            name: 'Security Status',
            value: 'Armed',
            icon: 'Shield'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'IOT_SMART_HOME_VIEWED',
          description: 'Viewed smart home data',
          metadata: { smartHomeDevices: smartHomeData.smartHomeDevices }
        }
      })

      return smartHomeData
    }),

  // Get IoT settings
  getIoTSettings: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock IoT settings
      const settingsData = {
        iotScore: 89,
        settings: [
          {
            id: 'iot_enabled',
            key: 'iotEnabled',
            name: 'IoT System',
            enabled: true,
            icon: 'IoT'
          },
          {
            id: 'device_management',
            key: 'deviceManagement',
            name: 'Device Management',
            enabled: true,
            icon: 'IoTDevice'
          },
          {
            id: 'sensor_monitoring',
            key: 'sensorMonitoring',
            name: 'Sensor Monitoring',
            enabled: true,
            icon: 'Sensor'
          },
          {
            id: 'smart_home_control',
            key: 'smartHomeControl',
            name: 'Smart Home Control',
            enabled: false,
            icon: 'SmartHome'
          }
        ],
        iotGoals: [
          {
            id: 'device_connectivity',
            name: 'Device Connectivity',
            current: 89,
            target: 95
          },
          {
            id: 'sensor_accuracy',
            name: 'Sensor Accuracy',
            current: 92,
            target: 98
          },
          {
            id: 'automation_efficiency',
            name: 'Automation Efficiency',
            current: 85,
            target: 90
          },
          {
            id: 'energy_optimization',
            name: 'Energy Optimization',
            current: 87,
            target: 92
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'IOT_SETTINGS_VIEWED',
          description: 'Viewed IoT settings',
          metadata: { iotScore: settingsData.iotScore }
        }
      })

      return settingsData
    }),

  // Connect device
  connectDevice: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
      action: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'IOT_DEVICE_CONNECTED',
          description: `Connected device: ${input.deviceId}`,
          metadata: { deviceId: input.deviceId, action: input.action }
        }
      })

      return { success: true, message: 'Device connected successfully' }
    }),

  // Monitor sensor
  monitorSensor: protectedProcedure
    .input(z.object({
      sensorId: z.string(),
      action: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'IOT_SENSOR_MONITORED',
          description: `Monitored sensor: ${input.sensorId}`,
          metadata: { sensorId: input.sensorId, action: input.action }
        }
      })

      return { success: true, message: 'Sensor monitoring started successfully' }
    }),

  // Control smart home
  controlSmartHome: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
      action: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'IOT_SMART_HOME_CONTROLLED',
          description: `Controlled smart home device: ${input.deviceId}`,
          metadata: { deviceId: input.deviceId, action: input.action }
        }
      })

      return { success: true, message: 'Smart home device controlled successfully' }
    }),

  // Update IoT settings
  updateSettings: protectedProcedure
    .input(z.object({
      iotEnabled: z.boolean().optional(),
      deviceManagement: z.boolean().optional(),
      sensorMonitoring: z.boolean().optional(),
      smartHomeControl: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'IOT_SETTINGS_UPDATED',
          description: 'Updated IoT settings',
          metadata: input
        }
      })

      return { success: true, message: 'IoT settings updated successfully' }
    }),

  // Get IoT statistics
  getIoTStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock IoT statistics
      const stats = {
        connectedDevices: 12,
        activeSensors: 8,
        smartHomeDevices: 6,
        iotScore: 89,
        totalAutomations: 15,
        energyUsage: 2.3
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'IOT_STATS_VIEWED',
          description: 'Viewed IoT statistics',
          metadata: stats
        }
      })

      return stats
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
