/** @jest-environment node */
import { loadQuote } from '../../src/api';

const quote = { subtotalCents: 50000, discountCents: 0, shippingCents: 5000, totalCents: 55000 };
afterEach(() => jest.restoreAllMocks());

it('calculates a local preview when no API is configured', async () => {
  await expect(loadQuote({ quantity: 2, unitPriceCents: 25000 }, '')).resolves.toEqual(quote);
});
it('uses the configured backend and validates its response', async () => {
  const fetcher = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(quote), { status: 200 }));
  await expect(loadQuote({ quantity: 2, unitPriceCents: 25000 }, 'https://api.example.test/')).resolves.toEqual(quote);
  expect(fetcher).toHaveBeenCalledWith('https://api.example.test/api/quotes', expect.objectContaining({ method: 'POST', body: JSON.stringify({ quantity: 2, unitPriceCents: 25000 }) }));
});
it('reports an unsuccessful HTTP response', async () => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 503 }));
  await expect(loadQuote({ quantity: 2, unitPriceCents: 25000 }, 'https://api.example.test')).rejects.toThrow('could not complete');
});
it('rejects a malformed backend response', async () => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
  await expect(loadQuote({ quantity: 2, unitPriceCents: 25000 }, 'https://api.example.test')).rejects.toThrow();
});
it('propagates a network failure to the caller', async () => {
  jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  await expect(loadQuote({ quantity: 2, unitPriceCents: 25000 }, 'https://api.example.test')).rejects.toThrow('offline');
});
