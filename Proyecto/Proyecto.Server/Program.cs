using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Proyecto.Server.BLL.Repository;
using Proyecto.Server.BLL.Service;
using Proyecto.Server.DAL;
using Microsoft.OpenApi.Models;
using System.IO;
using MySqlConnector;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.Utils;

namespace Proyecto.Server
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.OpenApi.Models;
    using Swashbuckle.AspNetCore.SwaggerGen;

    public class SwaggerSecurityRequirementsOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var hasAuthorize = context.MethodInfo.DeclaringType?.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any() == true
                            || context.MethodInfo.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any();

            if (!hasAuthorize)
                return;

            operation.Security = new List<OpenApiSecurityRequirement>
        {
            new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    new List<string>()
                }
            }
        };
        }
    }

    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var key = Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]);

            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Mi API", Version = "v1" });

                // Configurar autenticación con JWT en Swagger
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Ingrese el token en este formato: Bearer {token}"
                });

                // Aplicar solo a endpoints con [Authorize]
                c.OperationFilter<SwaggerSecurityRequirementsOperationFilter>();

                // Incluir el archivo XML en Swagger
                var xmlFile = Path.Combine(AppContext.BaseDirectory, "ProyectoAPI.xml");
                c.IncludeXmlComments(xmlFile);
            });


            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = builder.Configuration["JwtSettings:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("ResetPassword", policy =>
                policy.RequireClaim("Purpose", "ResetPassword"));
            });


            // Agregar los servicios de configuración de la cadena de conexión
            builder.Services.AddSingleton<IConfiguration>(builder.Configuration);
            builder.Services.AddScoped<StoreProcedure>(); // Registrar StoreProcedure para inyección de dependencias

            // Registro de IUserBLL
            builder.Services.AddScoped<IUserBLL, UserBLL>();
            builder.Services.AddControllers();
            // Registro de ITournamentBLL
            builder.Services.AddScoped<ITournamentBLL, TournamentBLL>();
            // Registra IUserRepository con su implementación concreta
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<ITournamentRepository, TournamentRepository>();
            builder.Services.AddScoped<ITeamManagementRepository, TeamManagementRepository>();
            builder.Services.AddScoped<ITeamManagementBLL, TeamManagementBLL>();
            builder.Services.AddScoped<IPlayerRepository, PlayerRepository>();
            builder.Services.AddScoped<IPlayerBLL, PlayerBLL>();
            builder.Services.AddSingleton<AzureBlobService>();
            builder.Services.AddScoped<ITeamRepository, TeamRepository>();
            builder.Services.AddScoped<ITeamBLL, TeamBLL>();
            builder.Services.AddScoped<IAdditionalFeaturesRepository, AdditionalFeaturesRepository>();
            builder.Services.AddScoped<IAdditionalFeaturesBLL, AdditionalFeaturesBLL>();
            builder.Services.AddScoped<IMatchesBLL, MatchesBLL>();  
            builder.Services.AddScoped<IMatchesRepository, MatchesRepository>();


            // Definir política de CORS
            var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

            var connectionString = builder.Configuration.GetConnectionString("MiConexion");
            bool dbConnectionAvailable = true;
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    connection.Close();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al conectarse a la base de datos:");
                Console.WriteLine(ex.Message);
                dbConnectionAvailable = false; // <- Termina la aplicación si falla
            }


            if (dbConnectionAvailable)
            {
                builder.Services.AddDbContext<AppDbContext>(options =>
                    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
                );
            }


            builder.Services.AddCors(options =>
            {
                options.AddPolicy(name: MyAllowSpecificOrigins,
                                    policy =>
                                    {
                                        policy.WithOrigins(
                                            "https://lemon-meadow-015c9cd0f.6.azurestaticapps.net",
                                            "http://localhost:5173",
                                            "https://torneosumes.site") // Permitir el frontend
                                                .AllowAnyHeader()
                                                .AllowAnyMethod()
                                                .AllowCredentials(); // Permitir cookies y autenticación
                                    });
            });
            builder.WebHost.ConfigureKestrel(options =>
            {
                options.Limits.MaxRequestBodySize = 10 * 1024 * 1024; // 10 MB
            });


            // Agregar servicios al contenedor.
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Activar CORS antes de cualquier middleware que lo requiera
            app.UseCors(MyAllowSpecificOrigins);

            // Configurar el pipeline de solicitudes HTTP.
            
            
                app.UseSwagger();
                app.UseSwaggerUI();
            

            app.UseAuthorization();
            app.MapControllers();
            //app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
