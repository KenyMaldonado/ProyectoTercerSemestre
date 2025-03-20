// src/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';

const MainLayout = () => {
    return (
        <>
        <Navbar />
        <main>
            <Outlet /> {/* Renderiza la ruta hija aquí */}
        </main>
        </>
    );
};

export default MainLayout;
