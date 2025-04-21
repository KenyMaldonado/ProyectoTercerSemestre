import { useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/auth/context/AuthContext';
import { JSX, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

interface JwtPayload {
    exp: number;
    [key: string]: unknown;
}

const isTokenExpired = (token: string) => {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch {
        return true;
    }
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isValidSession, setIsValidSession] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        if (!token || isTokenExpired(token)) {
            toast.error('Tu sesi�n ha expirado. Inicia sesi�n nuevamente.');
            logout();
            setIsValidSession(false);
            navigate('/login');
        }
    }, [logout, navigate]);

    if (!isAuthenticated || !isValidSession) {
        return null;
    }

    return children;
};

export default ProtectedRoute;
