import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';

const MainLayout = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    return (
        <div>
            {!isLoginPage && <Navbar />}
            <Outlet />
        </div>
    );
};

export default MainLayout;
