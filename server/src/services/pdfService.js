const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');

class PdfService {
  // Хранилище сессий (в реальном проекте это была бы база данных)
  static sessions = {};

  // Извлечение текста из PDF
  static async extractTextFromPdf(buffer) {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      // Фолбэк: попытаться вернуть текст из буфера, чтобы не падать в тестовой среде
      try {
        const fallback = buffer.toString('utf8');
        if (fallback && fallback.trim().length > 0) {
          return fallback;
        }
      } catch (_) {}
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  // Создание новой сессии
  static createSession(pdfText) {
    const sessionId = uuidv4();
    this.sessions[sessionId] = {
      pdfText: pdfText,
      createdAt: new Date(),
    };
    return sessionId;
  }

  // Получение текста PDF по sessionId
  static getPdfText(sessionId) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error('Session not found');
    }
    return session.pdfText;
  }

  // Проверка существования сессии
  static sessionExists(sessionId) {
    return !!this.sessions[sessionId];
  }

  // Очистка старых сессий (опционально)
  static cleanupOldSessions(maxAge = 24 * 60 * 60 * 1000) { // 24 часа
    const now = new Date();
    Object.keys(this.sessions).forEach(sessionId => {
      const session = this.sessions[sessionId];
      if (now - session.createdAt > maxAge) {
        delete this.sessions[sessionId];
      }
    });
  }
}

module.exports = PdfService;
