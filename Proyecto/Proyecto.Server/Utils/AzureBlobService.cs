using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Proyecto.Server.Utils
{
    public class AzureBlobService
    {
        private readonly string _connectionString;
        private readonly string _containerName;
        private readonly string _containerNameLogos;
        public AzureBlobService(IConfiguration configuration)
        {
            _connectionString = configuration["AzureBlobStorage:ConnectionString"];
            _containerName = configuration["AzureBlobStorage:ContainerName"];
            _containerNameLogos = configuration["AzureBlobStorage:ContainerNameLogos"];
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName)
        {
            try
            {
                var blobServiceClient = new BlobServiceClient(_connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);

                // Asegurar que el contenedor exista
                await containerClient.CreateIfNotExistsAsync();

                // Crear el cliente para el blob específico
                var blobClient = containerClient.GetBlobClient(fileName);

                // Verificar si el archivo ya existe y eliminarlo
                if (await blobClient.ExistsAsync())
                {
                    await blobClient.DeleteAsync();
                }

                // Definir las opciones de subida con el tipo de contenido PDF
                var blobHttpHeaders = new BlobHttpHeaders
                {
                    ContentType = "application/pdf"
                };

                // Subir el archivo (esto lo sobrescribirá si ya fue eliminado)
                await blobClient.UploadAsync(fileStream, new BlobUploadOptions
                {
                    HttpHeaders = blobHttpHeaders
                });

                // Devolver la URL pública del archivo
                return blobClient.Uri.ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al subir el archivo: {ex.Message}");
                return null;
            }
        }

        public async Task<string> UploadImageAsync(Stream fileStream, string fileName)
        {
            try
            {
                // Verificar si el archivo tiene una extensión de imagen válida
                string[] validExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
                string extension = Path.GetExtension(fileName).ToLower();

                if (!validExtensions.Contains(extension))
                {
                    throw new ArgumentException("El archivo no es una imagen válida.");
                }

                // Obtener el tipo de contenido según la extensión
                string contentType = extension switch
                {
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".gif" => "image/gif",
                    ".bmp" => "image/bmp",
                    ".webp" => "image/webp",
                    _ => throw new ArgumentException("Tipo de imagen no soportado.")
                };

                var blobServiceClient = new BlobServiceClient(_connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(_containerNameLogos);

                // Asegurar que el contenedor exista
                await containerClient.CreateIfNotExistsAsync();

                // Crear el cliente para el blob con el nombre proporcionado
                var blobClient = containerClient.GetBlobClient(fileName);

                // Verificar si el archivo ya existe y eliminarlo
                if (await blobClient.ExistsAsync())
                {
                    await blobClient.DeleteAsync();
                }

                // Definir las opciones de subida con el tipo de contenido de imagen
                var blobHttpHeaders = new BlobHttpHeaders
                {
                    ContentType = contentType
                };

                // Subir la imagen
                await blobClient.UploadAsync(fileStream, new BlobUploadOptions
                {
                    HttpHeaders = blobHttpHeaders
                });

                // Devolver la URL pública de la imagen subida
                return blobClient.Uri.ToString();
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al subir la imagen: {ex.Message}");
                return null;
            }
        }


    }
}
