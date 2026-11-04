import { calculateQuote } from '../../src/quote';

describe('order quote rules', () => {
  it.each([
    [1, 25000, 25000, 0, 5000, 30000],
    [9, 25000, 225000, 0, 5000, 230000],
    [10, 25000, 250000, 25000, 0, 225000],
    [11, 25000, 275000, 27500, 0, 247500],
    [15, 1, 15, 2, 0, 13],
    [100, 100000000, 10000000000, 1000000000, 0, 9000000000],
  ])('quotes %i items priced at %i cents', (quantity, unitPriceCents, subtotalCents, discountCents, shippingCents, totalCents) => {
    expect(calculateQuote({ quantity, unitPriceCents })).toEqual({ subtotalCents, discountCents, shippingCents, totalCents });
  });
  it.each([0, -1, 101, 1.5, Number.NaN])('rejects invalid quantity %s', (quantity) => {
    expect(() => calculateQuote({ quantity, unitPriceCents: 100 })).toThrow(RangeError);
  });
  it.each([0, -1, 100000001, 1.5, Number.NaN])('rejects invalid unit price %s', (unitPriceCents) => {
    expect(() => calculateQuote({ quantity: 2, unitPriceCents })).toThrow(RangeError);
  });
});
