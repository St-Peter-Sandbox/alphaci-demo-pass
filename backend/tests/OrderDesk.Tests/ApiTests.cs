using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using OrderDesk.Domain;
using Xunit;

namespace OrderDesk.Tests;

public sealed class ApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public ApiTests(WebApplicationFactory<Program> factory)
    {
        client = factory.CreateClient();
    }

    [Theory]
    [InlineData("/health", "ok")]
    [InlineData("/", "ready")]
    public async Task Reports_service_health(string path, string expected)
    {
        HealthResponse? response = await client.GetFromJsonAsync<HealthResponse>(path);
        Assert.Equal(expected, response?.Status);
    }

    [Fact]
    public async Task Serves_an_openapi_contract()
    {
        using HttpResponseMessage response = await client.GetAsync("/openapi/v1.json");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("/api/quotes", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Quotes_exactly_ten_items_with_the_discount()
    {
        using HttpResponseMessage response = await client.PostAsJsonAsync("/api/quotes", new QuoteRequest(10, 25000));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Quote? quote = await response.Content.ReadFromJsonAsync<Quote>();
        Assert.Equal(new Quote(250000, 25000, 0, 225000), quote);
    }

    [Fact]
    public async Task Returns_a_useful_validation_error()
    {
        using HttpResponseMessage response = await client.PostAsJsonAsync("/api/quotes", new QuoteRequest(0, 25000));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        ErrorResponse? error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.NotNull(error);
        Assert.Contains("quantity from 1 to 100", error.Message);
    }
}
