using Proyecto.Server.DAL;

namespace Proyecto.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Agregar los servicios de configuración de la cadena de conexión
            builder.Services.AddSingleton<IConfiguration>(builder.Configuration);
            builder.Services.AddScoped<StoreProcedure>(); // Registrar StoreProcedure para inyección de dependencias

            // Definir política de CORS
            var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

            builder.Services.AddCors(options =>
            {
                options.AddPolicy(name: MyAllowSpecificOrigins,
                                    policy =>
                                    {
                                        policy.WithOrigins("http://localhost:5173") // Permitir el frontend
                                                .AllowAnyHeader()
                                                .AllowAnyMethod()
                                                .AllowCredentials(); // Permitir cookies y autenticación
                                    });
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
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseAuthorization();
            app.MapControllers();
            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
