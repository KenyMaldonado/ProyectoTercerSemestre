import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";


const MainLayout = () => {
  const location = useLocation();

  const hideNavbarRoutes = ["/login", "/admin"];
  const hideFooterRoutes = ["/admin"];

  const shouldHideNavbar = hideNavbarRoutes.some(route => location.pathname.startsWith(route));
  const shouldHideFooter = hideFooterRoutes.some(route => location.pathname.startsWith(route));

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <main>
        <Outlet />
      </main>

      {!shouldHideFooter && <Footer />}
    </>
  );
};

export default MainLayout;


