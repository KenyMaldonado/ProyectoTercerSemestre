import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!email || !password) {
        setErrorMsg('Por favor, completa todos los campos');
        return;
        }

        try {
        const response = await fetch('https://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Login exitoso:', result);

            // Marca la sesión como autenticada (sin token, usando sessionStorage)
            sessionStorage.setItem('isAuthenticated', 'true');

            // Redirige al panel admin
            navigate('/admin');
        } else {
            const error = await response.text();
            setErrorMsg(error || 'Credenciales inválidas');
        }
        } catch (err) {
        console.error('Error al conectar con la API:', err);
        setErrorMsg('Error de conexión. Intenta más tarde.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Iniciar Sesión</h2>

        {errorMsg && <p className={styles.error}>{errorMsg}</p>}

        <label>Email:</label>
        <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-label="Email"
        />

        <label>Contraseña:</label>
        <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-label="Password"
        />

        <button type="submit">Entrar</button>
        </form>
    );
};

export default LoginForm;
