-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "logoUrl" TEXT,
    "defaultLabelProfileId" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_defaultLabelProfileId_fkey" FOREIGN KEY ("defaultLabelProfileId") REFERENCES "LabelProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayName" TEXT,
    "type" TEXT NOT NULL,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Location_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Location_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "fieldSchema" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "totalQuantity" INTEGER NOT NULL DEFAULT 1,
    "availableQuantity" REAL NOT NULL DEFAULT 0,
    "consumedQuantity" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'stk',
    "description" TEXT,
    "imageUrl" TEXT,
    "purchaseDate" DATETIME,
    "expiryDate" DATETIME,
    "price" REAL,
    "barcode" TEXT,
    "brand" TEXT,
    "categoryData" TEXT,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    "locationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Item_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemDistribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "qrCode" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "notes" TEXT,
    "purpose" TEXT NOT NULL DEFAULT 'STORAGE',
    "reservedFor" TEXT,
    "displayInfo" TEXT,
    "itemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ItemDistribution_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemDistribution_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "userId" TEXT NOT NULL,
    "itemId" TEXT,
    "locationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Activity_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Activity_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "tenantId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Household_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "userId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "YarnPattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "patternFileUrl" TEXT,
    "imageUrls" TEXT,
    "difficulty" TEXT,
    "estimatedTime" TEXT,
    "needleSize" TEXT,
    "gauge" TEXT,
    "yarnWeight" TEXT,
    "yarnAmount" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "YarnPattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "YarnProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "progressImages" TEXT,
    "finalImages" TEXT,
    "notes" TEXT,
    "startDate" DATETIME,
    "completedDate" DATETIME,
    "patternId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "YarnProject_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "YarnPattern" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "YarnProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectYarnUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantityUsed" REAL NOT NULL,
    "notes" TEXT,
    "projectId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectYarnUsage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "YarnProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectYarnUsage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanedTo" TEXT NOT NULL,
    "contactInfo" TEXT,
    "loanDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedReturnDate" DATETIME,
    "actualReturnDate" DATETIME,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OUT',
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Loan_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filetype" TEXT NOT NULL,
    "filesize" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OTHER',
    "itemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabelProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "extraLine1" TEXT,
    "extraLine2" TEXT,
    "showUrl" BOOLEAN NOT NULL DEFAULT true,
    "logoUrl" TEXT,
    "userId" TEXT NOT NULL,
    "householdId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LabelProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LabelProfile_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HierarchyRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentType" TEXT NOT NULL,
    "childType" TEXT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "householdId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HierarchyRule_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DefaultHierarchyRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleSetName" TEXT NOT NULL,
    "parentType" TEXT NOT NULL,
    "childType" TEXT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ItemRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "relationType" TEXT NOT NULL,
    "fromItemId" TEXT NOT NULL,
    "toItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ItemRelation_fromItemId_fkey" FOREIGN KEY ("fromItemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemRelation_toItemId_fkey" FOREIGN KEY ("toItemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "customDomain" TEXT,
    "billingPlan" TEXT NOT NULL,
    "maxUsers" INTEGER NOT NULL DEFAULT 10,
    "maxPrintsPerMonth" INTEGER NOT NULL DEFAULT 1000,
    "maxTemplates" INTEGER NOT NULL DEFAULT 50,
    "settings" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionEndsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT NOT NULL,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabelMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "dymoId" TEXT NOT NULL,
    "paperName" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "widthMm" REAL,
    "heightMm" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "supportedPrinters" TEXT,
    "costPerLabel" REAL NOT NULL DEFAULT 0.0000,
    "supplier" TEXT,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" DATETIME,
    "deletedBy" TEXT,
    CONSTRAINT "LabelMedia_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LabelMedia_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LabelMedia_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LabelMedia_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabelTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "category" TEXT,
    "xml" TEXT NOT NULL,
    "fieldMapping" TEXT,
    "thumbnail" TEXT,
    "isSystemDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "version" INTEGER NOT NULL DEFAULT 1,
    "locale" TEXT NOT NULL DEFAULT 'nb-NO',
    "textDirection" TEXT NOT NULL DEFAULT 'ltr',
    "parentTemplateId" TEXT,
    "inheritanceLevel" INTEGER NOT NULL DEFAULT 0,
    "overriddenFields" TEXT,
    "complexity" TEXT NOT NULL DEFAULT 'SIMPLE',
    "estimatedRenderTime" INTEGER NOT NULL DEFAULT 100,
    "labelMediaId" TEXT,
    "userId" TEXT,
    "householdId" TEXT,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" DATETIME,
    "deletedBy" TEXT,
    CONSTRAINT "LabelTemplate_parentTemplateId_fkey" FOREIGN KEY ("parentTemplateId") REFERENCES "LabelTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LabelTemplate_labelMediaId_fkey" FOREIGN KEY ("labelMediaId") REFERENCES "LabelMedia" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LabelTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LabelTemplate_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LabelTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LabelTemplate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LabelTemplate_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LabelTemplate_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabelTemplateHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "xml" TEXT NOT NULL,
    "fieldMapping" TEXT,
    "changes" TEXT,
    "changeType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    CONSTRAINT "LabelTemplateHistory_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LabelTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LabelTemplateHistory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateInheritanceChain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childTemplateId" TEXT NOT NULL,
    "parentTemplateId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "inheritedFields" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TemplateInheritanceChain_childTemplateId_fkey" FOREIGN KEY ("childTemplateId") REFERENCES "LabelTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplatePermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "userId" TEXT,
    "householdId" TEXT,
    "roleId" TEXT,
    "permission" TEXT NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "conditions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "revokedAt" DATETIME,
    "revokedBy" TEXT,
    CONSTRAINT "TemplatePermission_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LabelTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplatePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplatePermission_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplatePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplatePermission_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TemplatePermission_revokedBy_fkey" FOREIGN KEY ("revokedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fieldLabels" TEXT,
    "translatedBy" TEXT,
    "quality" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TemplateTranslation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LabelTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplateTranslation_translatedBy_fkey" FOREIGN KEY ("translatedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateMarketplace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "price" REAL NOT NULL DEFAULT 0.0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "lastUpdatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TemplateMarketplace_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LabelTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplateMarketplace_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrinterProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "printerName" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "defaultCopies" INTEGER NOT NULL DEFAULT 1,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "connectionType" TEXT NOT NULL,
    "ipAddress" TEXT,
    "settings" TEXT,
    "lastSeenAt" DATETIME,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "locationName" TEXT,
    "floor" TEXT,
    "building" TEXT,
    "coordinates" TEXT,
    "department" TEXT,
    "userId" TEXT NOT NULL,
    "householdId" TEXT,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" DATETIME,
    "deletedBy" TEXT,
    CONSTRAINT "PrinterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrinterProfile_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrinterProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PrinterProfile_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PrinterProfile_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PrinterProfile_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrintJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobTitle" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "printerName" TEXT,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "size" TEXT,
    "payload" TEXT NOT NULL,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "dataClassification" TEXT NOT NULL DEFAULT 'INTERNAL',
    "errorMessage" TEXT,
    "failureReason" TEXT,
    "debugInfo" TEXT,
    "supportTicketId" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "estimatedDuration" INTEGER,
    "actualDuration" INTEGER,
    "scheduledAt" DATETIME,
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "costEstimate" REAL,
    "actualCost" REAL,
    "retentionPolicy" TEXT,
    "templateId" TEXT,
    "userId" TEXT NOT NULL,
    "householdId" TEXT,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdBy" TEXT,
    "deletedAt" DATETIME,
    CONSTRAINT "PrintJob_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LabelTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PrintJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrintJob_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrintJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PrintJob_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScheduledPrintJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "printJobId" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Oslo',
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "cronExpression" TEXT,
    "nextRun" DATETIME,
    "lastRun" DATETIME,
    "maxRuns" INTEGER,
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduledPrintJob_printJobId_fkey" FOREIGN KEY ("printJobId") REFERENCES "PrintJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrintApprovalWorkflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "printJobId" TEXT NOT NULL,
    "requiredApprovers" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "totalSteps" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "escalationRules" TEXT,
    "timeoutMinutes" INTEGER NOT NULL DEFAULT 1440,
    "requestedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrintApprovalWorkflow_printJobId_fkey" FOREIGN KEY ("printJobId") REFERENCES "PrintJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrintApprovalWorkflow_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrintApproval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "comments" TEXT,
    "decidedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "escalatedFrom" TEXT,
    CONSTRAINT "PrintApproval_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "PrintApprovalWorkflow" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrintApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PrintApproval_escalatedFrom_fkey" FOREIGN KEY ("escalatedFrom") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrintJobItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "printJobId" TEXT NOT NULL,
    "itemData" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "printedAt" DATETIME,
    "sequenceNumber" INTEGER NOT NULL,
    "barcode" TEXT,
    "qrCode" TEXT,
    "validationResult" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrintJobItem_printJobId_fkey" FOREIGN KEY ("printJobId") REFERENCES "PrintJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrintCondition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "conditionType" TEXT NOT NULL,
    "conditionConfig" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrintCondition_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LabelTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabelValidationRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" TEXT NOT NULL,
    "ruleConfig" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "severity" TEXT NOT NULL DEFAULT 'ERROR',
    "templateId" TEXT,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LabelValidationRule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LabelTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LabelValidationRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrintQuota" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "resetDate" DATETIME NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrintQuota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrintQuota_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrintQuota_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrintingCost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "householdId" TEXT,
    "tenantId" TEXT,
    "jobId" TEXT NOT NULL,
    "labelCount" INTEGER NOT NULL,
    "costPerLabel" REAL NOT NULL DEFAULT 0.0000,
    "totalCost" REAL NOT NULL DEFAULT 0.00,
    "currency" TEXT NOT NULL DEFAULT 'NOK',
    "billingPeriod" TEXT NOT NULL,
    "taxRate" REAL NOT NULL DEFAULT 0.25,
    "taxAmount" REAL NOT NULL DEFAULT 0.00,
    "netCost" REAL NOT NULL DEFAULT 0.00,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrintingCost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrintingCost_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrintingCost_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PrintingCost_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "PrintJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrintAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "geolocation" TEXT,
    "complianceCategory" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrintAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrintAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComplianceLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regulation" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,
    "dataType" TEXT NOT NULL,
    "retentionPeriod" INTEGER,
    "legalBasis" TEXT,
    "consentGiven" BOOLEAN,
    "anonymized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComplianceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ComplianceLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrintPatternAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "predictedUsage" INTEGER NOT NULL,
    "optimalPrintTimes" TEXT,
    "costOptimization" TEXT,
    "seasonalPatterns" TEXT,
    "anomalyDetected" BOOLEAN NOT NULL DEFAULT false,
    "confidence" REAL NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "PrintPatternAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PrintPatternAnalysis_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LabelTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PerformanceBenchmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operation" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "itemCount" INTEGER NOT NULL DEFAULT 1,
    "printerModel" TEXT,
    "templateComplexity" TEXT,
    "memoryUsage" INTEGER,
    "cpuUsage" REAL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL,
    "tenantId" TEXT,
    CONSTRAINT "PerformanceBenchmark_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "variables" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "householdId" TEXT,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotificationTemplate_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NotificationTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserNotificationPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserThemePreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "printPreviewMode" TEXT NOT NULL DEFAULT 'light',
    "customColors" TEXT,
    "fontSize" TEXT NOT NULL DEFAULT 'medium',
    "highContrast" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserThemePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoiceCommand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "command" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "templateId" TEXT,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'nb-NO',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "accuracyScore" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoiceCommand_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LabelTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VoiceCommand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchIndex" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "tenantId" TEXT,
    "searchableContent" TEXT NOT NULL,
    "keywords" TEXT,
    "boostScore" REAL NOT NULL DEFAULT 1.0,
    "lastIndexed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchIndex_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrintTestCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateId" TEXT NOT NULL,
    "testData" TEXT NOT NULL,
    "expectedOutput" TEXT,
    "assertions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" DATETIME,
    "lastRunResult" TEXT,
    "passRate" REAL NOT NULL DEFAULT 0.0,
    "executionTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrintTestCase_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LabelTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExternalIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiEndpoint" TEXT,
    "authConfig" TEXT,
    "templateMapping" TEXT,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "rateLimitPerHour" INTEGER NOT NULL DEFAULT 1000,
    "currentUsage" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" DATETIME,
    "lastError" TEXT,
    "householdId" TEXT NOT NULL,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExternalIntegration_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExternalIntegration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrintingConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "description" TEXT,
    "isUserConfigurable" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT NOT NULL DEFAULT 'GLOBAL',
    "scopeId" TEXT,
    "defaultValue" TEXT,
    "validationRule" TEXT,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_ItemTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ItemTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ItemTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ItemRelations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ItemRelations_A_fkey" FOREIGN KEY ("A") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ItemRelations_B_fkey" FOREIGN KEY ("B") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_defaultLabelProfileId_key" ON "User"("defaultLabelProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_qrCode_key" ON "Location"("qrCode");

-- CreateIndex
CREATE INDEX "Location_userId_idx" ON "Location"("userId");

-- CreateIndex
CREATE INDEX "Location_parentId_idx" ON "Location"("parentId");

-- CreateIndex
CREATE INDEX "Location_qrCode_idx" ON "Location"("qrCode");

-- CreateIndex
CREATE INDEX "Location_householdId_idx" ON "Location"("householdId");

-- CreateIndex
CREATE INDEX "Location_level_idx" ON "Location"("level");

-- CreateIndex
CREATE INDEX "Location_isWizardCreated_idx" ON "Location"("isWizardCreated");

-- CreateIndex
CREATE UNIQUE INDEX "Location_parentId_autoNumber_userId_key" ON "Location"("parentId", "autoNumber", "userId");

-- CreateIndex
CREATE INDEX "Item_userId_idx" ON "Item"("userId");

-- CreateIndex
CREATE INDEX "Item_categoryId_idx" ON "Item"("categoryId");

-- CreateIndex
CREATE INDEX "Item_locationId_idx" ON "Item"("locationId");

-- CreateIndex
CREATE INDEX "Item_expiryDate_idx" ON "Item"("expiryDate");

-- CreateIndex
CREATE INDEX "Item_barcode_idx" ON "Item"("barcode");

-- CreateIndex
CREATE INDEX "Item_availableQuantity_idx" ON "Item"("availableQuantity");

-- CreateIndex
CREATE UNIQUE INDEX "ItemDistribution_qrCode_key" ON "ItemDistribution"("qrCode");

-- CreateIndex
CREATE INDEX "ItemDistribution_itemId_idx" ON "ItemDistribution"("itemId");

-- CreateIndex
CREATE INDEX "ItemDistribution_locationId_idx" ON "ItemDistribution"("locationId");

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdMember_userId_householdId_key" ON "HouseholdMember"("userId", "householdId");

-- CreateIndex
CREATE INDEX "YarnPattern_userId_idx" ON "YarnPattern"("userId");

-- CreateIndex
CREATE INDEX "YarnProject_userId_idx" ON "YarnProject"("userId");

-- CreateIndex
CREATE INDEX "YarnProject_status_idx" ON "YarnProject"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectYarnUsage_projectId_itemId_key" ON "ProjectYarnUsage"("projectId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_itemId_key" ON "Loan"("itemId");

-- CreateIndex
CREATE INDEX "Loan_userId_status_idx" ON "Loan"("userId", "status");

-- CreateIndex
CREATE INDEX "Loan_expectedReturnDate_idx" ON "Loan"("expectedReturnDate");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_userId_key" ON "Tag"("name", "userId");

-- CreateIndex
CREATE INDEX "Attachment_itemId_idx" ON "Attachment"("itemId");

-- CreateIndex
CREATE INDEX "Attachment_type_idx" ON "Attachment"("type");

-- CreateIndex
CREATE INDEX "LabelProfile_userId_idx" ON "LabelProfile"("userId");

-- CreateIndex
CREATE INDEX "LabelProfile_householdId_idx" ON "LabelProfile"("householdId");

-- CreateIndex
CREATE INDEX "HierarchyRule_householdId_idx" ON "HierarchyRule"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "HierarchyRule_householdId_parentType_childType_key" ON "HierarchyRule"("householdId", "parentType", "childType");

-- CreateIndex
CREATE INDEX "DefaultHierarchyRule_ruleSetName_idx" ON "DefaultHierarchyRule"("ruleSetName");

-- CreateIndex
CREATE UNIQUE INDEX "DefaultHierarchyRule_ruleSetName_parentType_childType_key" ON "DefaultHierarchyRule"("ruleSetName", "parentType", "childType");

-- CreateIndex
CREATE INDEX "ItemRelation_userId_idx" ON "ItemRelation"("userId");

-- CreateIndex
CREATE INDEX "ItemRelation_relationType_idx" ON "ItemRelation"("relationType");

-- CreateIndex
CREATE UNIQUE INDEX "ItemRelation_fromItemId_toItemId_relationType_key" ON "ItemRelation"("fromItemId", "toItemId", "relationType");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_subdomain_key" ON "Tenant"("subdomain");

-- CreateIndex
CREATE INDEX "idx_tenant_active_plan" ON "Tenant"("isActive", "billingPlan");

-- CreateIndex
CREATE INDEX "Role_isSystemRole_tenantId_idx" ON "Role"("isSystemRole", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_tenantId_key" ON "Role"("name", "tenantId");

-- CreateIndex
CREATE INDEX "idx_labelmedia_search" ON "LabelMedia"("size", "isActive", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LabelMedia_code_dymoId_tenantId_key" ON "LabelMedia"("code", "dymoId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_template_user_household" ON "LabelTemplate"("userId", "householdId", "labelMediaId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_template_type_system" ON "LabelTemplate"("type", "isSystemDefault", "tenantId");

-- CreateIndex
CREATE INDEX "idx_template_category_usage" ON "LabelTemplate"("category", "usageCount", "deletedAt");

-- CreateIndex
CREATE INDEX "idx_template_inheritance" ON "LabelTemplate"("parentTemplateId", "inheritanceLevel");

-- CreateIndex
CREATE INDEX "idx_template_history_version" ON "LabelTemplateHistory"("templateId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "LabelTemplateHistory_templateId_version_key" ON "LabelTemplateHistory"("templateId", "version");

-- CreateIndex
CREATE INDEX "idx_inheritance_child_level" ON "TemplateInheritanceChain"("childTemplateId", "level");

-- CreateIndex
CREATE INDEX "idx_inheritance_parent" ON "TemplateInheritanceChain"("parentTemplateId");

-- CreateIndex
CREATE INDEX "idx_permission_template_user" ON "TemplatePermission"("templateId", "userId");

-- CreateIndex
CREATE INDEX "idx_permission_template_household" ON "TemplatePermission"("templateId", "householdId");

-- CreateIndex
CREATE INDEX "idx_permission_expiry" ON "TemplatePermission"("expiresAt", "revokedAt");

-- CreateIndex
CREATE INDEX "idx_translation_quality" ON "TemplateTranslation"("quality", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateTranslation_templateId_locale_key" ON "TemplateTranslation"("templateId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateMarketplace_templateId_key" ON "TemplateMarketplace"("templateId");

-- CreateIndex
CREATE INDEX "idx_marketplace_public_featured" ON "TemplateMarketplace"("isPublic", "isFeatured", "rating");

-- CreateIndex
CREATE INDEX "idx_marketplace_popularity" ON "TemplateMarketplace"("downloadCount", "publishedAt");

-- CreateIndex
CREATE INDEX "idx_printer_user_household" ON "PrinterProfile"("userId", "householdId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_printer_status" ON "PrinterProfile"("printerName", "isOnline");

-- CreateIndex
CREATE INDEX "idx_printer_location" ON "PrinterProfile"("locationName", "department");

-- CreateIndex
CREATE INDEX "idx_printjob_user_status" ON "PrintJob"("userId", "status", "createdAt", "tenantId");

-- CreateIndex
CREATE INDEX "idx_printjob_template" ON "PrintJob"("templateId", "status");

-- CreateIndex
CREATE INDEX "idx_printjob_queue" ON "PrintJob"("status", "priority", "scheduledAt");

-- CreateIndex
CREATE INDEX "idx_printjob_approval" ON "PrintJob"("approvalRequired", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledPrintJob_printJobId_key" ON "ScheduledPrintJob"("printJobId");

-- CreateIndex
CREATE INDEX "idx_scheduled_active" ON "ScheduledPrintJob"("scheduledAt", "isActive");

-- CreateIndex
CREATE INDEX "idx_scheduled_next_run" ON "ScheduledPrintJob"("nextRun", "isRecurring");

-- CreateIndex
CREATE UNIQUE INDEX "PrintApprovalWorkflow_printJobId_key" ON "PrintApprovalWorkflow"("printJobId");

-- CreateIndex
CREATE INDEX "idx_approval_workflow_status" ON "PrintApprovalWorkflow"("status", "currentStep");

-- CreateIndex
CREATE INDEX "idx_approval_workflow_requester" ON "PrintApprovalWorkflow"("requestedBy", "status");

-- CreateIndex
CREATE INDEX "idx_approval_workflow_approver" ON "PrintApproval"("workflowId", "approverId");

-- CreateIndex
CREATE INDEX "idx_approval_decision" ON "PrintApproval"("decidedAt", "decision");

-- CreateIndex
CREATE INDEX "idx_jobitem_sequence" ON "PrintJobItem"("printJobId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "idx_jobitem_status" ON "PrintJobItem"("printJobId", "status");

-- CreateIndex
CREATE INDEX "idx_condition_template" ON "PrintCondition"("templateId", "isActive");

-- CreateIndex
CREATE INDEX "idx_condition_type_priority" ON "PrintCondition"("conditionType", "priority");

-- CreateIndex
CREATE INDEX "idx_validation_template" ON "LabelValidationRule"("templateId", "isActive");

-- CreateIndex
CREATE INDEX "idx_validation_rule_severity" ON "LabelValidationRule"("ruleType", "severity");

-- CreateIndex
CREATE INDEX "idx_quota_household_reset" ON "PrintQuota"("householdId", "tenantId", "resetDate");

-- CreateIndex
CREATE INDEX "idx_quota_blocked" ON "PrintQuota"("isBlocked");

-- CreateIndex
CREATE UNIQUE INDEX "PrintQuota_userId_resetDate_key" ON "PrintQuota"("userId", "resetDate");

-- CreateIndex
CREATE INDEX "idx_cost_user_period" ON "PrintingCost"("userId", "billingPeriod", "tenantId");

-- CreateIndex
CREATE INDEX "idx_cost_household_period" ON "PrintingCost"("householdId", "billingPeriod");

-- CreateIndex
CREATE INDEX "idx_audit_user_action" ON "PrintAuditLog"("userId", "action", "createdAt", "tenantId");

-- CreateIndex
CREATE INDEX "idx_audit_resource" ON "PrintAuditLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "idx_audit_risk_compliance" ON "PrintAuditLog"("riskScore", "complianceCategory");

-- CreateIndex
CREATE INDEX "idx_compliance_regulation_user" ON "ComplianceLog"("regulation", "userId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_compliance_retention" ON "ComplianceLog"("retentionPeriod", "anonymized");

-- CreateIndex
CREATE INDEX "idx_pattern_user_template" ON "PrintPatternAnalysis"("userId", "templateId", "generatedAt");

-- CreateIndex
CREATE INDEX "idx_pattern_confidence" ON "PrintPatternAnalysis"("confidence", "anomalyDetected");

-- CreateIndex
CREATE INDEX "idx_benchmark_operation" ON "PerformanceBenchmark"("operation", "timestamp", "version");

-- CreateIndex
CREATE INDEX "idx_benchmark_complexity" ON "PerformanceBenchmark"("templateComplexity", "duration");

-- CreateIndex
CREATE UNIQUE INDEX "UserThemePreference_userId_key" ON "UserThemePreference"("userId");

-- CreateIndex
CREATE INDEX "idx_search_resource" ON "SearchIndex"("resourceType", "resourceId", "tenantId");

-- CreateIndex
CREATE INDEX "idx_search_boost" ON "SearchIndex"("boostScore");

-- CreateIndex
CREATE INDEX "idx_config_category" ON "PrintingConfig"("category", "isUserConfigurable");

-- CreateIndex
CREATE UNIQUE INDEX "PrintingConfig_key_scope_scopeId_key" ON "PrintingConfig"("key", "scope", "scopeId");

-- CreateIndex
CREATE UNIQUE INDEX "_ItemTags_AB_unique" ON "_ItemTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ItemTags_B_index" ON "_ItemTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ItemRelations_AB_unique" ON "_ItemRelations"("A", "B");

-- CreateIndex
CREATE INDEX "_ItemRelations_B_index" ON "_ItemRelations"("B");
