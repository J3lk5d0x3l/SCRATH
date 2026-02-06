-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "discriminator" TEXT,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GuildSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT '!',
    "language" TEXT NOT NULL DEFAULT 'es',
    "loggingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GuildSettings_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GuildMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "guildId" TEXT,
    "value" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeatureFlag_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Warning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moderatorId" TEXT,
    "reason" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Ban" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moderatorId" TEXT,
    "reason" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_discordId_key" ON "Guild"("discordId");

-- CreateIndex
CREATE INDEX "Guild_createdAt_idx" ON "Guild"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GuildSettings_guildId_key" ON "GuildSettings"("guildId");

-- CreateIndex
CREATE INDEX "GuildSettings_guildId_idx" ON "GuildSettings"("guildId");

-- CreateIndex
CREATE INDEX "GuildMember_guildId_idx" ON "GuildMember"("guildId");

-- CreateIndex
CREATE INDEX "GuildMember_userId_idx" ON "GuildMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_guildId_userId_key" ON "GuildMember"("guildId", "userId");

-- CreateIndex
CREATE INDEX "AuditLog_guildId_idx" ON "AuditLog"("guildId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_name_key" ON "FeatureFlag"("name");

-- CreateIndex
CREATE INDEX "FeatureFlag_enabled_idx" ON "FeatureFlag"("enabled");

-- CreateIndex
CREATE INDEX "FeatureFlag_guildId_idx" ON "FeatureFlag"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_name_guildId_key" ON "FeatureFlag"("name", "guildId");

-- CreateIndex
CREATE INDEX "Warning_guildId_idx" ON "Warning"("guildId");

-- CreateIndex
CREATE INDEX "Warning_userId_idx" ON "Warning"("userId");

-- CreateIndex
CREATE INDEX "Warning_active_idx" ON "Warning"("active");

-- CreateIndex
CREATE INDEX "Warning_createdAt_idx" ON "Warning"("createdAt");

-- CreateIndex
CREATE INDEX "Ban_guildId_idx" ON "Ban"("guildId");

-- CreateIndex
CREATE INDEX "Ban_userId_idx" ON "Ban"("userId");

-- CreateIndex
CREATE INDEX "Ban_active_idx" ON "Ban"("active");

-- CreateIndex
CREATE INDEX "Ban_createdAt_idx" ON "Ban"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "State_key_key" ON "State"("key");

-- CreateIndex
CREATE INDEX "State_expiresAt_idx" ON "State"("expiresAt");
