import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import styles from './ForgotPassword.module.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // Paso 1: ingresar correo, Paso 2: ingresar código
  const [code, setCode] = useState('');
  const navigate = useNavigate(); // Para redirigir

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5291/api/AuthControllers/LostPassword?correo=${encodeURIComponent(email.trim())}`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        toast.success('✅ Código enviado al correo. Revisa tu bandeja de entrada y spam.');
        setStep(2); // Cambiar al paso 2
      } else {
        const data = await response.json();
        toast.error(data.message || '❌ No se pudo enviar el código.');
      }
    } catch {
      toast.error('⚠️ Error de conexión con el servidor.');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const correoLimpio = email.trim();
      const codigoLimpio = code.trim();

      const response = await fetch(
        `https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/AuthControllers/VerifyCode?correo=${encodeURIComponent(correoLimpio)}&code=${encodeURIComponent(codigoLimpio)}`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('✅ Código verificado correctamente. Redirigiendo al cambio de contraseña...');
        const token = data.data;
        navigate(`/reset-password?token=${encodeURIComponent(token)}`);
      } else {
        toast.error(data.message || '❌ Código incorrecto o expirado.');
      }
    } catch {
      toast.error('⚠️ Error de conexión con el servidor.');
    }
  };

  return (
    <div className={styles.containerCenter}>
      {step === 1 && (
        <form onSubmit={handleSendEmail} className={styles.form}>
          <img
            src="https://moria.aurens.com/organizations/a053e450-5348-4b74-a280-4ee520bf6294/logos/5dzj3l-1.png"
            alt="Logo"
            className={styles.logo}
          />
          <h2 className={styles.title}>Recuperar contraseña</h2>

          <input
            type="email"
            required
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu correo"
          />

          <button type="submit" className={styles.button}>
            Enviar código
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className={styles.form}>
          <h2 className={styles.title}>Verificar código</h2>

          <input
            type="email"
            value={email}
            disabled
            className={styles.input}
          />

          <input
            type="text"
            required
            className={styles.input}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ingresa el código recibido"
          />

          <button type="submit" className={styles.button}>
            Verificar código
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;




