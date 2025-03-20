import { useState } from 'react';
import styles from './LoginForm.module.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
        alert('Por favor, completa todos los campos');
        return;
        }

    console.log('Login con:', { email, password });
    // Aquí podrías llamar a un backend
};

return (
    <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Iniciar Sesión</h2>
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
