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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!shouldHideNavbar && <Navbar />}

      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>

      {!shouldHideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
