-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemDistribution" (
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
INSERT INTO "new_ItemDistribution" ("createdAt", "displayInfo", "id", "itemId", "locationId", "notes", "purpose", "qrCode", "quantity", "reservedFor", "updatedAt") SELECT "createdAt", "displayInfo", "id", "itemId", "locationId", "notes", "purpose", "qrCode", "quantity", "reservedFor", "updatedAt" FROM "ItemDistribution";
DROP TABLE "ItemDistribution";
ALTER TABLE "new_ItemDistribution" RENAME TO "ItemDistribution";
CREATE UNIQUE INDEX "ItemDistribution_qrCode_key" ON "ItemDistribution"("qrCode");
CREATE INDEX "ItemDistribution_itemId_idx" ON "ItemDistribution"("itemId");
CREATE INDEX "ItemDistribution_locationId_idx" ON "ItemDistribution"("locationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
