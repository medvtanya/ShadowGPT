const OpenAI = require('openai');

class AiService {
  // Формирование промпта для AI
  static createPrompt(pdfText, question) {
    return `You are a helpful assistant that answers questions based ONLY on the provided text. If the answer is not in the text, say "I cannot answer this based on the provided document."

Here is the document text:
"""
${pdfText}
"""

Based on the document, answer the following question: "${question}"`;
  }

  // Реальный запрос к OpenAI
  static async getAiResponse(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const openai = new OpenAI({ apiKey });

    // Prefer modern "responses" API where available; fallback to chat.completions
    try {
      // New SDK unified responses API (supports text models like gpt-4o/gpt-4.1)
      const response = await openai.responses.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        input: prompt,
        temperature: 0.2,
      });

      const text = response.output_text;
      if (text && typeof text === 'string') return text.trim();
    } catch (e) {
      // Fallback to chat.completions for older accounts/models
      if (e && process.env.DEBUG_OPENAI_ERRORS === '1') {
        console.error('OpenAI responses API failed, falling back:', e.message);
      }
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    const content = completion && completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    return content.trim();
  }

  // Основной метод для получения ответа на вопрос
  static async answerQuestion(pdfText, question) {
    try {
      const prompt = this.createPrompt(pdfText, question);
      const response = await this.getAiResponse(prompt);
      return response;
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }
}

module.exports = AiService;
