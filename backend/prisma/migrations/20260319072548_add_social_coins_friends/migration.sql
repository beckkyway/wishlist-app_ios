-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ORG');

-- CreateEnum
CREATE TYPE "WishlistVisibility" AS ENUM ('PRIVATE', 'FRIENDS', 'PUBLIC');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "CoinTxType" AS ENUM ('SIGNUP_BONUS', 'SENT', 'RECEIVED', 'DONATED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "coinTarget" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "coinBalance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN     "visibility" "WishlistVisibility" NOT NULL DEFAULT 'PRIVATE';

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinTransaction" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "CoinTxType" NOT NULL,
    "description" TEXT,
    "relatedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoinTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinDonation" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "donorId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoinDonation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Friendship_receiverId_idx" ON "Friendship"("receiverId");

-- CreateIndex
CREATE INDEX "Friendship_senderId_idx" ON "Friendship"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_senderId_receiverId_key" ON "Friendship"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "CoinTransaction_ownerId_createdAt_idx" ON "CoinTransaction"("ownerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CoinDonation_itemId_idx" ON "CoinDonation"("itemId");

-- CreateIndex
CREATE INDEX "CoinDonation_donorId_idx" ON "CoinDonation"("donorId");

-- CreateIndex
CREATE INDEX "Wishlist_visibility_idx" ON "Wishlist"("visibility");

-- CreateIndex
CREATE INDEX "Wishlist_ownerId_idx" ON "Wishlist"("ownerId");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoinDonation" ADD CONSTRAINT "CoinDonation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoinDonation" ADD CONSTRAINT "CoinDonation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
