import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginForm.module.css';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

interface JwtPayload {
  unique_name?: string;
  exp?: number;
}

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warn('⚠️ Completa todos los campos');
      return;
    }

    try {
      const response = await fetch('http://localhost:5291/api/AuthControllers/AuthUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: email, contrasenia: password }),
      });

      const Data = await response.json();

      switch (response.status) {
        case 200: {
          localStorage.setItem('authToken', Data.data.token);
          const decoded: JwtPayload = jwtDecode(Data.data.token);
          const userName = decoded.unique_name || 'Usuario';

          login(Data.data.token); // Actualizar contexto
          toast.success(`¡Sesión iniciada! Bienvenido, ${userName}`);
          navigate('/admin');
          break;
        }

        case 400:
          toast.error('Verifica el correo y la contraseña.');
          break;
        case 401:
          toast.error('Credenciales incorrectas.');
          break;
        case 404:
          toast.error('Usuario no encontrado.');
          break;
        default:
          toast.error('🚨 Error inesperado. Intenta más tarde.');
          break;
      }

    } catch (err) {
      if (err instanceof Error) {
        toast.warn(`⚠️ Error de red: ${err.message}`);
      } else {
        toast.error('Ocurrió un error desconocido.');
      }
    }
  };

  return (
    <div className={styles.containerCenter}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <img
          src="https://moria.aurens.com/organizations/a053e450-5348-4b74-a280-4ee520bf6294/logos/5dzj3l-1.png"
          alt="Login Icon"
          className={styles.logo}
        />

        <h2 className={styles.title}>Iniciar Sesión</h2>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='Correo Electronico'
          required
        />
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder='Contraseña'
          required
        />

        <button type="submit" className={styles.button}>
          Acceder
        </button>

        <Link to="/recuperar-contrasena" className={styles.lostPassword}>¿Olvidó su contraseña?</Link>
      </form>
    </div>
  );
};

export default LoginForm;

