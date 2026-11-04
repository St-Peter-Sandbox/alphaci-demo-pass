using OrderDesk.Domain;
using Xunit;

namespace OrderDesk.Tests;

public sealed class QuoteTests
{
    [Theory]
    [InlineData(1, 25000, 25000, 0, 5000, 30000)]
    [InlineData(9, 25000, 225000, 0, 5000, 230000)]
    [InlineData(10, 25000, 250000, 25000, 0, 225000)]
    [InlineData(11, 25000, 275000, 27500, 0, 247500)]
    [InlineData(15, 1, 15, 2, 0, 13)]
    [InlineData(100, 100000000, 10000000000, 1000000000, 0, 9000000000)]
    public void Calculates_order_totals(int quantity, int unitPrice, long subtotal, long discount, int shipping, long total)
    {
        Quote? quote = QuoteCalculator.Calculate(quantity, unitPrice);
        Assert.Equal(new Quote(subtotal, discount, shipping, total), quote);
    }

    [Theory]
    [InlineData(0, 100)]
    [InlineData(-1, 100)]
    [InlineData(101, 100)]
    [InlineData(2, 0)]
    [InlineData(2, -1)]
    [InlineData(2, 100000001)]
    public void Rejects_invalid_orders(int quantity, int unitPrice)
    {
        Assert.Null(QuoteCalculator.Calculate(quantity, unitPrice));
    }
}
