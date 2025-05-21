import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { updateTeam, updateTeamLogo } from '../../../services/api';

const EquipoForm: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const equipo = location.state?.equipo;

    const [nombre, setNombre] = useState<string>(equipo?.nombre || '');
    const [colorUniforme, setColorUniforme] = useState<string>(equipo?.colorUniforme || '');
    const [colorUniformeSecundario, setColorUniformeSecundario] = useState<string>(equipo?.colorUniformeSecundario || '');
    const [logo, setLogo] = useState<File | null>(null);

    // Estados para comparar si hay cambios
    const [initialNombre] = useState<string>(equipo?.nombre || '');
    const [initialColorUniforme] = useState<string>(equipo?.colorUniforme || '');
    const [initialColorUniformeSecundario] = useState<string>(equipo?.colorUniformeSecundario || '');

    if (!equipo) {
        return <p>No se encontró el equipo</p>;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setLogo(e.target.files[0]);
        }
    };

    // Verificar si hay cambios en el formulario
    const hasChanges = (): boolean => {
        return (
            nombre !== initialNombre || 
            colorUniforme !== initialColorUniforme || 
            colorUniformeSecundario !== initialColorUniformeSecundario || 
            logo !== null
        );
    };

    const handleUpdate = async () => {
        try {
            const isTeamUpdated = await updateTeam(equipo.equipoId, nombre, colorUniforme, colorUniformeSecundario);
            if (!isTeamUpdated) throw new Error('Error al actualizar el equipo');

            if (logo) {
                const isLogoUpdated = await updateTeamLogo(equipo.equipoId, logo);
                if (!isLogoUpdated) throw new Error('Error al actualizar el logo');
            }

            Swal.fire('¡Éxito!', 'El equipo se actualizó correctamente.', 'success').then(() => {
                navigate('/admin/equipos');
            });
        } catch (error: any) {
            Swal.fire('Error', error.message || 'No se pudo actualizar el equipo.', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Verificar si no hay cambios antes de proceder
        if (!hasChanges()) {
            Swal.fire('Sin cambios', 'No hay modificaciones para guardar.', 'info');
            return;
        }

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas guardar los cambios?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar'
        });

        if (result.isConfirmed) {
            await handleUpdate();
        }
    };

    return (
        <div className="container mt-5 d-flex justify-content-center">
            <div 
                className="card shadow p-4" 
                style={{ width: '70%', maxWidth: '800px' }}
            >
                <h3 className="text-center mb-4">Editar Equipo: {equipo.nombre}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Nombre del equipo:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Nombre del equipo"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Color Primario:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={colorUniforme}
                            onChange={(e) => setColorUniforme(e.target.value)}
                            placeholder="Color primario"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Color Secundario:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={colorUniformeSecundario}
                            onChange={(e) => setColorUniformeSecundario(e.target.value)}
                            placeholder="Color secundario"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Logo del equipo (opcional):</label>
                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>

                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EquipoForm;
