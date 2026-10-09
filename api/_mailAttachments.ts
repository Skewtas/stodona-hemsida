import type Anthropic from '@anthropic-ai/sdk';
import { stammerInnehallet, SYNLIGA_BILDTYPER } from './_chatBilagor';
export type MailAttachment = { name: string; contentType: string; text?: string; unread?: boolean; dataBase64?: string };
export function mailImageBlocks(attachments: MailAttachment[]): Anthropic.ImageBlockParam[] {
  const images: Anthropic.ImageBlockParam[] = [];
  for (const a of attachments) {
    if (!a.dataBase64 || !(SYNLIGA_BILDTYPER as readonly string[]).includes(a.contentType) || images.length >= 3) continue;
    if (a.dataBase64.length > 350000 || !/^[A-Za-z0-9+/]*={0,2}$/.test(a.dataBase64)) continue;
    try {
      const bytes = Uint8Array.from(atob(a.dataBase64), c => c.charCodeAt(0));
      if (!stammerInnehallet(bytes, a.contentType)) continue;
      images.push({ type: 'image', source: { type: 'base64', media_type: a.contentType as 'image/png' | 'image/jpeg' | 'image/webp', data: a.dataBase64 } });
    } catch { /* Unreadable files remain for staff in Outlook. */ }
  }
  return images;
}
