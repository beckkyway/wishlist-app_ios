-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "shareToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL(10,2),
    "url" TEXT,
    "imageUrl" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "isReserved" BOOLEAN NOT NULL DEFAULT false,
    "targetAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "wishlistId" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_shareToken_key" ON "Wishlist"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_itemId_key" ON "Reservation"("itemId");

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
