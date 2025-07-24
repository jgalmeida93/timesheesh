-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "hourlyRate" REAL NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("createdAt", "id", "name", "updatedAt", "userId") SELECT "createdAt", "id", "name", "updatedAt", "userId" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_name_userId_key" ON "Project"("name", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
