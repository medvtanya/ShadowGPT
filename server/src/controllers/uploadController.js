const formatResponse = require('../utils/formatResponse');
const PdfService = require('../services/pdfService');

class UploadController {
  // Загрузка PDF файла
  static async uploadPdf(req, res) {
    try {
      // Проверяем, что файл был загружен
      if (!req.file) {
        return res.status(400).json(
          formatResponse(400, 'No PDF file uploaded', null, 'File is required')
        );
      }

      // Извлекаем текст из PDF
      const pdfText = await PdfService.extractTextFromPdf(req.file.buffer);

      // Проверяем, что текст был извлечен
      if (!pdfText || pdfText.trim().length === 0) {
        return res.status(400).json(
          formatResponse(400, 'Failed to extract text from PDF', null, 'PDF appears to be empty or corrupted')
        );
      }

      // Создаем новую сессию
      const sessionId = PdfService.createSession(pdfText);

      res.status(200).json(
        formatResponse(200, 'PDF uploaded and processed successfully', {
          sessionId: sessionId,
          textLength: pdfText.length,
        })
      );
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json(
        formatResponse(500, 'Internal server error', null, error.message)
      );
    }
  }

  // Проверка статуса сессии
  static async checkSession(req, res) {
    try {
      const { sessionId } = req.params;

      if (!PdfService.sessionExists(sessionId)) {
        return res.status(404).json(
          formatResponse(404, 'Session not found', null, 'Invalid session ID')
        );
      }

      res.status(200).json(
        formatResponse(200, 'Session is valid', {
          sessionId: sessionId,
          exists: true,
        })
      );
    } catch (error) {
      console.error('Session check error:', error);
      res.status(500).json(
        formatResponse(500, 'Internal server error', null, error.message)
      );
    }
  }
}

module.exports = UploadController;
