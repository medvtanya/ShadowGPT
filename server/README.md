# ShadowGPT Server

Express.js сервер для API ShadowGPT с поддержкой PDF-парсинга и AI чата.

## Установка

```bash
npm install
```

## Настройка

1. Скопируйте `.env_example` в `.env`:
```bash
cp .env_example .env
```

2. Заполните переменные окружения в `.env`:
```
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
# Необязательно:
OPENAI_MODEL=gpt-4o-mini
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
MAX_FILE_SIZE_MB=10
SESSION_TTL_HOURS=24
```

Перезапустите сервер после изменения `.env`.

## Запуск

### Разработка
```bash
npm run dev
```

### Продакшн
```bash
npm start
```

## API Endpoints

### PDF Upload & Chat
- `POST /api/upload` - загрузить PDF файл и получить sessionId
- `GET /api/upload/session/:sessionId` - проверить статус сессии
- `POST /api/chat` - отправить сообщение в чат (требует sessionId и question)
- `GET /api/chat/history/:sessionId` - получить историю чата

### Posts (Legacy)
- `GET /api/posts` - получить все посты
- `GET /api/posts/:id` - получить пост по ID
- `POST /api/posts` - создать новый пост
- `PUT /api/posts/:id` - обновить пост
- `DELETE /api/posts/:id` - удалить пост

### Auth (Legacy)
- `POST /api/auth/register` - регистрация пользователя
- `POST /api/auth/login` - вход пользователя
- `POST /api/auth/logout` - выход пользователя
- `GET /api/auth/profile` - получить профиль пользователя

## Использование PDF API

### 1. Загрузка PDF
```bash
curl -X POST http://localhost:3000/api/upload
  -F "file=@document.pdf"
```

Ответ:
```json
{
  "statusCode": 200,
  "message": "PDF uploaded and processed successfully",
  "data": {
    "sessionId": "uuid-here",
    "textLength": 1234
  }
}
```

### 2. Отправка сообщения в чат
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "uuid-here",
    "question": "What is this document about?"
  }'
```

Ответ:
```json
{
  "statusCode": 200,
  "message": "Message processed successfully",
  "data": {
    "answer": "AI response here...",
    "sessionId": "uuid-here",
    "question": "What is this document about?"
  }
}
```

## Структура проекта

```
src/
├── app.js                 # Точка входа приложения
├── configs/              # Конфигурации
│   ├── corsConfig.js     # Настройки CORS
│   └── serverConfig.js   # Основные настройки сервера
├── controllers/          # Контроллеры
│   ├── authController.js
│   ├── chatController.js # Контроллер для чата
│   ├── postController.js
│   └── uploadController.js # Контроллер для загрузки PDF
├── middlewares/          # Middleware
│   ├── removeHeader.js
│   └── uploadMiddleware.js # Multer для загрузки файлов
├── routes/               # Маршруты
│   ├── authRouter.js
│   ├── chatRouter.js     # Роуты для чата
│   ├── indexRouter.js
│   ├── postRouter.js
│   └── uploadRouter.js   # Роуты для загрузки
├── services/             # Бизнес-логика
│   ├── aiService.js      # Сервис для работы с AI
│   ├── authService.js
│   ├── pdfService.js     # Сервис для работы с PDF
│   └── postService.js
└── utils/                # Утилиты
    └── formatResponse.js
```

## Тестирование

```bash
# Запуск всех тестов
npm test

# Запуск тестов в режиме наблюдения
npm run test:watch

# Проверка кода линтером
npm run lint

# Автоисправление кода
npm run lint:fix

# Форматирование кода
npm run format
```

## Зависимости

### Основные
- `express` - веб-фреймворк
- `multer` - загрузка файлов
- `pdf-parse` - парсинг PDF
- `uuid` - генерация уникальных ID
- `helmet` - безопасность
- `cors` - CORS поддержка
- `morgan` - логирование

### Разработка
- `nodemon` - автоперезагрузка
- `eslint` - линтер
- `prettier` - форматтер
- `jest` - тестирование
- `supertest` - HTTP тестирование
