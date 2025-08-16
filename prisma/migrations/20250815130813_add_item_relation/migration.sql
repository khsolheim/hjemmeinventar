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

-- CreateIndex
CREATE INDEX "ItemRelation_userId_idx" ON "ItemRelation"("userId");

-- CreateIndex
CREATE INDEX "ItemRelation_relationType_idx" ON "ItemRelation"("relationType");

-- CreateIndex
CREATE UNIQUE INDEX "ItemRelation_fromItemId_toItemId_relationType_key" ON "ItemRelation"("fromItemId", "toItemId", "relationType");

