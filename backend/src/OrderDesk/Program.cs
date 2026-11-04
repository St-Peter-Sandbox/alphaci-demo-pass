using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http.HttpResults;
using OrderDesk.Domain;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
string[] origins = (builder.Configuration["CORS_ORIGINS"] ?? "http://localhost:4173,http://localhost:8080")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins(origins).AllowAnyHeader().WithMethods("GET", "POST")));

var app = builder.Build();
app.UseCors();
app.MapOpenApi();
app.MapGet("/health", () => TypedResults.Ok(new HealthResponse("ok")));
app.MapGet("/", () => TypedResults.Ok(new HealthResponse("ready")));
app.MapPost("/api/quotes", Results<Ok<Quote>, BadRequest<ErrorResponse>> (QuoteRequest request) =>
{
    Quote? quote = QuoteCalculator.Calculate(request.Quantity, request.UnitPriceCents);
    return quote is null
        ? TypedResults.BadRequest(new ErrorResponse("Use a quantity from 1 to 100 and a unit price from 1 to 100000000 cents."))
        : TypedResults.Ok(quote);
});
app.Run();

public sealed record QuoteRequest(
    [property: Range(1, 100)] int Quantity,
    [property: Range(1, 100000000)] int UnitPriceCents);
public sealed record HealthResponse(string Status);
public sealed record ErrorResponse(string Message);
public partial class Program;
