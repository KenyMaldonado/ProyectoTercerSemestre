import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './ForgotPassword.module.css';

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.warn('⚠️ Las contraseñas no coinciden');
      return;
    }

    if (!token) {
      toast.error('❌ Token inválido o ausente.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5291/api/AuthControllers/UpdatePasswordWithToken?password=${encodeURIComponent(password)}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('✅ Contraseña actualizada correctamente');
        setTimeout(() => navigate('/login'), 3000);
      } else if (response.status === 401) {
        toast.error('❌ Token inválido o expirado. Vuelve a iniciar el proceso.');
      } else {
        const data = await response.json();
        toast.error(data.message || '❌ Error al actualizar la contraseña.');
      }
    } catch (err) {
      toast.error('⚠️ Error de conexión con el servidor.');
    }
  };

  return (
    <div className={styles.containerCenter}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Establecer nueva contraseña</h2>

        <input
          type="password"
          required
          placeholder="Nueva contraseña"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          required
          placeholder="Confirmar contraseña"
          className={styles.input}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" className={styles.button}>
          Guardar contraseña
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;

