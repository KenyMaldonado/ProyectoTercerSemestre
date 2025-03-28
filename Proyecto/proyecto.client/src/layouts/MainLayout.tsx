import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

const MainLayout = () => {
    const location = useLocation();
    const hideNavbarRoutes = ["/login", "/admin"]; // Rutas sin Navbar

    return (
        <div>
        {!hideNavbarRoutes.some(route => location.pathname.startsWith(route)) && <Navbar />}
        <Outlet />
        </div>
    );
};

export default MainLayout;
