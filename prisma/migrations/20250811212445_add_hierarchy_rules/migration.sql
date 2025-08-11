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

-- CreateIndex
CREATE INDEX "HierarchyRule_householdId_idx" ON "HierarchyRule"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "HierarchyRule_householdId_parentType_childType_key" ON "HierarchyRule"("householdId", "parentType", "childType");

-- CreateIndex
CREATE INDEX "DefaultHierarchyRule_ruleSetName_idx" ON "DefaultHierarchyRule"("ruleSetName");

-- CreateIndex
CREATE UNIQUE INDEX "DefaultHierarchyRule_ruleSetName_parentType_childType_key" ON "DefaultHierarchyRule"("ruleSetName", "parentType", "childType");
