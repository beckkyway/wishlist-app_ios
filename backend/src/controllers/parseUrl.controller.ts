import { Response } from 'express';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AuthRequest } from '../middleware/auth';

const schema = z.object({ url: z.string().url() });

export async function parseUrl(req: AuthRequest, res: Response): Promise<void> {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid URL', code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    const response = await axios.get(parsed.data.url, {
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WishlistBot/1.0)' },
    });
    const $ = cheerio.load(response.data);

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="title"]').attr('content') ||
      $('title').text() ||
      undefined;

    const imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="image"]').attr('content') ||
      undefined;

    const priceStr =
      $('meta[property="og:price:amount"]').attr('content') ||
      $('meta[property="product:price:amount"]').attr('content') ||
      undefined;

    const price = priceStr ? parseFloat(priceStr) : undefined;

    res.json({ title, imageUrl, price: isNaN(price as number) ? undefined : price });
  } catch {
    res.status(422).json({ error: 'Could not fetch URL', code: 'FETCH_ERROR' });
  }
}
