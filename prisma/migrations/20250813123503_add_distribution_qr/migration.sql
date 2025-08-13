/*
  Warnings:

  - Added the required column `qrCode` to the `ItemDistribution` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemDistribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "qrCode" TEXT NOT NULL DEFAULT ('D-' || substr(hex(randomblob(8)), 1, 8)),
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
-- Migrate existing rows and set a generated qrCode for them
INSERT INTO "new_ItemDistribution" ("createdAt", "displayInfo", "id", "itemId", "locationId", "notes", "purpose", "quantity", "reservedFor", "updatedAt", "qrCode")
SELECT "createdAt", "displayInfo", "id", "itemId", "locationId", "notes", "purpose", "quantity", "reservedFor", "updatedAt",
       ('D-' || substr(hex(randomblob(8)), 1, 8))
FROM "ItemDistribution";
DROP TABLE "ItemDistribution";
ALTER TABLE "new_ItemDistribution" RENAME TO "ItemDistribution";
CREATE UNIQUE INDEX "ItemDistribution_qrCode_key" ON "ItemDistribution"("qrCode");
CREATE INDEX "ItemDistribution_itemId_idx" ON "ItemDistribution"("itemId");
CREATE INDEX "ItemDistribution_locationId_idx" ON "ItemDistribution"("locationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
