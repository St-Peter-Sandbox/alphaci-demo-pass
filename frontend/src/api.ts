import { calculateQuote, QuoteSchema, type Quote, type QuoteInput } from './quote';

export async function loadQuote(input: QuoteInput, baseUrl: string): Promise<Quote> {
  if (baseUrl === '') return calculateQuote(input);
  const response = await fetch(baseUrl.replace(/\/$/, '') + '/api/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error('The quote service could not complete this request.');
  const data: unknown = await response.json();
  return QuoteSchema.parse(data);
}
