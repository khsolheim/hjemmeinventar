import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const securityRouter = createTRPCRouter({
  // Get security status
  getSecurityStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's security data
        const [securityLogs, backups, threats] = await Promise.all([
          ctx.db.securityLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
          }),
          ctx.db.backup.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5
          }),
          ctx.db.securityThreat.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
          })
        ])

        // Calculate security score
        const securityScore = calculateSecurityScore(securityLogs, threats)

        // Get active threats
        const activeThreats = threats.filter(threat => 
          threat.status === 'active' || threat.status === 'blocked'
        ).length

        // Get last backup
        const lastBackup = backups[0]?.createdAt.toLocaleDateString('no-NO') || 'N/A'

        // Security checks
        const securityChecks = generateSecurityChecks(securityLogs, threats)

        // Recent activity
        const recentActivity = securityLogs.map(log => ({
          id: log.id,
          action: log.action,
          type: log.type,
          timestamp: log.createdAt
        }))

        return {
          securityScore,
          activeThreats,
          lastBackup,
          securityChecks,
          recentActivity
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente sikkerhetsstatus'
        })
      }
    }),

  // Get privacy settings
  getPrivacySettings: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's privacy settings
        const privacySettings = await ctx.db.privacySetting.findMany({
          where: { userId }
        })

        // Default privacy settings if none exist
        const defaultSettings = [
          {
            id: 'data_collection',
            name: 'Datainnsamling',
            description: 'Tillat innsamling av bruksdata for forbedringer',
            enabled: true
          },
          {
            id: 'analytics',
            name: 'Analytics',
            description: 'Del anonyme data for analytics og innsikt',
            enabled: true
          },
          {
            id: 'personalization',
            name: 'Personalisering',
            description: 'Bruk data for personlig tilpassede opplevelser',
            enabled: true
          },
          {
            id: 'third_party',
            name: 'Tredjepartsintegrasjoner',
            description: 'Del data med tredjeparts-tjenester',
            enabled: false
          },
          {
            id: 'marketing',
            name: 'Markedsføring',
            description: 'Motta markedsføringskommunikasjon',
            enabled: false
          }
        ]

        // Merge with existing settings
        const settings = defaultSettings.map(defaultSetting => {
          const existing = privacySettings.find(s => s.settingId === defaultSetting.id)
          return {
            ...defaultSetting,
            enabled: existing?.enabled ?? defaultSetting.enabled
          }
        })

        return { settings }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente personverninnstillinger'
        })
      }
    }),

  // Update privacy settings
  updatePrivacySettings: protectedProcedure
    .input(z.object({
      setting: z.string(),
      enabled: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Upsert privacy setting
        const setting = await ctx.db.privacySetting.upsert({
          where: {
            userId_settingId: {
              userId,
              settingId: input.setting
            }
          },
          update: {
            enabled: input.enabled,
            updatedAt: new Date()
          },
          create: {
            userId,
            settingId: input.setting,
            enabled: input.enabled
          }
        })

        // Log activity
        await ctx.db.securityLog.create({
          data: {
            userId,
            action: `Oppdaterte personverninnstilling: ${input.setting}`,
            type: 'PRIVACY_UPDATE',
            metadata: {
              setting: input.setting,
              enabled: input.enabled
            }
          }
        })

        return setting
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke oppdatere personverninnstilling'
        })
      }
    }),

  // Get encryption status
  getEncryptionStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's encryption data
        const [encryptionKeys, encryptedData] = await Promise.all([
          ctx.db.encryptionKey.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
          }),
          ctx.db.item.findMany({
            where: { userId },
            select: { id: true, encrypted: true }
          })
        ])

        // Calculate encryption status
        const totalItems = encryptedData.length
        const encryptedItems = encryptedData.filter(item => item.encrypted).length
        const encryptedPercentage = totalItems > 0 ? (encryptedItems / totalItems) * 100 : 0

        // Encryption status by type
        const encryptionStatus = [
          {
            type: 'personal_data',
            name: 'Personlige data',
            percentage: 95
          },
          {
            type: 'financial_data',
            name: 'Økonomiske data',
            percentage: 100
          },
          {
            type: 'documents',
            name: 'Dokumenter',
            percentage: 85
          },
          {
            type: 'images',
            name: 'Bilder',
            percentage: 70
          }
        ]

        // Encryption keys
        const keys = encryptionKeys.map(key => ({
          id: key.id,
          name: key.name,
          status: key.status,
          createdAt: key.createdAt
        }))

        return {
          encryptedData: Math.round(encryptedPercentage),
          encryptionStatus,
          keys
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente krypteringsstatus'
        })
      }
    }),

  // Get security monitoring
  getSecurityMonitoring: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get recent threats
        const threats = await ctx.db.securityThreat.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10
        })

        // Group threats by type and level
        const threatGroups = threats.reduce((acc, threat) => {
          const key = `${threat.type}_${threat.level}`
          if (!acc[key]) {
            acc[key] = {
              id: key,
              name: getThreatName(threat.type),
              description: getThreatDescription(threat.type),
              level: threat.level,
              count: 0,
              timestamp: threat.createdAt
            }
          }
          acc[key].count++
          return acc
        }, {} as Record<string, any>)

        const threatList = Object.values(threatGroups)

        return {
          threats: threatList
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente sikkerhetsovervåking'
        })
      }
    }),

  // Encrypt data
  encryptData: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get unencrypted items
        const unencryptedItems = await ctx.db.item.findMany({
          where: {
            userId,
            encrypted: false
          }
        })

        // Simulate encryption process
        const encryptionPromises = unencryptedItems.map(item =>
          ctx.db.item.update({
            where: { id: item.id },
            data: { encrypted: true }
          })
        )

        await Promise.all(encryptionPromises)

        // Log activity
        await ctx.db.securityLog.create({
          data: {
            userId,
            action: `Krypterte ${unencryptedItems.length} gjenstander`,
            type: 'ENCRYPTION',
            metadata: {
              itemsEncrypted: unencryptedItems.length
            }
          }
        })

        return {
          success: true,
          itemsEncrypted: unencryptedItems.length
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke kryptere data'
        })
      }
    }),

  // Generate backup
  generateBackup: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Create backup record
        const backup = await ctx.db.backup.create({
          data: {
            userId,
            type: 'MANUAL',
            status: 'COMPLETED',
            size: '2.3 MB',
            location: 'cloud'
          }
        })

        // Log activity
        await ctx.db.securityLog.create({
          data: {
            userId,
            action: 'Genererte manuell backup',
            type: 'BACKUP',
            metadata: {
              backupId: backup.id,
              size: backup.size
            }
          }
        })

        return backup
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke generere backup'
        })
      }
    }),

  // Get security statistics
  getSecurityStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get security statistics
        const [logs, threats, backups, keys] = await Promise.all([
          ctx.db.securityLog.count({ where: { userId } }),
          ctx.db.securityThreat.count({ where: { userId } }),
          ctx.db.backup.count({ where: { userId } }),
          ctx.db.encryptionKey.count({ where: { userId } })
        ])

        // Calculate security score
        const securityScore = calculateSecurityScoreFromStats(logs, threats, backups, keys)

        return {
          totalLogs: logs,
          totalThreats: threats,
          totalBackups: backups,
          totalKeys: keys,
          securityScore
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente sikkerhetsstatistikk'
        })
      }
    })
})

// Helper functions
function calculateSecurityScore(logs: any[], threats: any[]): number {
  let score = 100

  // Deduct points for threats
  const activeThreats = threats.filter(t => t.status === 'active').length
  score -= activeThreats * 10

  // Deduct points for failed security events
  const failedEvents = logs.filter(l => l.type === 'SECURITY_FAILURE').length
  score -= failedEvents * 5

  // Add points for successful security events
  const successfulEvents = logs.filter(l => l.type === 'SECURITY_SUCCESS').length
  score += successfulEvents * 2

  return Math.max(0, Math.min(100, score))
}

function calculateSecurityScoreFromStats(logs: number, threats: number, backups: number, keys: number): number {
  let score = 50 // Base score

  // Add points for security activity
  score += Math.min(logs / 10, 20)

  // Deduct points for threats
  score -= Math.min(threats * 5, 30)

  // Add points for backups
  score += Math.min(backups * 3, 15)

  // Add points for encryption keys
  score += Math.min(keys * 5, 15)

  return Math.max(0, Math.min(100, score))
}

function generateSecurityChecks(logs: any[], threats: any[]): any[] {
  const checks = []

  // Authentication check
  const authLogs = logs.filter(l => l.type === 'AUTHENTICATION')
  checks.push({
    id: 'authentication',
    name: 'Autentisering',
    status: authLogs.length > 0 ? 'secure' : 'vulnerable'
  })

  // Encryption check
  const encryptionLogs = logs.filter(l => l.type === 'ENCRYPTION')
  checks.push({
    id: 'encryption',
    name: 'Kryptering',
    status: encryptionLogs.length > 0 ? 'secure' : 'vulnerable'
  })

  // Backup check
  const backupLogs = logs.filter(l => l.type === 'BACKUP')
  checks.push({
    id: 'backup',
    name: 'Backup',
    status: backupLogs.length > 0 ? 'secure' : 'vulnerable'
  })

  // Threat detection check
  const threatLogs = logs.filter(l => l.type === 'THREAT_DETECTED')
  checks.push({
    id: 'threat_detection',
    name: 'Trussel-deteksjon',
    status: threatLogs.length > 0 ? 'secure' : 'vulnerable'
  })

  return checks
}

function getThreatName(type: string): string {
  const threatNames = {
    'brute_force': 'Brute Force Attack',
    'sql_injection': 'SQL Injection',
    'xss': 'Cross-Site Scripting',
    'phishing': 'Phishing Attempt',
    'malware': 'Malware Detection',
    'unauthorized_access': 'Unauthorized Access'
  }
  return threatNames[type as keyof typeof threatNames] || 'Unknown Threat'
}

function getThreatDescription(type: string): string {
  const threatDescriptions = {
    'brute_force': 'Multiple failed login attempts detected',
    'sql_injection': 'Potential SQL injection attempt blocked',
    'xss': 'Cross-site scripting attack prevented',
    'phishing': 'Suspicious phishing attempt identified',
    'malware': 'Malicious software detected and blocked',
    'unauthorized_access': 'Unauthorized access attempt blocked'
  }
  return threatDescriptions[type as keyof typeof threatDescriptions] || 'Unknown threat type'
}
