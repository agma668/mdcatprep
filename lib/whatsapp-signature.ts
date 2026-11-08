import { createHmac, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';

/** Verify Meta's X-Hub-Signature-256 against the exact raw request body. */
export function isValidWhatsAppSignature(
  rawBody: string,
  signature: string | null,
  appSecret: string | undefined
): boolean {
  if (!appSecret || !signature || !/^sha256=[a-f0-9]{64}$/i.test(signature)) return false;
  const supplied = Buffer.from(signature.slice('sha256='.length), 'hex');
  const expected = createHmac('sha256', appSecret).update(rawBody, 'utf8').digest();
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
