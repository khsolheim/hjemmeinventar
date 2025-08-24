'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Key,
  Fingerprint,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Database,
  Network,
  Smartphone,
  Monitor,
  Server,
  Globe,
  User,
  Users,
  FileText,
  Trash2,
  Archive,
  Search,
  Filter,
  Bell,
  Zap,
  Shield as Security,
  Lock as Privacy,
  Key as Encryption,
  Fingerprint as Biometric,
  AlertTriangle as Threat,
  CheckCircle as Secure,
  XCircle as Vulnerable,
  Clock as Audit,
  Settings as Config,
  RefreshCw as Update,
  Download as Export,
  Upload as Import,
  Database as Storage,
  Network as NetworkIcon,
  Smartphone as Mobile,
  Monitor as Desktop,
  Server as ServerIcon,
  Globe as Internet,
  User as UserIcon,
  Users as Group,
  FileText as Document,
  Trash2 as Delete,
  Archive as Backup,
  Search as Scan,
  Filter as FilterIcon,
  Bell as Notification
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedSecurityProps {
  className?: string
}

export function AdvancedSecurity({ className }: AdvancedSecurityProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'privacy' | 'encryption' | 'monitoring'>('overview')
  const [showSensitiveData, setShowSensitiveData] = useState(false)
  const haptic = useHapticFeedback()

  // Security queries
  const securityQuery = trpc.security.getSecurityStatus.useQuery()
  const privacyQuery = trpc.security.getPrivacySettings.useQuery()
  const encryptionQuery = trpc.security.getEncryptionStatus.useQuery()
  const monitoringQuery = trpc.security.getSecurityMonitoring.useQuery()

  const updatePrivacyMutation = trpc.security.updatePrivacySettings.useMutation()
  const encryptDataMutation = trpc.security.encryptData.useMutation()
  const generateBackupMutation = trpc.security.generateBackup.useMutation()

  const handlePrivacyToggle = async (setting: string, enabled: boolean) => {
    haptic.success()
    try {
      await updatePrivacyMutation.mutateAsync({ setting, enabled })
    } catch (error) {
      console.error('Failed to update privacy setting:', error)
    }
  }

  const handleEncryptData = async () => {
    haptic.light()
    try {
      await encryptDataMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to encrypt data:', error)
    }
  }

  const handleGenerateBackup = async () => {
    haptic.selection()
    try {
      await generateBackupMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to generate backup:', error)
    }
  }

  const getSecurityLevel = (score: number) => {
    if (score >= 90) return { color: 'text-green-600', label: 'Utmerket', icon: CheckCircle }
    if (score >= 70) return { color: 'text-yellow-600', label: 'God', icon: Shield }
    if (score >= 50) return { color: 'text-orange-600', label: 'OK', icon: AlertTriangle }
    return { color: 'text-red-600', label: 'Dårlig', icon: XCircle }
  }

  const getThreatLevel = (level: string) => {
    switch (level) {
      case 'low': return { color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'medium': return { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
      case 'high': return { color: 'bg-red-100 text-red-800', icon: XCircle }
      default: return { color: 'bg-gray-100 text-gray-800', icon: Shield }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Security</h2>
          <p className="text-muted-foreground">
            Sikkerhet, personvern og kryptering
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Enterprise Grade
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            End-to-End
          </Badge>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sikkerhetsscore</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {securityQuery.data?.securityScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {getSecurityLevel(securityQuery.data?.securityScore || 0).label}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive trusler</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityQuery.data?.activeThreats || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Blokkerte forsøk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Krypterte data</CardTitle>
            <Key className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {encryptionQuery.data?.encryptedData || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Alle sensitive data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siste backup</CardTitle>
            <Archive className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {securityQuery.data?.lastBackup || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Automatisk backup
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('overview')}
          className="flex-1"
        >
          <Shield className="w-4 h-4 mr-2" />
          Oversikt
        </Button>
        <Button
          variant={selectedTab === 'privacy' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('privacy')}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          Personvern
        </Button>
        <Button
          variant={selectedTab === 'encryption' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('encryption')}
          className="flex-1"
        >
          <Key className="w-4 h-4 mr-2" />
          Kryptering
        </Button>
        <Button
          variant={selectedTab === 'monitoring' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('monitoring')}
          className="flex-1"
        >
          <Monitor className="w-4 h-4 mr-2" />
          Overvåking
        </Button>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sikkerhetsstatus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityQuery.data?.securityChecks?.map((check) => (
                    <div key={check.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {check.status === 'secure' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm">{check.name}</span>
                      </div>
                      <Badge variant={check.status === 'secure' ? 'default' : 'destructive'}>
                        {check.status === 'secure' ? 'Sikker' : 'Sårbar'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Siste aktivitet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityQuery.data?.recentActivity?.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{activity.action}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString('no-NO')}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {selectedTab === 'privacy' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Personverninnstillinger
              </CardTitle>
              <CardDescription>
                Kontroller hvordan dine data brukes og deles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {privacyQuery.data?.settings?.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{setting.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {setting.description}
                      </div>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(enabled) => handlePrivacyToggle(setting.id, enabled)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Encryption Tab */}
      {selectedTab === 'encryption' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Encryption Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Krypteringsstatus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {encryptionQuery.data?.encryptionStatus?.map((status) => (
                    <div key={status.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{status.name}</span>
                        <span className="text-sm font-medium">{status.percentage}%</span>
                      </div>
                      <Progress value={status.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Encryption Keys */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5" />
                  Krypteringsnøkler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {encryptionQuery.data?.keys?.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{key.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Opprettet: {new Date(key.createdAt).toLocaleDateString('no-NO')}
                        </div>
                      </div>
                      <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                        {key.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Encryption Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Krypteringshandlinger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Key className="w-5 h-5" />
                  <span className="text-sm">Krypter data</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Archive className="w-5 h-5" />
                  <span className="text-sm">Generer backup</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-sm">Oppdater nøkler</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Download className="w-5 h-5" />
                  <span className="text-sm">Eksporter nøkler</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monitoring Tab */}
      {selectedTab === 'monitoring' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Sikkerhetsovervåking
              </CardTitle>
              <CardDescription>
                Real-time overvåking av sikkerhet og trusler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monitoringQuery.data?.threats?.map((threat) => {
                  const threatLevel = getThreatLevel(threat.level)
                  const ThreatIcon = threatLevel.icon
                  
                  return (
                    <div key={threat.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${threatLevel.color}`}>
                          <ThreatIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{threat.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {threat.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{threat.count}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(threat.timestamp).toLocaleTimeString('no-NO')}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Raske handlinger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Sikkerhetsscan</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Archive className="w-5 h-5" />
              <span className="text-sm">Backup nå</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Key className="w-5 h-5" />
              <span className="text-sm">Rotasjon nøkler</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm">Personvernrapport</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
