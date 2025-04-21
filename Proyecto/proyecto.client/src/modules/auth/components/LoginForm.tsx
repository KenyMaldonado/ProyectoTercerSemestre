import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginForm.module.css';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

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
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Iniciar Sesión</h2>
            <label>Email:</label>
            <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
            <label>Contraseña:</label>
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />
            <button type="submit">Entrar</button>
        </form>
    );
};

export default LoginForm;
