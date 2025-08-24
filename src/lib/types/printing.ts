// ============================================================================
// PRINTING SYSTEM - TypeScript Type Definitions (V3.1)
// ============================================================================

// import type { // Removed - not in schema
//   LabelType, 
//   LabelSize, 
//   PrintJobStatus, 
//   ConnectionType, 
//   Permission, 
//   AuditAction,
//   IntegrationType,
//   ConfigScope,
//   NotificationType,
//   ApprovalStatus,
//   ConditionType,
//   DataClassification,
//   ValidationRuleType,
//   TemplateComplexity,
//   BillingPlan,
//   ChangeType,
//   SeverityLevel,
//   DataType
// } from '@prisma/client'

// Placeholder types since these enums don't exist in schema
type LabelType = any
type LabelSize = any
type PrintJobStatus = any
type ConnectionType = any
type Permission = any
type AuditAction = any
type IntegrationType = any
type ConfigScope = any
type NotificationType = any
type ApprovalStatus = any
type ConditionType = any
type DataClassification = any
type ValidationRuleType = any
type TemplateComplexity = any
type BillingPlan = any
type ChangeType = any
type SeverityLevel = any
type DataType = any

// ============================================================================
// Core Printing Types
// ============================================================================

export interface TemplateFilters {
  type?: LabelType[]
  size?: LabelSize[]
  category?: string[]
  isSystemDefault?: boolean
  search?: string
  userId?: string
  householdId?: string
  tenantId?: string
  tags?: string[]
  complexity?: TemplateComplexity[]
  dateRange?: DateRange
}

export interface DateRange {
  from: Date
  to: Date
}

export interface CreateJobInput {
  templateId: string
  title: string
  data: LabelData[]
  printerName?: string
  copies?: number
  priority?: number
  scheduledAt?: Date
  approvalRequired?: boolean
  costEstimate?: number
  dataClassification?: DataClassification
  retentionDays?: number
}

export interface LabelData {
  [key: string]: any
}

export interface JobError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface BulkJobResult {
  jobIds: string[]
  errors: JobError[]
  estimatedCost: number
  estimatedDuration: number
}

export interface ValidationError {
  field: string
  message: string
  severity: SeverityLevel
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: string[]
}

export interface ConnectionStatus {
  isOnline: boolean
  printerName: string
  model?: string
  capabilities?: PrinterCapabilities
  lastSeen?: Date
  errorMessage?: string
}

export interface PrinterCapabilities {
  supportedSizes: LabelSize[]
  maxWidth: number
  maxHeight: number
  supportsDuplex: boolean
  supportsColor: boolean
  resolution: {
    x: number
    y: number
  }
}

export interface EstimateResult {
  estimatedDuration: number // seconds
  estimatedCost: number
  complexity: TemplateComplexity
  warnings: string[]
}

// ============================================================================
// Statistics and Analytics
// ============================================================================

export interface CostBreakdown {
  labelCosts: number
  operationalCosts: number
  maintenanceCosts: number
  totalCost: number
  currency: string
  period: string
}

export interface TemplateUsage {
  templateId: string
  templateName: string
  usageCount: number
  lastUsed: Date
  averageCopies: number
  uniqueUsers: number
}

export interface PrinterUsage {
  printerName: string
  jobCount: number
  totalLabels: number
  uptime: number
  errorRate: number
  averageJobDuration: number
}

export interface PrintStats {
  totalJobs: number
  successRate: number
  averageDuration: number
  costBreakdown: CostBreakdown
  popularTemplates: TemplateUsage[]
  printerUtilization: PrinterUsage[]
  timeRange: DateRange
}

// ============================================================================
// AI/ML and Optimization
// ============================================================================

export interface BatchSuggestion {
  suggestedBatchSize: number
  estimatedSavings: number
  reasoningText: string
  confidence: number
}

export interface MaintenanceAlert {
  alertType: 'LOW_TONER' | 'PAPER_JAM' | 'SERVICE_DUE' | 'PERFORMANCE_DEGRADATION'
  severity: SeverityLevel
  message: string
  actionRequired: string
  estimatedDowntime?: number
}

export interface AIOptimization {
  suggestedPrintTime: Date
  costSavings: number
  batchingOpportunities: BatchSuggestion[]
  maintenanceAlerts: MaintenanceAlert[]
  confidence: number
  reasoning: string
}

export interface PredictionResult {
  optimalTime: Date
  expectedDuration: number
  costOptimization: number
  confidence: number
  factors: string[]
}

export interface PatternAnalysis {
  userId: string
  patterns: {
    daily: number[]
    weekly: number[]
    monthly: number[]
  }
  anomalies: AnomalyDetection[]
  trends: TrendAnalysis[]
  recommendations: string[]
}

export interface AnomalyDetection {
  timestamp: Date
  type: 'UNUSUAL_VOLUME' | 'OFF_HOURS' | 'COST_SPIKE' | 'ERROR_RATE'
  severity: SeverityLevel
  description: string
  confidence: number
}

export interface TrendAnalysis {
  metric: string
  direction: 'INCREASING' | 'DECREASING' | 'STABLE'
  changeRate: number
  significance: number
  forecastedValue?: number
}

// ============================================================================
// Workflow and Approval
// ============================================================================

export interface EscalationRule {
  stepNumber: number
  timeoutMinutes: number
  escalateTo: string[]
  notificationMethod: NotificationType[]
  conditions?: Record<string, any>
}

export interface ApprovalWorkflowConfig {
  requiredApprovers: string[]
  escalationRules: EscalationRule[]
  timeoutMinutes: number
  allowParallelApproval: boolean
  autoApprovalRules?: AutoApprovalRule[]
}

export interface AutoApprovalRule {
  name: string
  conditions: Record<string, any>
  maxCost?: number
  maxQuantity?: number
  timeRestrictions?: TimeRestriction[]
}

export interface TimeRestriction {
  dayOfWeek?: number[]
  startTime?: string
  endTime?: string
  timezone?: string
}

export interface ApprovalDecision {
  decision: ApprovalStatus
  comments?: string
  conditions?: Record<string, any>
  escalate?: boolean
  escalationReason?: string
}

export interface ApprovalItem {
  workflowId: string
  jobId: string
  jobTitle: string
  requestedBy: string
  requestedAt: Date
  currentStep: number
  totalSteps: number
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  costEstimate?: number
  dataClassification: DataClassification
  reason: string
}

// ============================================================================
// Multi-tenant and Security
// ============================================================================

export interface BrandingConfig {
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
  faviconUrl?: string
  customCSS?: string
  companyName: string
}

export interface FeatureFlags {
  aiOptimization: boolean
  voiceCommands: boolean
  marketplace: boolean
  multiLanguage: boolean
  advancedAnalytics: boolean
  customTemplates: boolean
  bulkOperations: boolean
  scheduling: boolean
  approvalWorkflows: boolean
  costTracking: boolean
}

export interface IntegrationConfig {
  allowedIntegrations: IntegrationType[]
  webhookEndpoints: string[]
  apiRateLimit: number
  ssoEnabled: boolean
  ldapConfig?: Record<string, any>
}

export interface BillingConfig {
  plan: BillingPlan
  maxUsers: number
  maxPrintsPerMonth: number
  maxTemplates: number
  overage: {
    perUserCost: number
    perPrintCost: number
    perTemplateCost: number
  }
  billing: {
    frequency: 'MONTHLY' | 'YEARLY'
    nextBillingDate: Date
    currency: string
  }
}

export interface TenantSettings {
  branding: BrandingConfig
  features: FeatureFlags
  integrations: IntegrationConfig
  billing: BillingConfig
  compliance: ComplianceSettings
  notifications: NotificationSettings
}

export interface ComplianceSettings {
  dataRetentionDays: number
  encryptionRequired: boolean
  auditLogLevel: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE'
  gdprCompliance: boolean
  ccpaCompliance: boolean
  dataResidency?: string
}

export interface NotificationSettings {
  enabledChannels: NotificationType[]
  defaultChannel: NotificationType
  escalationDelay: number
  quietHours: {
    start: string
    end: string
    timezone: string
  }
}

// ============================================================================
// Search and Discovery
// ============================================================================

export interface SearchQuery {
  query: string
  filters?: TemplateFilters
  sort?: SortOptions
  pagination?: PaginationOptions
  facets?: string[]
}

export interface SortOptions {
  field: string
  direction: 'ASC' | 'DESC'
}

export interface PaginationOptions {
  page: number
  limit: number
}

export interface SearchResults {
  templates: TemplateSearchResult[]
  totalCount: number
  facets: SearchFacet[]
  suggestions: string[]
  searchTime: number
}

export interface TemplateSearchResult {
  id: string
  name: string
  description?: string
  type: LabelType
  size: LabelSize
  category?: string
  thumbnail?: string
  usageCount: number
  rating?: number
  isSystemDefault: boolean
  complexity: TemplateComplexity
  highlight?: Record<string, string[]>
}

export interface SearchFacet {
  field: string
  values: FacetValue[]
}

export interface FacetValue {
  value: string
  count: number
  selected: boolean
}

export interface SearchContext {
  userId: string
  householdId?: string
  tenantId?: string
  recentTemplates: string[]
  preferredCategories: string[]
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET'
}

export interface Suggestion {
  type: 'TEMPLATE' | 'CATEGORY' | 'ACTION' | 'SHORTCUT'
  title: string
  description: string
  icon?: string
  action: Record<string, any>
  confidence: number
}

export interface KeywordStats {
  keyword: string
  frequency: number
  trending: boolean
  categories: string[]
}

// ============================================================================
// Voice Interface and Accessibility
// ============================================================================

export interface VoiceCommandInput {
  command: string
  templateId?: string
  language?: string
  context?: Record<string, any>
}

export interface CommandResult {
  understood: boolean
  action: string
  parameters: Record<string, any>
  confidence: number
  alternativeInterpretations?: string[]
  executionResult?: any
}

export interface AccessibilitySettings {
  screenReader: boolean
  highContrast: boolean
  fontSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE'
  keyboardNavigation: boolean
  reduceMotion: boolean
  voiceCommands: boolean
  language: string
  customKeyBindings?: Record<string, string>
}

// ============================================================================
// Real-time Events
// ============================================================================

export interface JobStatusEvent {
  jobId: string
  oldStatus: PrintJobStatus
  newStatus: PrintJobStatus
  userId: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface PrinterStatusEvent {
  printerName: string
  isOnline: boolean
  userId?: string
  timestamp: Date
  location?: string
  errorMessage?: string
}

export interface TemplateSharedEvent {
  templateId: string
  fromUserId: string
  toUserIds: string[]
  permissions: Permission[]
  timestamp: Date
  message?: string
}

export interface ApprovalRequiredEvent {
  workflowId: string
  approverId: string
  jobTitle: string
  urgency: string
  timestamp: Date
  timeoutAt: Date
}

export interface QuotaExceededEvent {
  userId: string
  quotaType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  currentUsage: number
  limit: number
  timestamp: Date
}

export interface AnomalyAlert {
  userId: string
  type: string
  severity: SeverityLevel
  description: string
  confidence: number
  timestamp: Date
  recommendedActions: string[]
}

// ============================================================================
// Template Management
// ============================================================================

export interface GetTemplateOptions {
  includeHistory?: boolean
  includePermissions?: boolean
  includeTranslations?: boolean
  includeUsageStats?: boolean
  includeInheritanceChain?: boolean
}

export interface UpsertTemplateInput {
  id?: string
  name: string
  description?: string
  type: LabelType
  size: LabelSize
  category?: string
  xml: string
  fieldMapping?: Record<string, any>
  thumbnail?: string
  parentTemplateId?: string
  overriddenFields?: string[]
  complexity?: TemplateComplexity
  labelMediaId?: string
  locale?: string
  textDirection?: string
}

export interface DuplicateOptions {
  newName: string
  copyPermissions: boolean
  copyHistory: boolean
  makeChild: boolean
}

export interface SharePermissionInput {
  userId?: string
  householdId?: string
  roleId?: string
  permission: Permission
  conditions?: Record<string, any>
  expiresAt?: Date
}

export interface TemplateOverrides {
  name?: string
  description?: string
  xml?: string
  fieldMapping?: Record<string, any>
  overriddenFields: string[]
}

export interface MarketplaceInput {
  title: string
  description: string
  tags: string[]
  price: number
  isPublic: boolean
  category: string
}

export interface Pagination {
  page: number
  limit: number
  orderBy?: string
  orderDirection?: 'ASC' | 'DESC'
}

// ============================================================================
// Scheduling and Jobs
// ============================================================================

export interface ScheduleJobInput extends CreateJobInput {
  scheduledAt: Date
  timezone?: string
  isRecurring?: boolean
  cronExpression?: string
  maxRuns?: number
  endDate?: Date
}

export interface ScheduledJob {
  id: string
  printJobId: string
  scheduledAt: Date
  timezone: string
  isRecurring: boolean
  cronExpression?: string
  nextRun?: Date
  lastRun?: Date
  maxRuns?: number
  runCount: number
  isActive: boolean
  status: PrintJobStatus
}

// ============================================================================
// Usage Reports and Analytics
// ============================================================================

export interface UsageReport {
  tenantId: string
  period: {
    start: Date
    end: Date
  }
  metrics: {
    totalJobs: number
    totalLabels: number
    totalCost: number
    activeUsers: number
    averageJobDuration: number
    errorRate: number
  }
  breakdown: {
    byUser: UserUsage[]
    byTemplate: TemplateUsage[]
    byPrinter: PrinterUsage[]
    byDay: DailyUsage[]
  }
  quotas: {
    used: number
    limit: number
    percentage: number
  }
}

export interface UserUsage {
  userId: string
  userName: string
  jobCount: number
  labelCount: number
  cost: number
  lastActivity: Date
}

export interface DailyUsage {
  date: Date
  jobCount: number
  labelCount: number
  cost: number
  errorCount: number
}

export interface BillingPeriod {
  start: Date
  end: Date
  type: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
}

// ============================================================================
// Error Handling and Diagnostics
// ============================================================================

export interface PrintingError {
  code: string
  message: string
  severity: SeverityLevel
  timestamp: Date
  context?: Record<string, any>
  stack?: string
  recovery?: RecoveryAction[]
}

export interface RecoveryAction {
  action: string
  description: string
  automatic: boolean
  estimatedTime?: number
}

export interface DiagnosticInfo {
  systemHealth: 'HEALTHY' | 'WARNING' | 'ERROR'
  printerStatus: ConnectionStatus[]
  databaseConnection: boolean
  externalServices: ServiceStatus[]
  performance: PerformanceMetrics
  lastUpdated: Date
}

export interface ServiceStatus {
  name: string
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE'
  responseTime?: number
  lastCheck: Date
  errorMessage?: string
}

export interface PerformanceMetrics {
  averageResponseTime: number
  throughput: number
  errorRate: number
  memoryUsage: number
  cpuUsage: number
}

// ============================================================================
// Export all types
// ============================================================================

export type {
  // Enums (re-exported from Prisma)
  LabelType,
  LabelSize,
  PrintJobStatus,
  ConnectionType,
  Permission,
  AuditAction,
  IntegrationType,
  ConfigScope,
  NotificationType,
  ApprovalStatus,
  ConditionType,
  DataClassification,
  ValidationRuleType,
  TemplateComplexity,
  BillingPlan,
  ChangeType,
  SeverityLevel,
  DataType
}