import { useEffect } from 'react';  
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import { useAuth } from '../context/AuthContext'; 

const Login = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();  

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div>
            <LoginForm />
        </div>
    );
};

export default Login;

