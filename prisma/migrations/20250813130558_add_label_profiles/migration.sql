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

-- CreateIndex
CREATE INDEX "LabelProfile_userId_idx" ON "LabelProfile"("userId");

-- CreateIndex
CREATE INDEX "LabelProfile_householdId_idx" ON "LabelProfile"("householdId");
