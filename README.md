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
PORT=3000
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

