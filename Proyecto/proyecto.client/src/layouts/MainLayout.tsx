import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";




const MainLayout = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/admin"]; // rutas donde ocultas el navbar

  return (
    <>
      {/* Mostrar Navbar solo si no es una ruta oculta */}
      {!hideNavbarRoutes.some(route => location.pathname.startsWith(route)) && <Navbar />}
      
      <main>
        <Outlet />
      </main>

      {/* Siempre mostrar el footer */}
      <Footer />
    </>
  );
};

export default MainLayout;

