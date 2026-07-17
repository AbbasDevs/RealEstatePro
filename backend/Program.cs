using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RealEstatePro.Data;
using RealEstatePro.Models;
using RealEstatePro.Services;
using System.Text.Json.Serialization;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Databases ─────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<PropertyDbContext>(opts =>
    opts.UseNpgsql(builder.Configuration.GetConnectionString("PropertyConnection")));

builder.Services.AddDbContext<PeopleDbContext>(opts =>
    opts.UseSqlServer(builder.Configuration.GetConnectionString("PeopleConnection")));

// ── JWT Auth ──────────────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is missing from configuration.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "RealEstateAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "RealEstateClient";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// ── Services ──────────────────────────────────────────────────────────────────
builder.Services.AddScoped<JwtService>();

// ── CORS ──────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();

builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(policy =>
    {
        if (allowedOrigins is { Length: > 0 })
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
            return;
        }

        policy.SetIsOriginAllowed(origin =>
                new Uri(origin).Host == "localhost" || new Uri(origin).Host == "127.0.0.1")
            .AllowAnyHeader()
            .AllowAnyMethod();
    }));

// ── MVC + Swagger ─────────────────────────────────────────────────────────────
builder.Services
    .AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Real Estate API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {token}",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var propertyDb = scope.ServiceProvider.GetRequiredService<PropertyDbContext>();
    var peopleDb = scope.ServiceProvider.GetRequiredService<PeopleDbContext>();

    if (app.Environment.IsDevelopment())
    {
        propertyDb.Database.Migrate();
        peopleDb.Database.Migrate();
    }
    
    if (!peopleDb.Users.Any(u => u.Role == UserRole.Admin))
    {
        var adminEmail = builder.Configuration["AdminSeed:Email"] ?? "admin@realestate.local";
        var adminPassword = builder.Configuration["AdminSeed:Password"] ?? "Admin12345!";

        peopleDb.Users.Add(new AppUser
        {
            Email = adminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
            Role = UserRole.Admin,
            OwnerRequestStatus = OwnerRequestStatus.Approved
        });

        peopleDb.SaveChanges();
    }

    if (builder.Environment.IsDevelopment())
    {
        DevelopmentDataSeeder.SeedAnalyticsDemoData(peopleDb, propertyDb);
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
