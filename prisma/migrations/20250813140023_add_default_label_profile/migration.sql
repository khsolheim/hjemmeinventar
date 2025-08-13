-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "logoUrl" TEXT,
    "defaultLabelProfileId" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_defaultLabelProfileId_fkey" FOREIGN KEY ("defaultLabelProfileId") REFERENCES "LabelProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "image", "logoUrl", "name", "password", "updatedAt") SELECT "createdAt", "email", "id", "image", "logoUrl", "name", "password", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_defaultLabelProfileId_key" ON "User"("defaultLabelProfileId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
