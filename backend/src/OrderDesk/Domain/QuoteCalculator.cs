namespace OrderDesk.Domain;

public sealed record Quote(long SubtotalCents, long DiscountCents, int ShippingCents, long TotalCents);

public static class QuoteCalculator
{
    public static Quote? Calculate(int quantity, int unitPriceCents)
    {
        if (quantity < 1 || quantity > 100 || unitPriceCents < 1 || unitPriceCents > 100000000)
        {
            return null;
        }

        long subtotalCents = (long)quantity * unitPriceCents;
        long discountCents = quantity >= 10 ? (long)Math.Round(subtotalCents / 10m, MidpointRounding.AwayFromZero) : 0;
        int shippingCents = quantity >= 10 ? 0 : 5000;
        return new Quote(subtotalCents, discountCents, shippingCents, subtotalCents - discountCents + shippingCents);
    }
}
