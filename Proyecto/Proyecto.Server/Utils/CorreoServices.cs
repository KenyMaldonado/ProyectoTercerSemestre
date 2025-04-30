using System.Net.Mail;
using System.Net;
using Proyecto.Server.DTOs;
using System.Security.Cryptography;

namespace Proyecto.Server.Utils
{
    public class CorreoServices
    {
        private readonly string _remitente = "torneosmesoamericana@gmail.com";
        private readonly string _nombreRemitente = "TorneosMesoAmericana";
        private readonly string _claveApp = "inxk tvuf ywkl kvyx"; 
        

       
        public async Task<bool> EnviarCodigoVerificacionAsync(string destinatario,CodigoDTO codigo)
        {
            try
            {
                var mensaje = new MailMessage
                {
                    From = new MailAddress(_remitente, _nombreRemitente),
                    Subject = "Código de verificación de cuenta",
                    Body = $"<p>Hola,</p><p>Gracias por registrarte. Tu código de verificación es:</p><h2>{codigo.Codigo}</h2>" +
                    $"<p>tu codigo vence el {codigo.FechaExpiracion}</p><p>Si no solicitaste este código, ignora este mensaje.</p>",
                    IsBodyHtml = true
                };

                mensaje.To.Add(destinatario);

                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    EnableSsl = true,
                    Credentials = new NetworkCredential(_remitente, _claveApp)
                };

                await smtpClient.SendMailAsync(mensaje);
                return true;
            }
            catch
            {
                return false;
            }
        }


        public CodigoDTO GenerarCodigo()
        {
            CodigoDTO codigo = new CodigoDTO();
            codigo.Codigo = GenerarCodigo10Digitos();
            codigo.FechaCreacion = DateTime.Now;
            codigo.FechaExpiracion = DateTime.Now.AddMinutes(15);

            return codigo;
        }

        private string GenerarCodigo10Digitos()
        {
            var bytes = new byte[10];
            RandomNumberGenerator.Fill(bytes);

            string codigo = "";
            foreach (var b in bytes)
            {
                codigo += (b % 10).ToString();
            }

            return codigo;
        }
    }
}
