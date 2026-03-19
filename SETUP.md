# Wishlist App — Setup Guide

## Prerequisites

1. **Xcode** — установить из App Store (нужен для `pod install` и `run-ios`)
2. **PostgreSQL** — `brew install postgresql@16 && brew services start postgresql@16`
3. **Node.js 18+** — `brew install node`
4. **CocoaPods** — `brew install cocoapods`

## Важно: путь к проекту

CocoaPods не работает с кириллицей в пути. Скопируй проект в ASCII-путь:

```bash
cp -r ~/мобилка/WishlistApp ~/WishlistApp
cp -r ~/мобилка/backend ~/WishlistBackend
```

Далее работай из `~/WishlistApp` и `~/WishlistBackend`.

---

## 1. Запуск Backend

```bash
cd ~/WishlistBackend

# Скопируй и заполни .env
cp .env.example .env
# Отредактируй .env:
#   DATABASE_URL="postgresql://postgres:password@localhost:5432/wishlist"
#   JWT_SECRET="your-secret-here"

# Установи зависимости
npm install

# Создай БД и запусти миграции
createdb wishlist
npx prisma migrate dev --name init

# Запусти сервер
npm run dev
# → Server listening on port 3000
```

Проверь:
```bash
curl http://localhost:3000/health
# → {"status":"ok"}
```

---

## 2. Запуск iOS приложения

```bash
cd ~/WishlistApp

# Установи зависимости (если ещё не установлены)
npm install --legacy-peer-deps

# Установи CocoaPods зависимости
cd ios && pod install && cd ..

# Укажи Xcode
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

# Запусти Metro bundler (в отдельном терминале)
npx react-native start

# Запусти на iOS Simulator (в другом терминале)
npx react-native run-ios --simulator "iPhone 16"
```

---

## 3. Тест deep links

```bash
# Открыть гостевой вишлист по токену:
xcrun simctl openurl booted "wishlist://share/YOUR_TOKEN"
```

---

## Структура проекта

```
мобилка/
├── backend/          # Node.js + Express + TypeScript + Prisma
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── routes/   # auth, wishlists, items, reservations, contributions, share, parseUrl
│   │   ├── services/ # бизнес-логика
│   │   └── controllers/
│   └── .env.example
└── WishlistApp/      # React Native CLI (iOS)
    ├── src/
    │   ├── screens/  # Login, Register, Dashboard, WishlistDetail, GuestAccess
    │   ├── components/
    │   ├── navigation/
    │   ├── hooks/
    │   ├── api/
    │   └── store/    # Zustand auth store
    └── ios/          # Xcode project + deep link scheme "wishlist://"
```

---

## API эндпоинты (порт 3000)

| Метод | Путь | Auth |
|-------|------|------|
| POST | /auth/register | — |
| POST | /auth/login | — |
| GET | /auth/me | Bearer |
| GET/POST | /wishlists | Bearer |
| GET/PATCH/DELETE | /wishlists/:id | Bearer |
| POST/PATCH/DELETE | /items | Bearer |
| POST/DELETE | /reservations | — (гости) |
| POST | /contributions | — (гости) |
| GET | /share/:token | — |
| GET | /share/:token/items | — |
| POST | /parse-url | Bearer |
