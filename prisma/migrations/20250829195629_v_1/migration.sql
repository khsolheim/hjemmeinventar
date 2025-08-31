/*
  Warnings:

  - The values [LOCATION_UPDATED,LOCATION_DELETED,LOCATION_MOVED,WIZARD_LOCATION_CREATED,WIZARD_HIERARCHY_BUILT,HOUSEHOLD_UPDATED,HOUSEHOLD_DELETED,HOUSEHOLD_LEFT,HOUSEHOLD_MEMBER_ADDED,HOUSEHOLD_MEMBER_REMOVED,HOUSEHOLD_MEMBER_ROLE_UPDATED,SYSTEM_NOTIFICATION,ANALYTICS_GENERATED] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.
  - The values [CLOUD] on the enum `ConnectionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [CHILD_OF,ATTACHMENT_OF] on the enum `RelationType` will be removed. If these variants are still used in the database, this will fail.
  - The `metadata` column on the `Activity` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fieldSchema` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isActive` on the `Household` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Household` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `Household` table. All the data in the column will be lost.
  - You are about to alter the column `availableQuantity` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `consumedQuantity` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `price` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - The `categoryData` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `qrCode` on the `ItemDistribution` table. All the data in the column will be lost.
  - You are about to alter the column `quantity` on the `ItemDistribution` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The `displayInfo` column on the `ItemDistribution` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `allowedUsers` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `autoNumber` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `colorCode` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `householdId` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `isPrivate` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `isWizardCreated` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `primaryImage` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `wizardOrder` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `actualCost` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `actualDuration` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `approvalRequired` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `copies` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `costEstimate` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `dataClassification` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `debugInfo` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDuration` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `failureReason` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `finishedAt` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `householdId` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `isEncrypted` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `jobTitle` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `maxRetries` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `payload` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `printerName` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `retentionPolicy` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `retryCount` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `supportTicketId` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PrintJob` table. All the data in the column will be lost.
  - The `type` column on the `PrintJob` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `PrintJob` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `quantityUsed` on the `ProjectYarnUsage` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `defaultLabelProfileId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `User` table. All the data in the column will be lost.
  - The `imageUrls` column on the `YarnPattern` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `progressImages` column on the `YarnProject` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `finalImages` column on the `YarnProject` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ComplianceLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DefaultHierarchyRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExternalIntegration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HierarchyRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LabelMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LabelProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LabelTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LabelTemplateHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LabelValidationRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PerformanceBenchmark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrintApproval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrintApprovalWorkflow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrintAuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrintCondition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrintJobItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrintPatternAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrintQuota` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrintTestCase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrinterProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrintingConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrintingCost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduledPrintJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SearchIndex` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateInheritanceChain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateMarketplace` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplatePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tenant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserNotificationPreference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserThemePreference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VoiceCommand` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `printerId` to the `PrintJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `PrintJob` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PrinterBrand" AS ENUM ('DYMO', 'ZEBRA', 'BROTHER', 'HP', 'GENERIC');

-- CreateEnum
CREATE TYPE "public"."PrinterStatus" AS ENUM ('ONLINE', 'OFFLINE', 'ERROR', 'LOW_PAPER', 'LOW_INK', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."PrintJobType" AS ENUM ('LABEL', 'QR_CODE', 'BARCODE', 'TEST');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('PENDING', 'PRINTING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ActivityType_new" AS ENUM ('ITEM_CREATED', 'ITEM_UPDATED', 'ITEM_MOVED', 'ITEM_DELETED', 'LOCATION_CREATED', 'HOUSEHOLD_CREATED', 'QR_SCANNED', 'BULK_OPERATION', 'LOAN_CREATED', 'LOAN_RETURNED');
ALTER TABLE "public"."Activity" ALTER COLUMN "type" TYPE "public"."ActivityType_new" USING ("type"::text::"public"."ActivityType_new");
ALTER TYPE "public"."ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "public"."ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "public"."ActivityType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ConnectionType_new" AS ENUM ('USB', 'NETWORK', 'BLUETOOTH');
ALTER TABLE "public"."Printer" ALTER COLUMN "connectionType" TYPE "public"."ConnectionType_new" USING ("connectionType"::text::"public"."ConnectionType_new");
ALTER TYPE "public"."ConnectionType" RENAME TO "ConnectionType_old";
ALTER TYPE "public"."ConnectionType_new" RENAME TO "ConnectionType";
DROP TYPE "public"."ConnectionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."RelationType_new" AS ENUM ('MASTER_OF', 'BATCH_OF', 'REMNANT_OF', 'RELATED_TO', 'COLOR_OF');
ALTER TABLE "public"."ItemRelation" ALTER COLUMN "relationType" TYPE "public"."RelationType_new" USING ("relationType"::text::"public"."RelationType_new");
ALTER TYPE "public"."RelationType" RENAME TO "RelationType_old";
ALTER TYPE "public"."RelationType_new" RENAME TO "RelationType";
DROP TYPE "public"."RelationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."ComplianceLog" DROP CONSTRAINT "ComplianceLog_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ComplianceLog" DROP CONSTRAINT "ComplianceLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExternalIntegration" DROP CONSTRAINT "ExternalIntegration_householdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExternalIntegration" DROP CONSTRAINT "ExternalIntegration_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HierarchyRule" DROP CONSTRAINT "HierarchyRule_householdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Household" DROP CONSTRAINT "Household_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelMedia" DROP CONSTRAINT "LabelMedia_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelMedia" DROP CONSTRAINT "LabelMedia_deletedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelMedia" DROP CONSTRAINT "LabelMedia_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelMedia" DROP CONSTRAINT "LabelMedia_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelProfile" DROP CONSTRAINT "LabelProfile_householdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelProfile" DROP CONSTRAINT "LabelProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelTemplate" DROP CONSTRAINT "LabelTemplate_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelTemplate" DROP CONSTRAINT "LabelTemplate_deletedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelTemplate" DROP CONSTRAINT "LabelTemplate_householdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelTemplate" DROP CONSTRAINT "LabelTemplate_labelMediaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelTemplate" DROP CONSTRAINT "LabelTemplate_parentTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelTemplate" DROP CONSTRAINT "LabelTemplate_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelTemplate" DROP CONSTRAINT "LabelTemplate_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelTemplate" DROP CONSTRAINT "LabelTemplate_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelTemplateHistory" DROP CONSTRAINT "LabelTemplateHistory_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelTemplateHistory" DROP CONSTRAINT "LabelTemplateHistory_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelValidationRule" DROP CONSTRAINT "LabelValidationRule_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabelValidationRule" DROP CONSTRAINT "LabelValidationRule_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Location" DROP CONSTRAINT "Location_householdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NotificationTemplate" DROP CONSTRAINT "NotificationTemplate_householdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NotificationTemplate" DROP CONSTRAINT "NotificationTemplate_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PerformanceBenchmark" DROP CONSTRAINT "PerformanceBenchmark_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintApproval" DROP CONSTRAINT "PrintApproval_approverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintApproval" DROP CONSTRAINT "PrintApproval_escalatedFrom_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintApproval" DROP CONSTRAINT "PrintApproval_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintApprovalWorkflow" DROP CONSTRAINT "PrintApprovalWorkflow_printJobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintApprovalWorkflow" DROP CONSTRAINT "PrintApprovalWorkflow_requestedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintAuditLog" DROP CONSTRAINT "PrintAuditLog_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintAuditLog" DROP CONSTRAINT "PrintAuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintCondition" DROP CONSTRAINT "PrintCondition_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintJob" DROP CONSTRAINT "PrintJob_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintJob" DROP CONSTRAINT "PrintJob_householdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintJob" DROP CONSTRAINT "PrintJob_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintJob" DROP CONSTRAINT "PrintJob_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintJobItem" DROP CONSTRAINT "PrintJobItem_printJobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintPatternAnalysis" DROP CONSTRAINT "PrintPatternAnalysis_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintPatternAnalysis" DROP CONSTRAINT "PrintPatternAnalysis_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintQuota" DROP CONSTRAINT "PrintQuota_householdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintQuota" DROP CONSTRAINT "PrintQuota_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintQuota" DROP CONSTRAINT "PrintQuota_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintTestCase" DROP CONSTRAINT "PrintTestCase_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrinterProfile" DROP CONSTRAINT "PrinterProfile_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrinterProfile" DROP CONSTRAINT "PrinterProfile_deletedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrinterProfile" DROP CONSTRAINT "PrinterProfile_householdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrinterProfile" DROP CONSTRAINT "PrinterProfile_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrinterProfile" DROP CONSTRAINT "PrinterProfile_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrinterProfile" DROP CONSTRAINT "PrinterProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintingCost" DROP CONSTRAINT "PrintingCost_householdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintingCost" DROP CONSTRAINT "PrintingCost_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintingCost" DROP CONSTRAINT "PrintingCost_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintingCost" DROP CONSTRAINT "PrintingCost_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Role" DROP CONSTRAINT "Role_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ScheduledPrintJob" DROP CONSTRAINT "ScheduledPrintJob_printJobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SearchIndex" DROP CONSTRAINT "SearchIndex_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplateInheritanceChain" DROP CONSTRAINT "TemplateInheritanceChain_childTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplateMarketplace" DROP CONSTRAINT "TemplateMarketplace_publisherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplateMarketplace" DROP CONSTRAINT "TemplateMarketplace_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplatePermission" DROP CONSTRAINT "TemplatePermission_grantedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplatePermission" DROP CONSTRAINT "TemplatePermission_householdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplatePermission" DROP CONSTRAINT "TemplatePermission_revokedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplatePermission" DROP CONSTRAINT "TemplatePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplatePermission" DROP CONSTRAINT "TemplatePermission_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplatePermission" DROP CONSTRAINT "TemplatePermission_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplateTranslation" DROP CONSTRAINT "TemplateTranslation_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplateTranslation" DROP CONSTRAINT "TemplateTranslation_translatedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_defaultLabelProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserNotificationPreference" DROP CONSTRAINT "UserNotificationPreference_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserThemePreference" DROP CONSTRAINT "UserThemePreference_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoiceCommand" DROP CONSTRAINT "VoiceCommand_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoiceCommand" DROP CONSTRAINT "VoiceCommand_userId_fkey";

-- DropIndex
DROP INDEX "public"."ItemDistribution_qrCode_key";

-- DropIndex
DROP INDEX "public"."ItemRelation_relationType_idx";

-- DropIndex
DROP INDEX "public"."Location_householdId_idx";

-- DropIndex
DROP INDEX "public"."Location_isWizardCreated_idx";

-- DropIndex
DROP INDEX "public"."Location_level_idx";

-- DropIndex
DROP INDEX "public"."Location_parentId_autoNumber_userId_key";

-- DropIndex
DROP INDEX "public"."idx_printjob_approval";

-- DropIndex
DROP INDEX "public"."idx_printjob_queue";

-- DropIndex
DROP INDEX "public"."idx_printjob_template";

-- DropIndex
DROP INDEX "public"."idx_printjob_user_status";

-- DropIndex
DROP INDEX "public"."User_defaultLabelProfileId_key";

-- AlterTable
ALTER TABLE "public"."Activity" DROP COLUMN "metadata",
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "fieldSchema",
ADD COLUMN     "fieldSchema" JSONB;

-- AlterTable
ALTER TABLE "public"."Household" DROP COLUMN "isActive",
DROP COLUMN "ownerId",
DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "public"."Item" ALTER COLUMN "availableQuantity" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "consumedQuantity" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
DROP COLUMN "categoryData",
ADD COLUMN     "categoryData" JSONB;

-- AlterTable
ALTER TABLE "public"."ItemDistribution" DROP COLUMN "qrCode",
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(65,30),
DROP COLUMN "displayInfo",
ADD COLUMN     "displayInfo" JSONB;

-- AlterTable
ALTER TABLE "public"."Location" DROP COLUMN "allowedUsers",
DROP COLUMN "autoNumber",
DROP COLUMN "colorCode",
DROP COLUMN "displayName",
DROP COLUMN "householdId",
DROP COLUMN "images",
DROP COLUMN "isActive",
DROP COLUMN "isPrivate",
DROP COLUMN "isWizardCreated",
DROP COLUMN "level",
DROP COLUMN "primaryImage",
DROP COLUMN "tags",
DROP COLUMN "wizardOrder";

-- AlterTable
ALTER TABLE "public"."PrintJob" DROP COLUMN "actualCost",
DROP COLUMN "actualDuration",
DROP COLUMN "approvalRequired",
DROP COLUMN "copies",
DROP COLUMN "costEstimate",
DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "dataClassification",
DROP COLUMN "debugInfo",
DROP COLUMN "deletedAt",
DROP COLUMN "estimatedDuration",
DROP COLUMN "failureReason",
DROP COLUMN "finishedAt",
DROP COLUMN "householdId",
DROP COLUMN "isEncrypted",
DROP COLUMN "jobTitle",
DROP COLUMN "maxRetries",
DROP COLUMN "payload",
DROP COLUMN "printerName",
DROP COLUMN "priority",
DROP COLUMN "retentionPolicy",
DROP COLUMN "retryCount",
DROP COLUMN "scheduledAt",
DROP COLUMN "size",
DROP COLUMN "supportTicketId",
DROP COLUMN "templateId",
DROP COLUMN "tenantId",
DROP COLUMN "updatedAt",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "itemId" TEXT,
ADD COLUMN     "labelData" JSONB,
ADD COLUMN     "labelXml" TEXT,
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "printerId" TEXT NOT NULL,
ADD COLUMN     "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "title" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."PrintJobType" NOT NULL DEFAULT 'LABEL',
DROP COLUMN "status",
ADD COLUMN     "status" "public"."JobStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."ProjectYarnUsage" ALTER COLUMN "quantityUsed" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "defaultLabelProfileId",
DROP COLUMN "isActive",
DROP COLUMN "logoUrl",
DROP COLUMN "role",
DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "public"."YarnPattern" DROP COLUMN "imageUrls",
ADD COLUMN     "imageUrls" TEXT[];

-- AlterTable
ALTER TABLE "public"."YarnProject" DROP COLUMN "progressImages",
ADD COLUMN     "progressImages" TEXT[],
DROP COLUMN "finalImages",
ADD COLUMN     "finalImages" TEXT[];

-- DropTable
DROP TABLE "public"."ComplianceLog";

-- DropTable
DROP TABLE "public"."DefaultHierarchyRule";

-- DropTable
DROP TABLE "public"."ExternalIntegration";

-- DropTable
DROP TABLE "public"."HierarchyRule";

-- DropTable
DROP TABLE "public"."LabelMedia";

-- DropTable
DROP TABLE "public"."LabelProfile";

-- DropTable
DROP TABLE "public"."LabelTemplate";

-- DropTable
DROP TABLE "public"."LabelTemplateHistory";

-- DropTable
DROP TABLE "public"."LabelValidationRule";

-- DropTable
DROP TABLE "public"."NotificationTemplate";

-- DropTable
DROP TABLE "public"."PerformanceBenchmark";

-- DropTable
DROP TABLE "public"."PrintApproval";

-- DropTable
DROP TABLE "public"."PrintApprovalWorkflow";

-- DropTable
DROP TABLE "public"."PrintAuditLog";

-- DropTable
DROP TABLE "public"."PrintCondition";

-- DropTable
DROP TABLE "public"."PrintJobItem";

-- DropTable
DROP TABLE "public"."PrintPatternAnalysis";

-- DropTable
DROP TABLE "public"."PrintQuota";

-- DropTable
DROP TABLE "public"."PrintTestCase";

-- DropTable
DROP TABLE "public"."PrinterProfile";

-- DropTable
DROP TABLE "public"."PrintingConfig";

-- DropTable
DROP TABLE "public"."PrintingCost";

-- DropTable
DROP TABLE "public"."Role";

-- DropTable
DROP TABLE "public"."ScheduledPrintJob";

-- DropTable
DROP TABLE "public"."SearchIndex";

-- DropTable
DROP TABLE "public"."TemplateInheritanceChain";

-- DropTable
DROP TABLE "public"."TemplateMarketplace";

-- DropTable
DROP TABLE "public"."TemplatePermission";

-- DropTable
DROP TABLE "public"."TemplateTranslation";

-- DropTable
DROP TABLE "public"."Tenant";

-- DropTable
DROP TABLE "public"."UserNotificationPreference";

-- DropTable
DROP TABLE "public"."UserThemePreference";

-- DropTable
DROP TABLE "public"."VoiceCommand";

-- DropEnum
DROP TYPE "public"."ApprovalStatus";

-- DropEnum
DROP TYPE "public"."AuditAction";

-- DropEnum
DROP TYPE "public"."BillingPlan";

-- DropEnum
DROP TYPE "public"."ChangeType";

-- DropEnum
DROP TYPE "public"."ConditionType";

-- DropEnum
DROP TYPE "public"."ConfigScope";

-- DropEnum
DROP TYPE "public"."DataClassification";

-- DropEnum
DROP TYPE "public"."DataType";

-- DropEnum
DROP TYPE "public"."IntegrationType";

-- DropEnum
DROP TYPE "public"."LabelSize";

-- DropEnum
DROP TYPE "public"."LabelType";

-- DropEnum
DROP TYPE "public"."NotificationType";

-- DropEnum
DROP TYPE "public"."Permission";

-- DropEnum
DROP TYPE "public"."PrintJobStatus";

-- DropEnum
DROP TYPE "public"."SeverityLevel";

-- DropEnum
DROP TYPE "public"."TemplateComplexity";

-- DropEnum
DROP TYPE "public"."ValidationRuleType";

-- CreateTable
CREATE TABLE "public"."LabelSize" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "widthMm" INTEGER NOT NULL,
    "heightMm" INTEGER NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabelSize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Printer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "brand" "public"."PrinterBrand" NOT NULL DEFAULT 'DYMO',
    "connectionType" "public"."ConnectionType" NOT NULL DEFAULT 'NETWORK',
    "ipAddress" TEXT,
    "port" TEXT,
    "macAddress" TEXT,
    "location" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "maxWidth" DOUBLE PRECISION,
    "resolution" INTEGER,
    "supportedMedia" TEXT[],
    "settings" JSONB,
    "lastSeen" TIMESTAMP(3),
    "paperLevel" INTEGER,
    "status" "public"."PrinterStatus" NOT NULL DEFAULT 'UNKNOWN',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Printer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LabelSize_userId_idx" ON "public"."LabelSize"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LabelSize_name_userId_key" ON "public"."LabelSize"("name", "userId");

-- CreateIndex
CREATE INDEX "Printer_userId_idx" ON "public"."Printer"("userId");

-- CreateIndex
CREATE INDEX "Printer_brand_idx" ON "public"."Printer"("brand");

-- CreateIndex
CREATE INDEX "Printer_isActive_idx" ON "public"."Printer"("isActive");

-- CreateIndex
CREATE INDEX "ItemRelation_fromItemId_idx" ON "public"."ItemRelation"("fromItemId");

-- CreateIndex
CREATE INDEX "ItemRelation_toItemId_idx" ON "public"."ItemRelation"("toItemId");

-- CreateIndex
CREATE INDEX "PrintJob_userId_idx" ON "public"."PrintJob"("userId");

-- CreateIndex
CREATE INDEX "PrintJob_printerId_idx" ON "public"."PrintJob"("printerId");

-- CreateIndex
CREATE INDEX "PrintJob_status_idx" ON "public"."PrintJob"("status");

-- AddForeignKey
ALTER TABLE "public"."LabelSize" ADD CONSTRAINT "LabelSize_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Printer" ADD CONSTRAINT "Printer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintJob" ADD CONSTRAINT "PrintJob_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "public"."Printer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintJob" ADD CONSTRAINT "PrintJob_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrintJob" ADD CONSTRAINT "PrintJob_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
