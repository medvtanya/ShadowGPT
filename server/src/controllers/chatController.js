const formatResponse = require('../utils/formatResponse');
const PdfService = require('../services/pdfService');
const AiService = require('../services/aiService');

class ChatController {
  // Отправка сообщения в чат
  static async sendMessage(req, res) {
    try {
      const { sessionId, question } = req.body;

      // Валидация входных данных
      if (!sessionId || !question) {
        return res.status(400).json(
          formatResponse(400, 'Missing required fields', null, 'sessionId and question are required')
        );
      }

      // Проверяем существование сессии
      if (!PdfService.sessionExists(sessionId)) {
        return res.status(404).json(
          formatResponse(404, 'Session not found', null, 'Invalid session ID')
        );
      }

      // Получаем текст PDF для данной сессии
      const pdfText = PdfService.getPdfText(sessionId);

      // Получаем ответ от AI
      const answer = await AiService.answerQuestion(pdfText, question);

      res.status(200).json(
        formatResponse(200, 'Message processed successfully', {
          answer: answer,
          sessionId: sessionId,
          question: question,
        })
      );
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json(
        formatResponse(500, 'Internal server error', null, error.message)
      );
    }
  }

  // Получение истории чата (заглушка для будущего расширения)
  static async getChatHistory(req, res) {
    try {
      const { sessionId } = req.params;

      if (!PdfService.sessionExists(sessionId)) {
        return res.status(404).json(
          formatResponse(404, 'Session not found', null, 'Invalid session ID')
        );
      }

      // В текущей реализации история не сохраняется
      // В будущем здесь будет логика получения истории из базы данных
      res.status(200).json(
        formatResponse(200, 'Chat history retrieved', {
          sessionId: sessionId,
          messages: [],
          note: 'Chat history is not implemented yet',
        })
      );
    } catch (error) {
      console.error('Chat history error:', error);
      res.status(500).json(
        formatResponse(500, 'Internal server error', null, error.message)
      );
    }
  }
}

module.exports = ChatController;
