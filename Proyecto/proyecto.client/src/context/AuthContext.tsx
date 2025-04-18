import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
    isAuthenticated: boolean;
    userName: string | null;
    login: (token:string) => void;
    logout: () => void;
}
interface JwtPayload {
    name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
            try {
                const decoded: JwtPayload = jwtDecode(token);
                setUserName(decoded.name ?? null);
            } catch {
                console.warn("Token inválido o expirado");
                logout(); 
            }
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem('authToken', token);
        setIsAuthenticated(true);
        const decoded: JwtPayload = jwtDecode(token);
        setUserName(decoded.name ?? null);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserName(null);
        localStorage.removeItem('authToken');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userName, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return context;
};
