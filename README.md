# Wishlist App — iOS

Мобильное приложение для создания и совместного использования списков желаний с социальными функциями, коллективными подарками и внутренней монетной экономикой.

**Стек:** React Native (iOS) + Express.js + PostgreSQL

---

## Что делает приложение

- Создавать списки желаний с товарами (название, цена, ссылка, приоритет, фото)
- Делиться списками публично или с друзьями через deep link
- Гостям — **резервировать** товары или **вносить деньги** без регистрации
- Дарить **монеты** (внутренняя валюта) друзьям на исполнение желаний
- Создавать **группы** для коллективных подарков
- Следить за активностью друзей через **ленту событий**
- Получать **AI-подсказки** по выбору подарков

---

## Структура проекта

```
mobile/
├── README.md
├── SETUP.md                  # Руководство по настройке для разработчика
├── WishlistApp/              # React Native фронтенд (iOS)
├── backend/                  # Express.js API сервер
└── wishlist/                 # Архивный Swift-проект (не используется)
```

---

## Фронтенд — `WishlistApp/`

React Native приложение для iOS, написано на TypeScript.

### Архитектура

```
WishlistApp/
├── App.tsx                   # Точка входа — провайдеры (React Query, Toast, Navigation)
├── src/
│   ├── types/index.ts        # Общие TypeScript-типы
│   ├── navigation/           # Стек навигации
│   ├── screens/              # Полноэкранные представления
│   ├── components/           # Переиспользуемые UI-компоненты
│   ├── hooks/                # Кастомные хуки (загрузка данных)
│   ├── api/                  # Функции API-запросов через Axios
│   └── store/                # Глобальное состояние (Zustand)
```

### Навигация

| Файл | Назначение |
|---|---|
| `navigation/RootNavigator.tsx` | Переключение auth/app, обработка deep link |
| `navigation/AuthNavigator.tsx` | Стек входа и регистрации |
| `navigation/AppNavigator.tsx` | Главный таб-бар (Мои списки, Лента, Друзья, Кошелёк) |

### Экраны

| Экран | Файл | Описание |
|---|---|---|
| Вход | `screens/auth/LoginScreen.tsx` | Авторизация по email/паролю |
| Регистрация | `screens/auth/RegisterScreen.tsx` | Создание нового аккаунта |
| Дашборд | `screens/dashboard/DashboardScreen.tsx` | Список вишлистов пользователя + FAB для создания |
| Детали вишлиста | `screens/wishlist/WishlistDetailScreen.tsx` | Товары в вишлисте, добавление/редактирование/удаление |
| Публичный вишлист | `screens/wishlist/PublicWishlistScreen.tsx` | Только чтение для PUBLIC-вишлистов |
| Гостевой доступ | `screens/guest/GuestAccessScreen.tsx` | Страница для гостей по deep link |
| Друзья | `screens/friends/FriendsScreen.tsx` | Заявки в друзья и список друзей |
| Профиль друга | `screens/friends/FriendProfileScreen.tsx` | Просмотр публичного профиля друга |
| Лента | `screens/feed/FeedScreen.tsx` | Активность друзей (новые товары) |
| Кошелёк | `screens/wallet/WalletScreen.tsx` | Баланс монет и история транзакций |
| Группы | `screens/groups/GroupsScreen.tsx` | Создание и вступление в группы |
| Детали группы | `screens/groups/GroupDetailScreen.tsx` | Товары группы и донаты монетами |

### Компоненты

**Общие**
- `Button.tsx` — стилизованная кнопка
- `Input.tsx` — текстовое поле с меткой
- `LoadingOverlay.tsx` — полноэкранный загрузчик
- `ErrorBanner.tsx` — встроенное отображение ошибки
- `PriorityBadge.tsx` — бейдж MUST_HAVE / NORMAL / DREAM

**Вишлист**
- `WishlistCard.tsx` — строка вишлиста в списке
- `WishlistItemCard.tsx` — строка товара в списке
- `ItemFormModal.tsx` — модалка создания/редактирования товара
- `GiftAdvisorModal.tsx` — модалка AI-подсказок по подаркам

**Гостевые**
- `GuestItemCard.tsx` — карточка товара только для чтения (гость)
- `ContributionBar.tsx` — прогресс-бар денежных вкладов

### Управление состоянием

| Слой | Библиотека | Для чего |
|---|---|---|
| Серверное состояние | React Query | Все API-данные, кэширование, инвалидация |
| Клиентское состояние | Zustand | Токен авторизации + текущий пользователь (с персистентностью) |
| HTTP | Axios | Запросы с JWT-интерцептором |

### Кастомные хуки

Каждая функция приложения имеет отдельный хук, обёртывающий вызовы React Query:

| Хук | Ответственность |
|---|---|
| `useAuth` | Мутации входа/регистрации |
| `useWishlists` | Список, создание, обновление, удаление вишлистов |
| `useWishlistDetail` | Один вишлист и его товары |
| `useFriends` | Заявки в друзья, принять/отклонить, список |
| `useFeed` | Лента активности друзей |
| `useWallet` | Баланс монет и история транзакций |
| `useCoinDonations` | Донат монет на товары |
| `useGroups` | CRUD групп и вступление по коду |
| `useShareData` | Парсинг токена гостя из deep link |

### API-слой

`src/api/client.ts` — Axios-инстанс, указывающий на `http://localhost:3000`. Автоматически добавляет заголовок `Authorization: Bearer <token>`; делает выход при 401.

Каждый модуль экспортирует типизированные функции для одного ресурса:
`auth.api.ts`, `wishlists.api.ts`, `items.api.ts`, `reservations.api.ts`, `contributions.api.ts`, `share.api.ts`, `friends.api.ts`, `wallet.api.ts`, `feed.api.ts`, `coinDonations.api.ts`, `groups.api.ts`, `ai.api.ts`

### Основные зависимости

| Пакет | Версия | Назначение |
|---|---|---|
| react-native | 0.84.1 | Мобильный фреймворк |
| @react-navigation/* | 7.x | Навигация |
| @tanstack/react-query | 5.90 | Серверное состояние |
| zustand | 4.5.7 | Клиентское состояние |
| axios | 1.13.6 | HTTP-клиент |
| phosphor-react-native | — | Иконки |
| react-native-toast-message | — | Toast-уведомления |

---

## Бэкенд — `backend/`

REST API на Express.js, написан на TypeScript, база данных PostgreSQL через Prisma ORM.

### Архитектура

```
backend/
├── src/
│   ├── index.ts              # Express-приложение + подключение маршрутов
│   ├── config.ts             # Загрузка переменных окружения
│   ├── db.ts                 # Singleton Prisma-клиента
│   ├── middleware/
│   │   ├── auth.ts           # JWT-мидлвар requireAuth
│   │   └── errorHandler.ts   # Глобальный обработчик ошибок
│   ├── routes/               # Определения маршрутов (13 модулей)
│   ├── controllers/          # Обработчики запросов
│   ├── services/             # Бизнес-логика
│   └── utils/                # Вспомогательные функции (jwt, hash, shareToken)
└── prisma/
    ├── schema.prisma         # Схема базы данных
    └── migrations/           # История миграций
```

### API-маршруты

| Префикс | Файл | Описание |
|---|---|---|
| `/auth` | `routes/auth.ts` | Регистрация, вход, получение текущего пользователя |
| `/wishlists` | `routes/wishlists.ts` | CRUD вишлистов |
| `/items` | `routes/items.ts` | CRUD товаров вишлиста |
| `/reservations` | `routes/reservations.ts` | Резервирование товаров гостем |
| `/contributions` | `routes/contributions.ts` | Денежные вклады гостей |
| `/share` | `routes/share.ts` | Публичный гостевой доступ по токену |
| `/parse-url` | `routes/parseUrl.ts` | Извлечение метаданных из URL |
| `/ai` | `routes/ai.ts` | AI-подсказки по подаркам (OpenRouter) |
| `/friends` | `routes/friends.ts` | Заявки в друзья и управление дружбой |
| `/wallet` | `routes/wallet.ts` | Баланс монет и транзакции |
| `/feed` | `routes/feed.ts` | Лента активности друзей |
| `/coin-donations` | `routes/coinDonations.ts` | Донаты монет на товары |
| `/groups` | `routes/groups.ts` | CRUD групп, вступление, донаты |

### Схема базы данных

Основные модели в `prisma/schema.prisma`:

| Модель | Поля | Примечание |
|---|---|---|
| `User` | email, passwordHash, coins, role, avatar | Роли: USER, ORG |
| `Wishlist` | title, description, occasion, visibility | PRIVATE / FRIENDS / PUBLIC |
| `Item` | title, price, url, imageUrl, priority, status | Приоритет: MUST_HAVE / NORMAL / DREAM |
| `Reservation` | itemId, guestName, guestEmail | Гость резервирует товар |
| `Contribution` | itemId, amount, guestName | Частичный денежный вклад |
| `Friendship` | requesterId, addresseeId, status | PENDING / ACCEPTED / DECLINED |
| `CoinTransaction` | userId, amount, type | SIGNUP_BONUS / SENT / RECEIVED / DONATED / REFUNDED |
| `CoinDonation` | fromUserId, itemId, amount | Донат монет от пользователя к товару |
| `Group` | title, joinCode, creatorId | Группа для коллективного подарка |
| `GroupMembership` | groupId, userId, isAdmin | |
| `GroupItem` | groupId, title, price, coinTarget | Цель сбора монет группы |
| `GroupDonation` | groupItemId, userId, amount | Донат монет к товару группы |

### Сервисы (бизнес-логика)

| Сервис | Ответственность |
|---|---|
| `auth.service.ts` | Хэширование паролей, генерация JWT, поиск пользователя |
| `wishlists.service.ts` | Контроль доступа по видимости (PRIVATE / FRIENDS / PUBLIC) |
| `items.service.ts` | Проверка владельца, переходы статусов товара |
| `reservations.service.ts` | Резервирование / отмена резервирования |
| `contributions.service.ts` | Учёт денежных вкладов гостей |
| `share.service.ts` | Валидация токенов, возврат безопасных данных для гостей |
| `friendship.service.ts` | Проверка статуса дружбы перед показом FRIENDS-контента |
| `wallet.service.ts` | Операции с монетным реестром |
| `feed.service.ts` | Получение последних товаров друзей |
| `coinDonations.service.ts` | Списание монет у отправителя, зачисление к товару |
| `groups.service.ts` | Вступление по коду, проверка прав админа, групповые донаты |

### Вспомогательные утилиты

| Файл | Назначение |
|---|---|
| `utils/jwt.ts` | Подпись и верификация JWT-токенов (срок 30 дней) |
| `utils/hash.ts` | Хэширование / проверка паролей через bcryptjs |
| `utils/shareToken.ts` | Генерация уникальных токенов через nanoid |

### Основные зависимости

| Пакет | Назначение |
|---|---|
| express 4.21 | HTTP-фреймворк |
| prisma 5.22 | ORM и миграции |
| jsonwebtoken 9.0 | JWT-авторизация |
| bcryptjs 2.4 | Хэширование паролей |
| zod 3.24 | Валидация запросов |
| cheerio 1.0 | Скрейпинг HTML (метаданные из URL) |
| express-rate-limit | Ограничение запросов на auth-маршруты |
| nanoid | Генерация токенов шаринга |
| axios | Запросы к OpenRouter AI API |

---

## Ключевые функции

### Авторизация
- Регистрация и вход по email/паролю
- JWT Bearer-токены (срок 30 дней, хранятся в AsyncStorage)
- Rate limiting: 20 запросов / 15 мин на auth-маршруты
- Автоматический выход при 401

### Вишлисты и товары
- Создание вишлиста с типом события и уровнем видимости
- Добавление товаров с ценой, URL, фото и приоритетом
- Вставка URL — автозаполнение данных товара (через Cheerio)
- Жизненный цикл товара: `AVAILABLE → RESERVED → COLLECTING → COLLECTED`

### Шаринг и гостевой доступ
- У каждого вишлиста уникальный токен шаринга
- Deep link: `wishlist://share/{token}` открывает гостевой экран
- Гости могут резервировать товары или вносить деньги без аккаунта

### Социальные функции
- Отправка/принятие/отклонение заявок в друзья
- Система видимости: FRIENDS-вишлисты видны только взаимным друзьям
- Лента активности с последними товарами друзей

### Кошелёк и монеты
- Новые пользователи получают монеты при регистрации
- Монеты донатятся на любой товар любого вишлиста
- Полная история транзакций (отправлено, получено, задоначено, возвращено)

### Группы
- Создание группы с уникальным кодом вступления
- Участники добавляют товары с целевой суммой монет
- Все участники могут донатить монеты на товары группы

### AI-помощник по подаркам
- Интеграция с OpenRouter API
- Подсказывает идеи подарков по контексту пользователя
- Доступен из формы добавления товара

---

## Переменные окружения

**Бэкенд** (`backend/.env`):

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/wishlist"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=3000
OPENROUTER_API_KEY="sk-or-v1-..."
```

---

## Установка и запуск

Подробное руководство — в [SETUP.md](SETUP.md).

**Быстрый старт:**

```bash
# Бэкенд
cd backend
npm install
npx prisma migrate dev
npm run dev          # → http://localhost:3000

# iOS-приложение
cd WishlistApp
npm install
cd ios && pod install && cd ..
npx react-native start
npx react-native run-ios
```

---

## Скрипты

**Бэкенд (`backend/package.json`)**

| Скрипт | Действие |
|---|---|
| `npm run dev` | Запуск dev-сервера через ts-node |
| `npm run build` | Компиляция TypeScript |
| `npm start` | Запуск скомпилированной сборки |
| `npm run db:migrate` | Применить Prisma-миграции |
| `npm run db:generate` | Перегенерировать Prisma-клиент |
| `npm run db:studio` | Открыть Prisma Studio |
