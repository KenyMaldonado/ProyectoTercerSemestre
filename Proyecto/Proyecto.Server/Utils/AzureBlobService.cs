using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Proyecto.Server.Utils
{
    public class AzureBlobService
    {
        private readonly string _connectionString;
        private readonly string _containerName;

        public AzureBlobService(IConfiguration configuration)
        {
            _connectionString = configuration["AzureBlobStorage:ConnectionString"];
            _containerName = configuration["AzureBlobStorage:ContainerName"];
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

    }
}
