-- CreateEnum
CREATE TYPE "public"."LocationType" AS ENUM ('ROOM', 'CABINET', 'SHELF', 'BOX', 'BAG', 'DRAWER', 'RACK', 'WALL_SHELF', 'CONTAINER', 'SHELF_COMPARTMENT', 'SECTION');

-- CreateEnum
CREATE TYPE "public"."DistributionPurpose" AS ENUM ('STORAGE', 'DISPLAY', 'RESERVED', 'WORK');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('ITEM_CREATED', 'ITEM_UPDATED', 'ITEM_MOVED', 'ITEM_DELETED', 'LOCATION_CREATED', 'LOCATION_UPDATED', 'LOCATION_DELETED', 'LOCATION_MOVED', 'QR_SCANNED', 'BULK_OPERATION', 'WIZARD_LOCATION_CREATED', 'WIZARD_HIERARCHY_BUILT', 'LOAN_CREATED', 'LOAN_RETURNED', 'HOUSEHOLD_CREATED', 'HOUSEHOLD_UPDATED', 'HOUSEHOLD_DELETED', 'HOUSEHOLD_LEFT', 'HOUSEHOLD_MEMBER_ADDED', 'HOUSEHOLD_MEMBER_REMOVED', 'HOUSEHOLD_MEMBER_ROLE_UPDATED', 'SYSTEM_NOTIFICATION', 'ANALYTICS_GENERATED');

-- CreateEnum
CREATE TYPE "public"."HouseholdRole" AS ENUM ('ADMIN', 'MEMBER', 'READONLY');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PatternDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "public"."AttachmentType" AS ENUM ('RECEIPT', 'WARRANTY', 'MANUAL', 'PHOTO', 'CERTIFICATE', 'INVOICE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."LoanStatus" AS ENUM ('OUT', 'RETURNED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "public"."RelationType" AS ENUM ('MASTER_OF', 'BATCH_OF', 'COLOR_OF', 'CHILD_OF', 'ATTACHMENT_OF');

-- CreateEnum
CREATE TYPE "public"."LabelType" AS ENUM ('QR', 'BARCODE', 'CUSTOM', 'DYNAMIC');

-- CreateEnum
CREATE TYPE "public"."LabelSize" AS ENUM ('SMALL', 'STANDARD', 'LARGE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."PrintJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'RETRYING', 'SCHEDULED', 'PENDING_APPROVAL');

-- CreateEnum
CREATE TYPE "public"."ConnectionType" AS ENUM ('USB', 'NETWORK', 'BLUETOOTH', 'CLOUD');

-- CreateEnum
CREATE TYPE "public"."Permission" AS ENUM ('READ', 'WRITE', 'DELETE', 'SHARE', 'APPROVE', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('TEMPLATE_CREATED', 'TEMPLATE_UPDATED', 'TEMPLATE_DELETED', 'JOB_PRINTED', 'JOB_CANCELLED', 'JOB_SCHEDULED', 'APPROVAL_GRANTED', 'APPROVAL_DENIED', 'SETTINGS_CHANGED', 'USER_LOGIN', 'DATA_EXPORTED');

-- CreateEnum
CREATE TYPE "public"."IntegrationType" AS ENUM ('INVENTORY_SYSTEM', 'ERP', 'WAREHOUSE', 'WMS', 'CRM', 'API_WEBHOOK');

-- CreateEnum
CREATE TYPE "public"."ConfigScope" AS ENUM ('GLOBAL', 'TENANT', 'HOUSEHOLD', 'USER');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'WEBHOOK', 'SLACK');

-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "public"."ConditionType" AS ENUM ('FIELD_VALUE', 'TIME_RANGE', 'USER_ROLE', 'INVENTORY_LEVEL', 'COST_THRESHOLD');

-- CreateEnum
CREATE TYPE "public"."DataClassification" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "public"."ValidationRuleType" AS ENUM ('BARCODE_FORMAT', 'QR_CONTENT', 'FIELD_REQUIRED', 'LENGTH_CHECK', 'REGEX_PATTERN');

-- CreateEnum
CREATE TYPE "public"."TemplateComplexity" AS ENUM ('SIMPLE', 'MEDIUM', 'COMPLEX', 'DYNAMIC');

-- CreateEnum
CREATE TYPE "public"."BillingPlan" AS ENUM ('FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."ChangeType" AS ENUM ('CREATED', 'UPDATED', 'REVERTED', 'INHERITED', 'MIGRATED');

-- CreateEnum
CREATE TYPE "public"."SeverityLevel" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."DataType" AS ENUM ('STRING', 'INTEGER', 'BOOLEAN', 'JSON', 'ENCRYPTED', 'DECIMAL');

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "logoUrl" TEXT,
    "defaultLabelProfileId" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayName" TEXT,
    "type" "public"."LocationType" NOT NULL,
    "qrCode" TEXT NOT NULL,
    "parentId" TEXT,
    "autoNumber" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "isWizardCreated" BOOLEAN NOT NULL DEFAULT false,
    "wizardOrder" INTEGER,
    "images" TEXT,
    "primaryImage" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "allowedUsers" TEXT,
    "colorCode" TEXT,
    "tags" TEXT,
    "householdId" TEXT,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "fieldSchema" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalQuantity" INTEGER NOT NULL DEFAULT 1,
    "availableQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "consumedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'stk',
    "description" TEXT,
    "imageUrl" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "price" DOUBLE PRECISION,
    "barcode" TEXT,
    "brand" TEXT,
    "categoryData" TEXT,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ItemDistribution" (
    "id" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "purpose" "public"."DistributionPurpose" NOT NULL DEFAULT 'STORAGE',
    "reservedFor" TEXT,
    "displayInfo" TEXT,
    "itemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "type" "public"."ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "userId" TEXT NOT NULL,
    "itemId" TEXT,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Household" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "tenantId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HouseholdMember" (
    "id" TEXT NOT NULL,
    "role" "public"."HouseholdRole" NOT NULL DEFAULT 'MEMBER',
    "userId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."YarnPattern" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "patternFileUrl" TEXT,
    "imageUrls" TEXT,
    "difficulty" "public"."PatternDifficulty",
    "estimatedTime" TEXT,
    "needleSize" TEXT,
    "gauge" TEXT,
    "yarnWeight" TEXT,
    "yarnAmount" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YarnPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."YarnProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'PLANNED',
    "progressImages" TEXT,
    "finalImages" TEXT,
    "notes" TEXT,
    "startDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "patternId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YarnProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectYarnUsage" (
    "id" TEXT NOT NULL,
    "quantityUsed" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "projectId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectYarnUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Loan" (
    "id" TEXT NOT NULL,
    "loanedTo" TEXT NOT NULL,
    "contactInfo" TEXT,
    "loanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedReturnDate" TIMESTAMP(3),
    "actualReturnDate" TIMESTAMP(3),
    "notes" TEXT,
    "status" "public"."LoanStatus" NOT NULL DEFAULT 'OUT',
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attachment" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filetype" TEXT NOT NULL,
    "filesize" INTEGER NOT NULL,
    "type" "public"."AttachmentType" NOT NULL DEFAULT 'OTHER',
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabelProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "extraLine1" TEXT,
    "extraLine2" TEXT,
    "showUrl" BOOLEAN NOT NULL DEFAULT true,
    "logoUrl" TEXT,
    "userId" TEXT NOT NULL,
    "householdId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabelProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HierarchyRule" (
    "id" TEXT NOT NULL,
    "parentType" "public"."LocationType" NOT NULL,
    "childType" "public"."LocationType" NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "householdId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HierarchyRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DefaultHierarchyRule" (
    "id" TEXT NOT NULL,
    "ruleSetName" TEXT NOT NULL,
    "parentType" "public"."LocationType" NOT NULL,
    "childType" "public"."LocationType" NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DefaultHierarchyRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ItemRelation" (
    "id" TEXT NOT NULL,
    "relationType" "public"."RelationType" NOT NULL,
    "fromItemId" TEXT NOT NULL,
    "toItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "customDomain" TEXT,
    "billingPlan" "public"."BillingPlan" NOT NULL,
    "maxUsers" INTEGER NOT NULL DEFAULT 10,
    "maxPrintsPerMonth" INTEGER NOT NULL DEFAULT 1000,
    "maxTemplates" INTEGER NOT NULL DEFAULT 50,
    "settings" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT NOT NULL,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabelMedia" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "dymoId" TEXT NOT NULL,
    "paperName" TEXT NOT NULL,
    "size" "public"."LabelSize" NOT NULL,
    "widthMm" DOUBLE PRECISION,
    "heightMm" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "supportedPrinters" TEXT,
    "costPerLabel" DOUBLE PRECISION NOT NULL DEFAULT 0.0000,
    "supplier" TEXT,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "LabelMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabelTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."LabelType" NOT NULL,
    "size" "public"."LabelSize" NOT NULL,
    "category" TEXT,
    "xml" TEXT NOT NULL,
    "fieldMapping" TEXT,
    "thumbnail" TEXT,
    "isSystemDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "locale" TEXT NOT NULL DEFAULT 'nb-NO',
    "textDirection" TEXT NOT NULL DEFAULT 'ltr',
    "parentTemplateId" TEXT,
    "inheritanceLevel" INTEGER NOT NULL DEFAULT 0,
    "overriddenFields" TEXT,
    "complexity" "public"."TemplateComplexity" NOT NULL DEFAULT 'SIMPLE',
    "estimatedRenderTime" INTEGER NOT NULL DEFAULT 100,
    "labelMediaId" TEXT,
    "userId" TEXT,
    "householdId" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "LabelTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabelTemplateHistory" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "xml" TEXT NOT NULL,
    "fieldMapping" TEXT,
    "changes" TEXT,
    "changeType" "public"."ChangeType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "LabelTemplateHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TemplateInheritanceChain" (
    "id" TEXT NOT NULL,
    "childTemplateId" TEXT NOT NULL,
    "parentTemplateId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "inheritedFields" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateInheritanceChain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TemplatePermission" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "userId" TEXT,
    "householdId" TEXT,
    "roleId" TEXT,
    "permission" "public"."Permission" NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "conditions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,

    CONSTRAINT "TemplatePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TemplateTranslation" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fieldLabels" TEXT,
    "translatedBy" TEXT,
    "quality" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TemplateMarketplace" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "lastUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateMarketplace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrinterProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "printerName" TEXT NOT NULL,
    "size" "public"."LabelSize" NOT NULL,
    "defaultCopies" INTEGER NOT NULL DEFAULT 1,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "connectionType" "public"."ConnectionType" NOT NULL,
    "ipAddress" TEXT,
    "settings" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "locationName" TEXT,
    "floor" TEXT,
    "building" TEXT,
    "coordinates" TEXT,
    "department" TEXT,
    "userId" TEXT NOT NULL,
    "householdId" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "PrinterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrintJob" (
    "id" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "type" "public"."LabelType" NOT NULL,
    "status" "public"."PrintJobStatus" NOT NULL DEFAULT 'QUEUED',
    "printerName" TEXT,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "size" "public"."LabelSize",
    "payload" TEXT NOT NULL,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "dataClassification" "public"."DataClassification" NOT NULL DEFAULT 'INTERNAL',
    "errorMessage" TEXT,
    "failureReason" TEXT,
    "debugInfo" TEXT,
    "supportTicketId" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "estimatedDuration" INTEGER,
    "actualDuration" INTEGER,
    "scheduledAt" TIMESTAMP(3),
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "costEstimate" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "retentionPolicy" TEXT,
    "templateId" TEXT,
    "userId" TEXT NOT NULL,
    "householdId" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScheduledPrintJob" (
    "id" TEXT NOT NULL,
    "printJobId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Oslo',
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "cronExpression" TEXT,
    "nextRun" TIMESTAMP(3),
    "lastRun" TIMESTAMP(3),
    "maxRuns" INTEGER,
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledPrintJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrintApprovalWorkflow" (
    "id" TEXT NOT NULL,
    "printJobId" TEXT NOT NULL,
    "requiredApprovers" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "totalSteps" INTEGER NOT NULL,
    "status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "escalationRules" TEXT,
    "timeoutMinutes" INTEGER NOT NULL DEFAULT 1440,
    "requestedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintApprovalWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrintApproval" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "decision" "public"."ApprovalStatus" NOT NULL,
    "comments" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "escalatedFrom" TEXT,

    CONSTRAINT "PrintApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrintJobItem" (
    "id" TEXT NOT NULL,
    "printJobId" TEXT NOT NULL,
    "itemData" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "printedAt" TIMESTAMP(3),
    "sequenceNumber" INTEGER NOT NULL,
    "barcode" TEXT,
    "qrCode" TEXT,
    "validationResult" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintJobItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrintCondition" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "conditionType" "public"."ConditionType" NOT NULL,
    "conditionConfig" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabelValidationRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" "public"."ValidationRuleType" NOT NULL,
    "ruleConfig" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "severity" "public"."SeverityLevel" NOT NULL DEFAULT 'ERROR',
    "templateId" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabelValidationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrintQuota" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "householdId" TEXT,
    "tenantId" TEXT,
    "dailyLimit" INTEGER NOT NULL DEFAULT 100,
    "weeklyLimit" INTEGER NOT NULL DEFAULT 500,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 1000,
    "yearlyLimit" INTEGER,
    "currentDailyUsage" INTEGER NOT NULL DEFAULT 0,
    "currentWeeklyUsage" INTEGER NOT NULL DEFAULT 0,
    "currentMonthlyUsage" INTEGER NOT NULL DEFAULT 0,
    "currentYearlyUsage" INTEGER NOT NULL DEFAULT 0,
    "resetDate" TIMESTAMP(3) NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintQuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrintingCost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "householdId" TEXT,
    "tenantId" TEXT,
    "jobId" TEXT NOT NULL,
    "labelCount" INTEGER NOT NULL,
    "costPerLabel" DOUBLE PRECISION NOT NULL DEFAULT 0.0000,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "currency" TEXT NOT NULL DEFAULT 'NOK',
    "billingPeriod" TEXT NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "netCost" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintingCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrintAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,
    "action" "public"."AuditAction" NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "geolocation" TEXT,
    "complianceCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ComplianceLog" (
    "id" TEXT NOT NULL,
    "regulation" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,
    "dataType" TEXT NOT NULL,
    "retentionPeriod" INTEGER,
    "legalBasis" TEXT,
    "consentGiven" BOOLEAN,
    "anonymized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrintPatternAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "predictedUsage" INTEGER NOT NULL,
    "optimalPrintTimes" TEXT,
    "costOptimization" TEXT,
    "seasonalPatterns" TEXT,
    "anomalyDetected" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintPatternAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PerformanceBenchmark" (
    "id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "itemCount" INTEGER NOT NULL DEFAULT 1,
    "printerModel" TEXT,
    "templateComplexity" "public"."TemplateComplexity",
    "memoryUsage" INTEGER,
    "cpuUsage" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "PerformanceBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "trigger" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "variables" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "householdId" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserNotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "channel" "public"."NotificationType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserThemePreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "printPreviewMode" TEXT NOT NULL DEFAULT 'light',
    "customColors" TEXT,
    "fontSize" TEXT NOT NULL DEFAULT 'medium',
    "highContrast" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserThemePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoiceCommand" (
    "id" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "templateId" TEXT,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'nb-NO',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "accuracyScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceCommand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SearchIndex" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "tenantId" TEXT,
    "searchableContent" TEXT NOT NULL,
    "keywords" TEXT,
    "boostScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "lastIndexed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrintTestCase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateId" TEXT NOT NULL,
    "testData" TEXT NOT NULL,
    "expectedOutput" TEXT,
    "assertions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "lastRunResult" TEXT,
    "passRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "executionTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExternalIntegration" (
    "id" TEXT NOT NULL,
    "type" "public"."IntegrationType" NOT NULL,
    "name" TEXT NOT NULL,
    "apiEndpoint" TEXT,
    "authConfig" TEXT,
    "templateMapping" TEXT,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "rateLimitPerHour" INTEGER NOT NULL DEFAULT 1000,
    "currentUsage" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "householdId" TEXT NOT NULL,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrintingConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" "public"."DataType" NOT NULL,
    "description" TEXT,
    "isUserConfigurable" BOOLEAN NOT NULL DEFAULT false,
    "scope" "public"."ConfigScope" NOT NULL DEFAULT 'GLOBAL',
    "scopeId" TEXT,
    "defaultValue" TEXT,
    "validationRule" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ItemTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ItemTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ItemRelations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ItemRelations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_defaultLabelProfileId_key" ON "public"."User"("defaultLabelProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_qrCode_key" ON "public"."Location"("qrCode");

-- CreateIndex
CREATE INDEX "Location_userId_idx" ON "public"."Location"("userId");

-- CreateIndex
CREATE INDEX "Location_parentId_idx" ON "public"."Location"("parentId");

-- CreateIndex
CREATE INDEX "Location_qrCode_idx" ON "public"."Location"("qrCode");

-- CreateIndex
CREATE INDEX "Location_householdId_idx" ON "public"."Location"("householdId");

-- CreateIndex
CREATE INDEX "Location_level_idx" ON "public"."Location"("level");

-- CreateIndex
CREATE INDEX "Location_isWizardCreated_idx" ON "public"."Location"("isWizardCreated");

-- CreateIndex
CREATE UNIQUE INDEX "Location_parentId_autoNumber_userId_key" ON "public"."Location"("parentId", "autoNumber", "userId");

-- CreateIndex
CREATE INDEX "Item_userId_idx" ON "public"."Item"("userId");

-- CreateIndex
CREATE INDEX "Item_categoryId_idx" ON "public"."Item"("categoryId");

-- CreateIndex
CREATE INDEX "Item_locationId_idx" ON "public"."Item"("locationId");

-- CreateIndex
CREATE INDEX "Item_expiryDate_idx" ON "public"."Item"("expiryDate");

-- CreateIndex
CREATE INDEX "Item_barcode_idx" ON "public"."Item"("barcode");

-- CreateIndex
CREATE INDEX "Item_availableQuantity_idx" ON "public"."Item"("availableQuantity");

-- CreateIndex
CREATE UNIQUE INDEX "ItemDistribution_qrCode_key" ON "public"."ItemDistribution"("qrCode");

-- CreateIndex
CREATE INDEX "ItemDistribution_itemId_idx" ON "public"."ItemDistribution"("itemId");

-- CreateIndex
CREATE INDEX "ItemDistribution_locationId_idx" ON "public"."ItemDistribution"("locationId");

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "public"."Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "public"."Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "public"."Activity"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdMember_userId_householdId_key" ON "public"."HouseholdMember"("userId", "householdId");

-- CreateIndex
CREATE INDEX "YarnPattern_userId_idx" ON "public"."YarnPattern"("userId");

-- CreateIndex
CREATE INDEX "YarnProject_userId_idx" ON "public"."YarnProject"("userId");

-- CreateIndex
CREATE INDEX "YarnProject_status_idx" ON "public"."YarnProject"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectYarnUsage_projectId_itemId_key" ON "public"."ProjectYarnUsage"("projectId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_itemId_key" ON "public"."Loan"("itemId");

-- CreateIndex
CREATE INDEX "Loan_userId_status_idx" ON "public"."Loan"("userId", "status");

-- CreateIndex
CREATE INDEX "Loan_expectedReturnDate_idx" ON "public"."Loan"("expectedReturnDate");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "public"."Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_userId_key" ON "public"."Tag"("name", "userId");

-- CreateIndex
CREATE INDEX "Attachment_itemId_idx" ON "public"."Attachment"("itemId");

-- CreateIndex
CREATE INDEX "Attachment_type_idx" ON "public"."Attachment"("type");

-- CreateIndex
CREATE INDEX "LabelProfile_userId_idx" ON "public"."LabelProfile"("userId");

-- CreateIndex
CREATE INDEX "LabelProfile_householdId_idx" ON "public"."LabelProfile"("householdId");

-- CreateIndex
CREATE INDEX "HierarchyRule_householdId_idx" ON "public"."HierarchyRule"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "HierarchyRule_householdId_parentType_childType_key" ON "public"."HierarchyRule"("householdId", "parentType", "childType");

-- CreateIndex
CREATE INDEX "DefaultHierarchyRule_ruleSetName_idx" ON "public"."DefaultHierarchyRule"("ruleSetName");

-- CreateIndex
CREATE UNIQUE INDEX "DefaultHierarchyRule_ruleSetName_parentType_childType_key" ON "public"."DefaultHierarchyRule"("ruleSetName", "parentType", "childType");

-- CreateIndex
CREATE INDEX "ItemRelation_userId_idx" ON "public"."ItemRelation"("userId");

-- CreateIndex
CREATE INDEX "ItemRelation_relationType_idx" ON "public"."ItemRelation"("relationType");

-- CreateIndex
CREATE UNIQUE INDEX "ItemRelation_fromItemId_toItemId_relationType_key" ON "public"."ItemRelation"("fromItemId", "toItemId", "relationType");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_subdomain_key" ON "public"."Tenant"("subdomain");

-- CreateIndex
CREATE INDEX "idx_tenant_active_plan" ON "public"."Tenant"("isActive", "billingPlan");

-- CreateIndex
CREATE INDEX "Role_isSystemRole_tenantId_idx" ON "public"."Role"("isSystemRole", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_tenantId_key" ON "public"."Role"("name", "tenantId");

-- CreateIndex
CREATE INDEX "idx_labelmedia_search" ON "public"."LabelMedia"("size", "isActive", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LabelMedia_code_dymoId_tenantId_key" ON "public"."LabelMedia"("code", "dymoId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_template_user_household" ON "public"."LabelTemplate"("userId", "householdId", "labelMediaId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_template_type_system" ON "public"."LabelTemplate"("type", "isSystemDefault", "tenantId");

-- CreateIndex
CREATE INDEX "idx_template_category_usage" ON "public"."LabelTemplate"("category", "usageCount", "deletedAt");

-- CreateIndex
CREATE INDEX "idx_template_inheritance" ON "public"."LabelTemplate"("parentTemplateId", "inheritanceLevel");

-- CreateIndex
CREATE INDEX "idx_template_history_version" ON "public"."LabelTemplateHistory"("templateId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "LabelTemplateHistory_templateId_version_key" ON "public"."LabelTemplateHistory"("templateId", "version");

-- CreateIndex
CREATE INDEX "idx_inheritance_child_level" ON "public"."TemplateInheritanceChain"("childTemplateId", "level");

-- CreateIndex
CREATE INDEX "idx_inheritance_parent" ON "public"."TemplateInheritanceChain"("parentTemplateId");

-- CreateIndex
CREATE INDEX "idx_permission_template_user" ON "public"."TemplatePermission"("templateId", "userId");

-- CreateIndex
CREATE INDEX "idx_permission_template_household" ON "public"."TemplatePermission"("templateId", "householdId");

-- CreateIndex
CREATE INDEX "idx_permission_expiry" ON "public"."TemplatePermission"("expiresAt", "revokedAt");

-- CreateIndex
CREATE INDEX "idx_translation_quality" ON "public"."TemplateTranslation"("quality", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateTranslation_templateId_locale_key" ON "public"."TemplateTranslation"("templateId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateMarketplace_templateId_key" ON "public"."TemplateMarketplace"("templateId");

-- CreateIndex
CREATE INDEX "idx_marketplace_public_featured" ON "public"."TemplateMarketplace"("isPublic", "isFeatured", "rating");

-- CreateIndex
CREATE INDEX "idx_marketplace_popularity" ON "public"."TemplateMarketplace"("downloadCount", "publishedAt");

-- CreateIndex
CREATE INDEX "idx_printer_user_household" ON "public"."PrinterProfile"("userId", "householdId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_printer_status" ON "public"."PrinterProfile"("printerName", "isOnline");

-- CreateIndex
CREATE INDEX "idx_printer_location" ON "public"."PrinterProfile"("locationName", "department");

-- CreateIndex
CREATE INDEX "idx_printjob_user_status" ON "public"."PrintJob"("userId", "status", "createdAt", "tenantId");

-- CreateIndex
CREATE INDEX "idx_printjob_template" ON "public"."PrintJob"("templateId", "status");

-- CreateIndex
CREATE INDEX "idx_printjob_queue" ON "public"."PrintJob"("status", "priority", "scheduledAt");

-- CreateIndex
CREATE INDEX "idx_printjob_approval" ON "public"."PrintJob"("approvalRequired", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledPrintJob_printJobId_key" ON "public"."ScheduledPrintJob"("printJobId");

-- CreateIndex
CREATE INDEX "idx_scheduled_active" ON "public"."ScheduledPrintJob"("scheduledAt", "isActive");

-- CreateIndex
CREATE INDEX "idx_scheduled_next_run" ON "public"."ScheduledPrintJob"("nextRun", "isRecurring");

-- CreateIndex
CREATE UNIQUE INDEX "PrintApprovalWorkflow_printJobId_key" ON "public"."PrintApprovalWorkflow"("printJobId");

-- CreateIndex
CREATE INDEX "idx_approval_workflow_status" ON "public"."PrintApprovalWorkflow"("status", "currentStep");

-- CreateIndex
CREATE INDEX "idx_approval_workflow_requester" ON "public"."PrintApprovalWorkflow"("requestedBy", "status");

-- CreateIndex
CREATE INDEX "idx_approval_workflow_approver" ON "public"."PrintApproval"("workflowId", "approverId");

-- CreateIndex
CREATE INDEX "idx_approval_decision" ON "public"."PrintApproval"("decidedAt", "decision");

-- CreateIndex
CREATE INDEX "idx_jobitem_sequence" ON "public"."PrintJobItem"("printJobId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "idx_jobitem_status" ON "public"."PrintJobItem"("printJobId", "status");

-- CreateIndex
CREATE INDEX "idx_condition_template" ON "public"."PrintCondition"("templateId", "isActive");

-- CreateIndex
CREATE INDEX "idx_condition_type_priority" ON "public"."PrintCondition"("conditionType", "priority");

-- CreateIndex
CREATE INDEX "idx_validation_template" ON "public"."LabelValidationRule"("templateId", "isActive");

-- CreateIndex
CREATE INDEX "idx_validation_rule_severity" ON "public"."LabelValidationRule"("ruleType", "severity");

-- CreateIndex
CREATE INDEX "idx_quota_household_reset" ON "public"."PrintQuota"("householdId", "tenantId", "resetDate");

-- CreateIndex
CREATE INDEX "idx_quota_blocked" ON "public"."PrintQuota"("isBlocked");

-- CreateIndex
CREATE UNIQUE INDEX "PrintQuota_userId_resetDate_key" ON "public"."PrintQuota"("userId", "resetDate");

-- CreateIndex
CREATE INDEX "idx_cost_user_period" ON "public"."PrintingCost"("userId", "billingPeriod", "tenantId");

-- CreateIndex
CREATE INDEX "idx_cost_household_period" ON "public"."PrintingCost"("householdId", "billingPeriod");

-- CreateIndex
CREATE INDEX "idx_audit_user_action" ON "public"."PrintAuditLog"("userId", "action", "createdAt", "tenantId");

-- CreateIndex
CREATE INDEX "idx_audit_resource" ON "public"."PrintAuditLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "idx_audit_risk_compliance" ON "public"."PrintAuditLog"("riskScore", "complianceCategory");

-- CreateIndex
CREATE INDEX "idx_compliance_regulation_user" ON "public"."ComplianceLog"("regulation", "userId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_compliance_retention" ON "public"."ComplianceLog"("retentionPeriod", "anonymized");

-- CreateIndex
CREATE INDEX "idx_pattern_user_template" ON "public"."PrintPatternAnalysis"("userId", "templateId", "generatedAt");

-- CreateIndex
CREATE INDEX "idx_pattern_confidence" ON "public"."PrintPatternAnalysis"("confidence", "anomalyDetected");

-- CreateIndex
CREATE INDEX "idx_benchmark_operation" ON "public"."PerformanceBenchmark"("operation", "timestamp", "version");

-- CreateIndex
CREATE INDEX "idx_benchmark_complexity" ON "public"."PerformanceBenchmark"("templateComplexity", "duration");

-- CreateIndex
CREATE UNIQUE INDEX "UserThemePreference_userId_key" ON "public"."UserThemePreference"("userId");

-- CreateIndex
CREATE INDEX "idx_search_resource" ON "public"."SearchIndex"("resourceType", "resourceId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_search_boost" ON "public"."SearchIndex"("boostScore");

-- CreateIndex
CREATE INDEX "idx_config_category" ON "public"."PrintingConfig"("category", "isUserConfigurable");

-- CreateIndex
CREATE UNIQUE INDEX "PrintingConfig_key_scope_scopeId_key" ON "public"."PrintingConfig"("key", "scope", "scopeId");

-- CreateIndex
CREATE INDEX "_ItemTags_B_index" ON "public"."_ItemTags"("B");

-- CreateIndex
CREATE INDEX "_ItemRelations_B_index" ON "public"."_ItemRelations"("B");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_defaultLabelProfileId_fkey" FOREIGN KEY ("defaultLabelProfileId") REFERENCES "public"."LabelProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemDistribution" ADD CONSTRAINT "ItemDistribution_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemDistribution" ADD CONSTRAINT "ItemDistribution_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Household" ADD CONSTRAINT "Household_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HouseholdMember" ADD CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HouseholdMember" ADD CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."YarnPattern" ADD CONSTRAINT "YarnPattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."YarnProject" ADD CONSTRAINT "YarnProject_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "public"."YarnPattern"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."YarnProject" ADD CONSTRAINT "YarnProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectYarnUsage" ADD CONSTRAINT "ProjectYarnUsage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."YarnProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectYarnUsage" ADD CONSTRAINT "ProjectYarnUsage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Loan" ADD CONSTRAINT "Loan_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelProfile" ADD CONSTRAINT "LabelProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelProfile" ADD CONSTRAINT "LabelProfile_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HierarchyRule" ADD CONSTRAINT "HierarchyRule_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemRelation" ADD CONSTRAINT "ItemRelation_fromItemId_fkey" FOREIGN KEY ("fromItemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemRelation" ADD CONSTRAINT "ItemRelation_toItemId_fkey" FOREIGN KEY ("toItemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemRelation" ADD CONSTRAINT "ItemRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelMedia" ADD CONSTRAINT "LabelMedia_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelMedia" ADD CONSTRAINT "LabelMedia_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelMedia" ADD CONSTRAINT "LabelMedia_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelMedia" ADD CONSTRAINT "LabelMedia_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelTemplate" ADD CONSTRAINT "LabelTemplate_parentTemplateId_fkey" FOREIGN KEY ("parentTemplateId") REFERENCES "public"."LabelTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelTemplate" ADD CONSTRAINT "LabelTemplate_labelMediaId_fkey" FOREIGN KEY ("labelMediaId") REFERENCES "public"."LabelMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelTemplate" ADD CONSTRAINT "LabelTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelTemplate" ADD CONSTRAINT "LabelTemplate_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelTemplate" ADD CONSTRAINT "LabelTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelTemplate" ADD CONSTRAINT "LabelTemplate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelTemplate" ADD CONSTRAINT "LabelTemplate_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelTemplate" ADD CONSTRAINT "LabelTemplate_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelTemplateHistory" ADD CONSTRAINT "LabelTemplateHistory_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."LabelTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelTemplateHistory" ADD CONSTRAINT "LabelTemplateHistory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateInheritanceChain" ADD CONSTRAINT "TemplateInheritanceChain_childTemplateId_fkey" FOREIGN KEY ("childTemplateId") REFERENCES "public"."LabelTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplatePermission" ADD CONSTRAINT "TemplatePermission_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."LabelTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplatePermission" ADD CONSTRAINT "TemplatePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplatePermission" ADD CONSTRAINT "TemplatePermission_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplatePermission" ADD CONSTRAINT "TemplatePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplatePermission" ADD CONSTRAINT "TemplatePermission_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplatePermission" ADD CONSTRAINT "TemplatePermission_revokedBy_fkey" FOREIGN KEY ("revokedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateTranslation" ADD CONSTRAINT "TemplateTranslation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."LabelTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateTranslation" ADD CONSTRAINT "TemplateTranslation_translatedBy_fkey" FOREIGN KEY ("translatedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateMarketplace" ADD CONSTRAINT "TemplateMarketplace_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."LabelTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateMarketplace" ADD CONSTRAINT "TemplateMarketplace_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrinterProfile" ADD CONSTRAINT "PrinterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrinterProfile" ADD CONSTRAINT "PrinterProfile_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrinterProfile" ADD CONSTRAINT "PrinterProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrinterProfile" ADD CONSTRAINT "PrinterProfile_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrinterProfile" ADD CONSTRAINT "PrinterProfile_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrinterProfile" ADD CONSTRAINT "PrinterProfile_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintJob" ADD CONSTRAINT "PrintJob_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."LabelTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintJob" ADD CONSTRAINT "PrintJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintJob" ADD CONSTRAINT "PrintJob_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintJob" ADD CONSTRAINT "PrintJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintJob" ADD CONSTRAINT "PrintJob_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduledPrintJob" ADD CONSTRAINT "ScheduledPrintJob_printJobId_fkey" FOREIGN KEY ("printJobId") REFERENCES "public"."PrintJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintApprovalWorkflow" ADD CONSTRAINT "PrintApprovalWorkflow_printJobId_fkey" FOREIGN KEY ("printJobId") REFERENCES "public"."PrintJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintApprovalWorkflow" ADD CONSTRAINT "PrintApprovalWorkflow_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintApproval" ADD CONSTRAINT "PrintApproval_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."PrintApprovalWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintApproval" ADD CONSTRAINT "PrintApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintApproval" ADD CONSTRAINT "PrintApproval_escalatedFrom_fkey" FOREIGN KEY ("escalatedFrom") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintJobItem" ADD CONSTRAINT "PrintJobItem_printJobId_fkey" FOREIGN KEY ("printJobId") REFERENCES "public"."PrintJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintCondition" ADD CONSTRAINT "PrintCondition_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."LabelTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelValidationRule" ADD CONSTRAINT "LabelValidationRule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."LabelTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabelValidationRule" ADD CONSTRAINT "LabelValidationRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintQuota" ADD CONSTRAINT "PrintQuota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintQuota" ADD CONSTRAINT "PrintQuota_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintQuota" ADD CONSTRAINT "PrintQuota_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintingCost" ADD CONSTRAINT "PrintingCost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintingCost" ADD CONSTRAINT "PrintingCost_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintingCost" ADD CONSTRAINT "PrintingCost_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintingCost" ADD CONSTRAINT "PrintingCost_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."PrintJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintAuditLog" ADD CONSTRAINT "PrintAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintAuditLog" ADD CONSTRAINT "PrintAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComplianceLog" ADD CONSTRAINT "ComplianceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComplianceLog" ADD CONSTRAINT "ComplianceLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintPatternAnalysis" ADD CONSTRAINT "PrintPatternAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintPatternAnalysis" ADD CONSTRAINT "PrintPatternAnalysis_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."LabelTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PerformanceBenchmark" ADD CONSTRAINT "PerformanceBenchmark_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationTemplate" ADD CONSTRAINT "NotificationTemplate_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationTemplate" ADD CONSTRAINT "NotificationTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserNotificationPreference" ADD CONSTRAINT "UserNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserThemePreference" ADD CONSTRAINT "UserThemePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoiceCommand" ADD CONSTRAINT "VoiceCommand_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."LabelTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoiceCommand" ADD CONSTRAINT "VoiceCommand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SearchIndex" ADD CONSTRAINT "SearchIndex_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintTestCase" ADD CONSTRAINT "PrintTestCase_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."LabelTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExternalIntegration" ADD CONSTRAINT "ExternalIntegration_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExternalIntegration" ADD CONSTRAINT "ExternalIntegration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ItemTags" ADD CONSTRAINT "_ItemTags_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ItemTags" ADD CONSTRAINT "_ItemTags_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ItemRelations" ADD CONSTRAINT "_ItemRelations_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ItemRelations" ADD CONSTRAINT "_ItemRelations_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
