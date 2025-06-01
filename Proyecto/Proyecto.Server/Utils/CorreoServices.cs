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



        public async Task<bool> EnviarCodigoVerificacionAsync(string destinatario, CodigoDTO codigo)
        {
            try
            {
                var mensaje = new MailMessage
                {
                    From = new MailAddress(_remitente, _nombreRemitente),
                    Subject = "Código para restablecer tu contraseña",
                    IsBodyHtml = true,
                    Body = $@"
<div style=""font-family: Arial, sans-serif; background-color: #f1fdf3; padding: 30px;"">
  <div style=""max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 20px;"">

    <div style=""text-align: center; margin-bottom: 20px;"">
      <img src=""https://documentstorneoumes.blob.core.windows.net/asset/logoMesotrans.png"" alt=""Logo Universidad Mesoamericana"" style=""width: 150px; max-width: 100%; height: auto;"">
    </div>

    <h2 style=""text-align: center; color: #2e7d32; margin-top: 0;"">Solicitud de restablecimiento de contraseña</h2>

    <p style=""font-size: 16px; color: #333; line-height: 1.5;"">
      Hola, hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si tú realizaste esta solicitud, utiliza el siguiente código para continuar con el proceso:
    </p>

    <div style=""text-align: center; margin: 30px 0;"">
      <span style=""background-color: #4CAF50; color: #fff; padding: 15px 30px; font-size: 24px; border-radius: 8px; display: inline-block; letter-spacing: 2px;"">
        {codigo.Codigo}
      </span>
    </div>

    <p style=""font-size: 15px; color: #555; text-align: center;"">
      Este código expirará el <strong>{codigo.FechaExpiracion:dddd, dd MMMM yyyy hh:mm tt}</strong>.
    </p>

    <p style=""font-size: 14px; color: #777; line-height: 1.6;"">
      Si no solicitaste el restablecimiento de tu contraseña, puedes ignorar este mensaje. Tu información permanecerá segura.
    </p>

    <p style=""font-size: 14px; color: #444; margin-top: 30px;"">
      Atentamente,<br>
      <strong>Equipo de Soporte</strong><br>
      <span style=""color: #4CAF50;"">Universidad Mesoamericana</span>
    </p>

    <hr style=""border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;"">
    <p style=""text-align: center; font-size: 12px; color: #aaa;"">
      © {DateTime.UtcNow.Year} Universidad Mesoamericana. Todos los derechos reservados.
    </p>
  </div>
</div>"
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

        public async Task<bool> EnviarLinkActivarCuentaAsync(string destinatario, string token)
        {
            try
            {
                var urlActivacion = $"http://localhost:5173/activar-cuenta?token={token}";

                var mensaje = new MailMessage
                {
                    From = new MailAddress(_remitente, _nombreRemitente),
                    Subject = "Activa tu cuenta y configura tu contraseña",
                    IsBodyHtml = true,
                    Body = $@"
<div style=""font-family: Arial, sans-serif; background-color: #f1fdf3; padding: 30px;"">
  <div style=""max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 20px;"">

    <div style=""text-align: center; margin-bottom: 20px;"">
      <img src=""https://documentstorneoumes.blob.core.windows.net/asset/logoMesotrans.png"" alt=""Logo Universidad Mesoamericana"" style=""width: 150px; max-width: 100%; height: auto;"">
    </div>

    <h2 style=""text-align: center; color: #2e7d32; margin-top: 0;"">Activa tu cuenta</h2>

    <p style=""font-size: 16px; color: #333; line-height: 1.5;"">
      ¡Bienvenido! Para completar el registro y configurar tu contraseña por primera vez, por favor haz clic en el siguiente botón:
    </p>

    <div style=""text-align: center; margin: 30px 0;"">
      <a href=""{urlActivacion}"" style=""background-color: #4CAF50; color: white; padding: 15px 40px; font-size: 18px; border-radius: 8px; text-decoration: none; display: inline-block;"">
        Activar cuenta
      </a>
    </div>

    <p style=""font-size: 14px; color: #777; line-height: 1.6;"">
      Si no solicitaste esta activación, puedes ignorar este mensaje. Tu cuenta no será activada sin este paso.
    </p>

    <p style=""font-size: 14px; color: #444; margin-top: 30px;"">
      Atentamente,<br>
      <strong>Equipo de Soporte</strong><br>
      <span style=""color: #4CAF50;"">Universidad Mesoamericana</span>
    </p>

    <hr style=""border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;"">
    <p style=""text-align: center; font-size: 12px; color: #aaa;"">
      © {DateTime.UtcNow.Year} Universidad Mesoamericana. Todos los derechos reservados.
    </p>
  </div>
</div>"
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
