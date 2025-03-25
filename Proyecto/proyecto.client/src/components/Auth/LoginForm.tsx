import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginForm.module.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            alert('Completa todos los campos');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:5291/api/AuthControllers/AuthUser', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    correo: email, 
                    contrasenia: password 
                })
            });
    
            if (!response.ok) throw new Error('Credenciales inválidas');
            
            // Si el servidor devuelve un JWT o algún token de autenticación
            const { token } = await response.json();  // Asumiendo que el servidor responde con un token
            
            // Almacenar el token en el almacenamiento local o en un contexto
            localStorage.setItem('authToken', token);  // O usar contexto de React si prefieres
            login();  // Usar el método de login de tu contexto de autenticación
            navigate('/admin');
        } catch (err) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert('Ocurrió un error desconocido');
            }
        }
    };
    

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Iniciar Sesión</h2>
            <label>Email:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <label>Contraseña:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit">Entrar</button>
        </form>
    );
};

export default LoginForm;
