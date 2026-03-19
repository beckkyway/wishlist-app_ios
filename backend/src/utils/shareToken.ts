import { nanoid } from 'nanoid';

export function generateShareToken(): string {
  return nanoid(10);
}
