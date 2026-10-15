using GoFund.Application.Auth;
using GoFund.Application.Auth.DTOs;
using GoFund.Infrastructure.Email;
using GoFund.Infrastructure.Identity;
using GoFund.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));

builder.Services.AddDataProtection();

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;

        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireNonAlphanumeric = true;

        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan =
            TimeSpan.FromMinutes(15);
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();


// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddEndpointsApiExplorer();

// Swagger
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "GoFund API",
        Version = "v1",
        Description = """
        GoFund Fintech Platform API.

        Provides authentication, user management,
        financial services and other GoFund platform APIs.
        """,
        Contact = new OpenApiContact
        {
            Name = "GoFund Development Team"
        }
    });

    // -----------------------------------------------------
    // JWT Bearer Authentication
    // -----------------------------------------------------

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description =
                "Enter your JWT access token. " +
                "Do not include the 'Bearer ' prefix."
        });

    // Apply Bearer authentication to Swagger
    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [
                new OpenApiSecuritySchemeReference(
                    "Bearer",
                    document)
            ] = new List<string>()
        });

    // -----------------------------------------------------
    // XML documentation
    // -----------------------------------------------------

    var xmlFile =
        $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";

    var xmlPath =
        Path.Combine(
            AppContext.BaseDirectory,
            xmlFile);

    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

builder.Services.Configure<TwoFactorSettings>(builder.Configuration.GetSection("Authentication:TwoFactor"));



builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>() ?? throw new InvalidOperationException("JWT configuration is missing.");

var key = Encoding.UTF8.GetBytes(jwtSettings.Key);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.FromSeconds(30)
    };

});

builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("Email"));

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.Configure<GoogleSettings>(builder.Configuration.GetSection("Authentication:Google"));

builder.Services.Configure<MicrosoftSettings>(builder.Configuration.GetSection("Authentication:Microsoft"));

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter(
        "twoFactorLogin",
        limiterOptions =>
        {
            limiterOptions.PermitLimit = 10;

            limiterOptions.Window =
                TimeSpan.FromMinutes(1);

            limiterOptions.QueueLimit = 0;
        });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowGoFundAdmin", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    //app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowGoFundAdmin");

app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new
{
    name = "GoFund API",
    status = "Running",
    version = "1.0.0"
}));


app.MapControllers();

app.Run();
