-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "joinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "coinTarget" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "GroupItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupDonation" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "donorId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupDonation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_joinCode_key" ON "Group"("joinCode");

-- CreateIndex
CREATE INDEX "Group_creatorId_idx" ON "Group"("creatorId");

-- CreateIndex
CREATE INDEX "GroupMembership_groupId_idx" ON "GroupMembership"("groupId");

-- CreateIndex
CREATE INDEX "GroupMembership_userId_idx" ON "GroupMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMembership_userId_groupId_key" ON "GroupMembership"("userId", "groupId");

-- CreateIndex
CREATE INDEX "GroupItem_groupId_idx" ON "GroupItem"("groupId");

-- CreateIndex
CREATE INDEX "GroupDonation_itemId_idx" ON "GroupDonation"("itemId");

-- CreateIndex
CREATE INDEX "GroupDonation_donorId_idx" ON "GroupDonation"("donorId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupItem" ADD CONSTRAINT "GroupItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupDonation" ADD CONSTRAINT "GroupDonation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupDonation" ADD CONSTRAINT "GroupDonation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "GroupItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
