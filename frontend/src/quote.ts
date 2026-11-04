import { z } from 'zod';

export const QuoteSchema = z.object({
  subtotalCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative(),
  shippingCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
});
export type Quote = z.infer<typeof QuoteSchema>;
export interface QuoteInput { quantity: number; unitPriceCents: number }

export function calculateQuote(input: QuoteInput): Quote {
  const { quantity, unitPriceCents } = input;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    throw new RangeError('Quantity must be a whole number from 1 to 100.');
  }
  if (!Number.isInteger(unitPriceCents) || unitPriceCents < 1 || unitPriceCents > 100000000) {
    throw new RangeError('Unit price must be from ₱0.01 to ₱1,000,000.00.');
  }
  const subtotalCents = quantity * unitPriceCents;
  const discountCents = quantity >= 10 ? Math.round(subtotalCents / 10) : 0;
  const shippingCents = quantity >= 10 ? 0 : 5000;
  return { subtotalCents, discountCents, shippingCents, totalCents: subtotalCents - discountCents + shippingCents };
}
