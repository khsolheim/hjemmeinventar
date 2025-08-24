import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const integrationsRouter = createTRPCRouter({
  // Smart Home Integrations
  getIntegrations: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's smart home integrations
        const integrations = await ctx.db.smartHomeIntegration.findMany({
          where: { userId },
          include: {
            devices: true,
            automations: true
          }
        })

        return integrations.map(integration => ({
          id: integration.id,
          type: integration.type,
          name: integration.name,
          config: integration.config,
          status: integration.status,
          lastSync: integration.lastSync,
          deviceCount: integration.devices.length,
          automationCount: integration.automations.length
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente integrasjoner'
        })
      }
    }),

  getDevices: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get devices from all user's integrations
        const devices = await ctx.db.smartDevice.findMany({
          where: {
            integration: {
              userId
            }
          },
          include: {
            integration: true
          }
        })

        return devices.map(device => ({
          id: device.id,
          name: device.name,
          type: device.type,
          status: device.status,
          state: device.state,
          value: device.value,
          unit: device.unit,
          integration: device.integration.name,
          icon: getDeviceIcon(device.type)
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente enheter'
        })
      }
    }),

  getAutomations: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get automations from all user's integrations
        const automations = await ctx.db.automation.findMany({
          where: {
            integration: {
              userId
            }
          },
          include: {
            integration: true
          }
        })

        return automations.map(automation => ({
          id: automation.id,
          name: automation.name,
          description: automation.description,
          enabled: automation.enabled,
          trigger: automation.trigger,
          actions: automation.actions,
          integration: automation.integration.name
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente automatiseringer'
        })
      }
    }),

  addIntegration: protectedProcedure
    .input(z.object({
      type: z.enum(['philips_hue', 'ikea_tradfri', 'amazon_alexa']),
      name: z.string(),
      config: z.object({
        ip: z.string().optional(),
        token: z.string().optional(),
        username: z.string().optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Create new integration
        const integration = await ctx.db.smartHomeIntegration.create({
          data: {
            type: input.type,
            name: input.name,
            config: input.config,
            status: 'connecting',
            userId
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'INTEGRATION_ADDED',
            description: `La til ${input.name} integrasjon`,
            userId,
            metadata: {
              integrationType: input.type,
              integrationId: integration.id
            }
          }
        })

        return integration
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke legge til integrasjon'
        })
      }
    }),

  toggleDevice: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
      state: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Verify user owns the device
        const device = await ctx.db.smartDevice.findFirst({
          where: {
            id: input.deviceId,
            integration: {
              userId
            }
          }
        })

        if (!device) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Enhet ikke funnet'
          })
        }

        // Update device state
        const updatedDevice = await ctx.db.smartDevice.update({
          where: { id: input.deviceId },
          data: { state: input.state }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'DEVICE_TOGGLED',
            description: `${input.state ? 'Slått på' : 'Slått av'} ${device.name}`,
            userId,
            metadata: {
              deviceId: device.id,
              deviceName: device.name,
              newState: input.state
            }
          }
        })

        return updatedDevice
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke endre enhet-status'
        })
      }
    }),

  createAutomation: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
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

        // Create automation
        const automation = await ctx.db.automation.create({
          data: {
            name: input.name,
            description: input.description,
            trigger: input.trigger,
            actions: input.actions,
            enabled: true,
            integrationId: 'default' // Would need to specify which integration
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'AUTOMATION_CREATED',
            description: `Opprettet automatisering: ${input.name}`,
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
          message: 'Kunne ikke opprette automatisering'
        })
      }
    }),

  // Third-party Integrations
  getThirdPartyIntegrations: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's third-party integrations
        const integrations = await ctx.db.thirdPartyIntegration.findMany({
          where: { userId }
        })

        return integrations.map(integration => ({
          id: integration.id,
          type: integration.type,
          name: integration.name,
          config: integration.config,
          enabled: integration.enabled,
          syncStatus: integration.syncStatus,
          lastSync: integration.lastSync,
          errorCount: integration.errorCount
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente tredjeparts-integrasjoner'
        })
      }
    }),

  getSyncStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get sync status for all integrations
        const integrations = await ctx.db.thirdPartyIntegration.findMany({
          where: { userId }
        })

        const status = {
          synced: 0,
          syncing: 0,
          errors: 0,
          pending: 0
        }

        integrations.forEach(integration => {
          switch (integration.syncStatus) {
            case 'synced':
              status.synced++
              break
            case 'syncing':
              status.syncing++
              break
            case 'error':
              status.errors++
              break
            case 'pending':
              status.pending++
              break
          }
        })

        return status
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente synkroniseringsstatus'
        })
      }
    }),

  getWebhooks: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's webhooks
        const webhooks = await ctx.db.webhook.findMany({
          where: { userId }
        })

        return webhooks.map(webhook => ({
          id: webhook.id,
          name: webhook.name,
          url: webhook.url,
          events: webhook.events,
          active: webhook.active,
          lastTriggered: webhook.lastTriggered
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente webhooks'
        })
      }
    }),

  addThirdPartyIntegration: protectedProcedure
    .input(z.object({
      type: z.string(),
      name: z.string(),
      config: z.object({
        apiKey: z.string(),
        apiSecret: z.string().optional(),
        webhookUrl: z.string().optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Create new integration
        const integration = await ctx.db.thirdPartyIntegration.create({
          data: {
            type: input.type,
            name: input.name,
            config: input.config,
            enabled: true,
            syncStatus: 'pending',
            userId
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'THIRD_PARTY_INTEGRATION_ADDED',
            description: `La til ${input.name} integrasjon`,
            userId,
            metadata: {
              integrationType: input.type,
              integrationId: integration.id
            }
          }
        })

        return integration
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke legge til integrasjon'
        })
      }
    }),

  syncData: protectedProcedure
    .input(z.object({
      integrationId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Verify user owns the integration
        const integration = await ctx.db.thirdPartyIntegration.findFirst({
          where: {
            id: input.integrationId,
            userId
          }
        })

        if (!integration) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Integrasjon ikke funnet'
          })
        }

        // Update sync status
        await ctx.db.thirdPartyIntegration.update({
          where: { id: input.integrationId },
          data: {
            syncStatus: 'syncing',
            lastSync: new Date()
          }
        })

        // Simulate sync process
        setTimeout(async () => {
          await ctx.db.thirdPartyIntegration.update({
            where: { id: input.integrationId },
            data: {
              syncStatus: 'synced'
            }
          })
        }, 2000)

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke synkronisere data'
        })
      }
    }),

  toggleIntegration: protectedProcedure
    .input(z.object({
      integrationId: z.string(),
      enabled: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Verify user owns the integration
        const integration = await ctx.db.thirdPartyIntegration.findFirst({
          where: {
            id: input.integrationId,
            userId
          }
        })

        if (!integration) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Integrasjon ikke funnet'
          })
        }

        // Update integration status
        const updatedIntegration = await ctx.db.thirdPartyIntegration.update({
          where: { id: input.integrationId },
          data: { enabled: input.enabled }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'INTEGRATION_TOGGLED',
            description: `${input.enabled ? 'Aktivert' : 'Deaktivert'} ${integration.name}`,
            userId,
            metadata: {
              integrationId: integration.id,
              integrationName: integration.name,
              newStatus: input.enabled
            }
          }
        })

        return updatedIntegration
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke endre integrasjon-status'
        })
      }
    })
})

// Helper function to get device icon
function getDeviceIcon(type: string) {
  switch (type) {
    case 'light': return 'Lightbulb'
    case 'sensor': return 'Activity'
    case 'switch': return 'Power'
    case 'thermostat': return 'Thermometer'
    case 'camera': return 'Camera'
    default: return 'Smartphone'
  }
}
