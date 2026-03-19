import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pwd: string) => bcrypt.hash(pwd, 10);

  // Create test users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@test.com' },
    update: {},
    create: {
      email: 'alice@test.com',
      passwordHash: await hash('test123'),
      name: 'Алиса Иванова',
      coinBalance: 500,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@test.com' },
    update: {},
    create: {
      email: 'bob@test.com',
      passwordHash: await hash('test123'),
      name: 'Боб Петров',
      coinBalance: 300,
    },
  });

  const kate = await prisma.user.upsert({
    where: { email: 'kate@test.com' },
    update: {},
    create: {
      email: 'kate@test.com',
      passwordHash: await hash('test123'),
      name: 'Катя Смирнова',
      coinBalance: 800,
    },
  });

  // Alice — День рождения wishlist
  const aliceBday = await prisma.wishlist.upsert({
    where: { shareToken: 'seed-alice-bday' },
    update: {},
    create: {
      title: 'День рождения',
      description: 'Мне исполняется 25! Буду рада любому подарку',
      occasion: 'День рождения',
      visibility: 'PUBLIC',
      shareToken: 'seed-alice-bday',
      ownerId: alice.id,
    },
  });

  await prisma.item.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'AirPods Pro 2',
        price: 24990,
        priority: 'MUST_HAVE',
        coinTarget: 500,
        description: 'Белые, с шумоподавлением',
        imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=400&hei=400&fmt=jpeg',
        wishlistId: aliceBday.id,
      },
      {
        title: 'Книга "Мастер и Маргарита"',
        price: 890,
        priority: 'NORMAL',
        description: 'Юбилейное издание в твёрдой обложке',
        wishlistId: aliceBday.id,
      },
      {
        title: 'Сертификат в SPA-салон',
        price: 5000,
        priority: 'DREAM',
        description: 'На 2 часа, любой салон в центре',
        wishlistId: aliceBday.id,
      },
    ],
  });

  // Alice — Новый год wishlist
  const aliceNY = await prisma.wishlist.upsert({
    where: { shareToken: 'seed-alice-ny' },
    update: {},
    create: {
      title: 'Новый год',
      visibility: 'PUBLIC',
      shareToken: 'seed-alice-ny',
      ownerId: alice.id,
    },
  });

  await prisma.item.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Уютный плед (серый)',
        price: 2500,
        priority: 'NORMAL',
        description: 'Желательно серый или бежевый, большой размер',
        wishlistId: aliceNY.id,
      },
      {
        title: 'Кофемашина De\'Longhi Dedica',
        price: 35000,
        priority: 'DREAM',
        coinTarget: 700,
        description: 'Серебристая, для эспрессо',
        wishlistId: aliceNY.id,
      },
    ],
  });

  // Bob — Геймерский wishlist
  const bobGaming = await prisma.wishlist.upsert({
    where: { shareToken: 'seed-bob-gaming' },
    update: {},
    create: {
      title: 'Геймерский уголок',
      description: 'Хочу апгрейд своего сетапа',
      visibility: 'PUBLIC',
      shareToken: 'seed-bob-gaming',
      ownerId: bob.id,
    },
  });

  await prisma.item.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Механическая клавиатура Keychron K3',
        price: 8900,
        priority: 'MUST_HAVE',
        description: 'Switch: Brown, с подсветкой',
        wishlistId: bobGaming.id,
      },
      {
        title: 'Игровая мышь Logitech G Pro X Superlight',
        price: 7500,
        priority: 'NORMAL',
        wishlistId: bobGaming.id,
      },
      {
        title: 'PlayStation 5',
        price: 59999,
        priority: 'DREAM',
        coinTarget: 1200,
        description: 'Мечта всей жизни!',
        wishlistId: bobGaming.id,
      },
    ],
  });

  // Kate — Путешествие wishlist
  const kateTravel = await prisma.wishlist.upsert({
    where: { shareToken: 'seed-kate-travel' },
    update: {},
    create: {
      title: 'Путешествие в Японию',
      description: 'Еду в мае, нужно всё для поездки',
      occasion: 'Выпускной',
      visibility: 'PUBLIC',
      shareToken: 'seed-kate-travel',
      ownerId: kate.id,
    },
  });

  await prisma.item.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Чемодан Samsonite Cosmolite',
        price: 28000,
        priority: 'MUST_HAVE',
        description: '55 см, серебристый',
        wishlistId: kateTravel.id,
      },
      {
        title: 'GoPro Hero 13 Black',
        price: 35000,
        priority: 'DREAM',
        coinTarget: 700,
        description: 'Для съёмки путешествий',
        wishlistId: kateTravel.id,
      },
      {
        title: 'Японский разговорник Berlitz',
        price: 650,
        priority: 'NORMAL',
        wishlistId: kateTravel.id,
      },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('   alice@test.com / test123');
  console.log('   bob@test.com / test123');
  console.log('   kate@test.com / test123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
