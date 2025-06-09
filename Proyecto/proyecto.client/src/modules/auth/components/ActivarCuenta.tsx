import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from './ForgotPassword.module.css';

const ActivarCuenta: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromURL = searchParams.get('token');
    setToken(tokenFromURL);
    console.log('🧪 Token recibido desde la URL:', tokenFromURL);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      Swal.fire('Error', 'Token no válido o ausente.', 'error');
      return;
    }

    if (password.length < 6) {
      Swal.fire('Advertencia', 'La contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }

    try {
      const response = await fetch(
        `https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/AuthControllers/ActiveAccount?Token=${encodeURIComponent(
          token
        )}&NewPassword=${encodeURIComponent(password)}`,
        { method: 'PATCH' }
      );

      if (response.ok) {
        Swal.fire('✅ Cuenta activada', 'Tu cuenta fue activada exitosamente.', 'success');
        navigate('/login');
      } else {
        const data = await response.json();
        Swal.fire('❌ Error', data.message || 'Token inválido o expirado.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo conectar al servidor.', 'error');
    }
  };

  return (
    <div className={styles.containerCenter}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Activar Cuenta</h2>

        <input
          type="password"
          required
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingresa tu nueva contraseña"
        />

        <input
          type="password"
          required
          className={styles.input}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirma tu nueva contraseña"
        />

        <button type="submit" className={styles.button}>
          Activar Cuenta
        </button>
      </form>
    </div>
  );
};

export default ActivarCuenta;


