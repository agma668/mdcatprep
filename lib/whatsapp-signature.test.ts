import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { isValidWhatsAppSignature } from './whatsapp-signature.ts';

const secret = 'test-app-secret';
const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });
const signature = `sha256=${createHmac('sha256', secret).update(body, 'utf8').digest('hex')}`;

test('accepts a valid Meta webhook signature for the exact raw body', () => {
  assert.equal(isValidWhatsAppSignature(body, signature, secret), true);
});

test('rejects a body changed after signing', () => {
  assert.equal(isValidWhatsAppSignature(body + ' ', signature, secret), false);
});

test('rejects missing secrets and malformed signatures', () => {
  assert.equal(isValidWhatsAppSignature(body, signature, undefined), false);
  assert.equal(isValidWhatsAppSignature(body, null, secret), false);
  assert.equal(isValidWhatsAppSignature(body, 'sha256=not-hex', secret), false);
});
