import { Response } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';

const suggestSchema = z.object({
  occasion: z.string(),
  budget: z.string(),
  interests: z.string(),
  recipientType: z.string(),
});

interface GiftSuggestion {
  emoji: string;
  title: string;
  description: string;
  priceHint: string;
}

export async function suggestGifts(req: AuthRequest, res: Response): Promise<void> {
  const parsed = suggestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'AI не настроен. Добавьте OPENROUTER_API_KEY.', code: 'AI_NOT_CONFIGURED' });
    return;
  }

  const { occasion, budget, interests, recipientType } = parsed.data;

  const prompt = `Ты помощник по подаркам. Предложи ровно 6 идей подарков.

Повод: ${occasion}
Бюджет: ${budget}
Интересы получателя: ${interests}
Тип получателя: ${recipientType}

Ответь ТОЛЬКО валидным JSON-массивом из 6 объектов. Каждый объект должен иметь поля:
- emoji (строка, один эмодзи)
- title (строка, название подарка на русском)
- description (строка, краткое описание 1-2 предложения на русском)
- priceHint (строка, примерная цена, например "от 500 ₽" или "1000–3000 ₽")

Пример формата:
[{"emoji":"🎮","title":"Игровой контроллер","description":"Беспроводной геймпад для консоли или ПК.","priceHint":"от 2000 ₽"}]`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-haiku-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://wishlist-app.local',
          'X-Title': 'Wishlist App',
        },
        timeout: 30000,
      },
    );

    const text = response.data.choices[0]?.message?.content ?? '[]';
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      res.status(500).json({ error: 'Не удалось получить подсказки', code: 'AI_PARSE_ERROR' });
      return;
    }

    const suggestions: GiftSuggestion[] = JSON.parse(jsonMatch[0]);
    res.json({ suggestions });
  } catch (err: any) {
    console.error('AI error:', err.response?.data ?? err.message);
    res.status(500).json({ error: 'Ошибка AI', code: 'AI_ERROR' });
  }
}
