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

  // Заглушка для AI ответа (будет заменена на реальный OpenAI запрос)
  static async getAiResponse(prompt) {
    // TODO: Заменить на реальный запрос к OpenAI
    // const openai = new OpenAI({
    //   apiKey: process.env.OPENAI_API_KEY,
    // });
    
    // const completion = await openai.chat.completions.create({
    //   messages: [{ role: "user", content: prompt }],
    //   model: "gpt-3.5-turbo",
    // });
    
    // return completion.choices[0].message.content;

    // Временная заглушка
    return `This is a placeholder response. The actual AI integration will be implemented in the next branch. Prompt: ${prompt.substring(0, 100)}...`;
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
