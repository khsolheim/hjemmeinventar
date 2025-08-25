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

  // Get threats data
  getThreatsData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock threats data
      const threatsData = {
        activeThreats: 3,
        detectedThreats: [
          {
            id: 'threat_1',
            name: 'Suspicious Login Attempt',
            description: 'Multiple failed login attempts from unknown IP',
            source: '192.168.1.100',
            time: '14:30',
            date: '2024-01-15',
            level: 'medium',
            icon: 'AlertTriangle'
          },
          {
            id: 'threat_2',
            name: 'Malware Detection',
            description: 'Potential malware detected in uploaded file',
            source: 'File Upload',
            time: '12:15',
            date: '2024-01-15',
            level: 'high',
            icon: 'AlertTriangle'
          },
          {
            id: 'threat_3',
            name: 'Data Breach Alert',
            description: 'Unusual data access pattern detected',
            source: 'Database',
            time: '10:45',
            date: '2024-01-14',
            level: 'critical',
            icon: 'AlertTriangle'
          },
          {
            id: 'threat_4',
            name: 'Phishing Attempt',
            description: 'Suspicious email link detected',
            source: 'Email System',
            time: '09:20',
            date: '2024-01-14',
            level: 'low',
            icon: 'AlertTriangle'
          }
        ],
        securityAnalytics: [
          {
            id: 'threats_blocked',
            name: 'Threats Blocked',
            value: '156',
            icon: 'Shield'
          },
          {
            id: 'vulnerabilities_fixed',
            name: 'Vulnerabilities Fixed',
            value: '23',
            icon: 'CheckCircle'
          },
          {
            id: 'security_score',
            name: 'Security Score',
            value: '94%',
            icon: 'Star'
          },
          {
            id: 'incident_response',
            name: 'Response Time',
            value: '2.3 min',
            icon: 'Clock'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'SECURITY_THREATS_VIEWED',
          description: 'Viewed threats data',
          metadata: { activeThreats: threatsData.activeThreats }
        }
      })

      return threatsData
    }),

  // Get privacy data
  getPrivacyData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock privacy data
      const privacyData = {
        privacyScore: 87,
        privacyControls: [
          {
            id: 'control_1',
            name: 'Data Encryption',
            description: 'Encrypt all sensitive data at rest and in transit',
            status: 'Active',
            lastUpdated: '2024-01-15',
            enabled: true,
            icon: 'Lock'
          },
          {
            id: 'control_2',
            name: 'Privacy Mode',
            description: 'Hide sensitive information from other users',
            status: 'Enabled',
            lastUpdated: '2024-01-14',
            enabled: true,
            icon: 'Eye'
          },
          {
            id: 'control_3',
            name: 'Data Retention',
            description: 'Automatically delete old data after specified period',
            status: 'Active',
            lastUpdated: '2024-01-13',
            enabled: false,
            icon: 'Trash2'
          },
          {
            id: 'control_4',
            name: 'Audit Logging',
            description: 'Track all data access and modifications',
            status: 'Enabled',
            lastUpdated: '2024-01-12',
            enabled: true,
            icon: 'FileText'
          }
        ],
        privacyAnalytics: [
          {
            id: 'data_encrypted',
            name: 'Data Encrypted',
            value: '98%',
            percentage: 98
          },
          {
            id: 'privacy_compliance',
            name: 'Privacy Compliance',
            value: '95%',
            percentage: 95
          },
          {
            id: 'data_breaches',
            name: 'Data Breaches',
            value: '0',
            percentage: 100
          },
          {
            id: 'user_consent',
            name: 'User Consent',
            value: '92%',
            percentage: 92
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'SECURITY_PRIVACY_VIEWED',
          description: 'Viewed privacy data',
          metadata: { privacyScore: privacyData.privacyScore }
        }
      })

      return privacyData
    }),

  // Get access data
  getAccessData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock access data
      const accessData = {
        activeUsers: 8,
        userAccess: [
          {
            id: 'user_1',
            name: 'Anna Hansen',
            role: 'Admin',
            lastLogin: '2 min ago',
            permissions: 'Full Access',
            device: 'iPhone 15',
            status: 'active',
            icon: 'Users'
          },
          {
            id: 'user_2',
            name: 'Ole Johansen',
            role: 'User',
            lastLogin: '15 min ago',
            permissions: 'Limited Access',
            device: 'MacBook Pro',
            status: 'active',
            icon: 'Users'
          },
          {
            id: 'user_3',
            name: 'Maria Olsen',
            role: 'Manager',
            lastLogin: '1 hour ago',
            permissions: 'Manager Access',
            device: 'iPad Pro',
            status: 'suspended',
            icon: 'Users'
          },
          {
            id: 'user_4',
            name: 'Per Nilsen',
            role: 'Guest',
            lastLogin: '3 hours ago',
            permissions: 'Read Only',
            device: 'Android Phone',
            status: 'blocked',
            icon: 'Users'
          }
        ],
        accessAnalytics: [
          {
            id: 'active_sessions',
            name: 'Active Sessions',
            value: '8',
            icon: 'Users'
          },
          {
            id: 'failed_logins',
            name: 'Failed Logins',
            value: '12',
            icon: 'XCircle'
          },
          {
            id: 'access_attempts',
            name: 'Access Attempts',
            value: '156',
            icon: 'Activity'
          },
          {
            id: 'suspicious_activity',
            name: 'Suspicious Activity',
            value: '3',
            icon: 'AlertTriangle'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'SECURITY_ACCESS_VIEWED',
          description: 'Viewed access data',
          metadata: { activeUsers: accessData.activeUsers }
        }
      })

      return accessData
    }),

  // Get security settings
  getSecuritySettings: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock security settings
      const settingsData = {
        securityScore: 94,
        settings: [
          {
            id: 'security_enabled',
            key: 'securityEnabled',
            name: 'Security System',
            enabled: true,
            icon: 'Shield'
          },
          {
            id: 'threat_detection',
            key: 'threatDetection',
            name: 'Threat Detection',
            enabled: true,
            icon: 'AlertTriangle'
          },
          {
            id: 'privacy_protection',
            key: 'privacyProtection',
            name: 'Privacy Protection',
            enabled: true,
            icon: 'Eye'
          },
          {
            id: 'access_control',
            key: 'accessControl',
            name: 'Access Control',
            enabled: false,
            icon: 'Users'
          }
        ],
        securityGoals: [
          {
            id: 'threat_prevention',
            name: 'Threat Prevention',
            current: 94,
            target: 98
          },
          {
            id: 'privacy_compliance',
            name: 'Privacy Compliance',
            current: 87,
            target: 95
          },
          {
            id: 'access_security',
            name: 'Access Security',
            current: 92,
            target: 96
          },
          {
            id: 'incident_response',
            name: 'Incident Response',
            current: 89,
            target: 93
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'SECURITY_SETTINGS_VIEWED',
          description: 'Viewed security settings',
          metadata: { securityScore: settingsData.securityScore }
        }
      })

      return settingsData
    }),

  // Scan system
  scanSystem: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'SECURITY_SYSTEM_SCANNED',
          description: 'Performed system security scan',
          metadata: { scanType: 'full' }
        }
      })

      return { success: true, message: 'System scan completed successfully' }
    }),

  // Update privacy
  updatePrivacy: protectedProcedure
    .input(z.object({
      controlId: z.string(),
      action: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'SECURITY_PRIVACY_UPDATED',
          description: `Updated privacy control: ${input.controlId}`,
          metadata: { controlId: input.controlId, action: input.action }
        }
      })

      return { success: true, message: 'Privacy settings updated successfully' }
    }),

  // Manage access
  manageAccess: protectedProcedure
    .input(z.object({
      userId: z.string(),
      action: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'SECURITY_ACCESS_MANAGED',
          description: `Managed access for user: ${input.userId}`,
          metadata: { targetUserId: input.userId, action: input.action }
        }
      })

      return { success: true, message: 'Access management completed successfully' }
    }),

  // Update security settings
  updateSettings: protectedProcedure
    .input(z.object({
      securityEnabled: z.boolean().optional(),
      threatDetection: z.boolean().optional(),
      privacyProtection: z.boolean().optional(),
      accessControl: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'SECURITY_SETTINGS_UPDATED',
          description: 'Updated security settings',
          metadata: input
        }
      })

      return { success: true, message: 'Security settings updated successfully' }
    }),

  // Get security statistics
  getSecurityStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock security statistics
      const stats = {
        securityScore: 94,
        activeThreats: 3,
        privacyScore: 87,
        activeUsers: 8,
        threatsBlocked: 156,
        vulnerabilitiesFixed: 23
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'SECURITY_STATS_VIEWED',
          description: 'Viewed security statistics',
          metadata: stats
        }
      })

      return stats
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
