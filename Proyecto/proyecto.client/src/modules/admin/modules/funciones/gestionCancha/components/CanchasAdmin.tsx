import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import styles from './CanchasAdmin.module.css';

interface Chancha {
  canchaId: number;
  nombre: string;
  capacidad: number;
  estado?: string;
}

const API_URL =
  'https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/MatchesControllers';

const ChanchasAdmin: React.FC = () => {
  const [chanchas, setChanchas] = useState<Chancha[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [mostrarFormularioEdicion, setMostrarFormularioEdicion] = useState(false);
  const [formEdit, setFormEdit] = useState<Chancha | null>(null);
  const [newForm, setNewForm] = useState<Omit<Chancha, 'canchaId'>>({ nombre: '', capacidad: 0 });
  const token = localStorage.getItem('authToken');

  const fetchChanchas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/GetCanchas`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setChanchas(json.data.map((c: any) => ({ ...c, canchaId: Number(c.canchaId) })));
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (err) {
      console.error('❌ Error al cargar las canchas:', err);
      Swal.fire('Error', 'No se pudieron cargar las canchas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChanchas();
  }, []);

  const handleEdit = (cancha: Chancha) => {
    setFormEdit(cancha);
    setMostrarFormularioEdicion(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.nombre.trim() || newForm.nombre.trim().length < 3) {
      Swal.fire('⚠️ Nombre inválido', 'El nombre debe tener al menos 3 caracteres.', 'warning');
      return;
    }
    if (newForm.capacidad <= 0) {
      Swal.fire('⚠️ Capacidad inválida', 'Debe ser mayor a 0.', 'warning');
      return;
    }

    const payload = {
      nombre: newForm.nombre.trim(),
      capacidad: newForm.capacidad,
      estado: 'Disponible'
    };

    try {
      const res = await fetch(`${API_URL}/CreateCancha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire('✅ Cancha creada', 'Se registró correctamente.', 'success');
        setNewForm({ nombre: '', capacidad: 0 });
        fetchChanchas();
      } else {
        const error = await res.text();
        console.error('❌ Error del backend:', error);
        Swal.fire('❌ Error', 'No se pudo crear la cancha.', 'error');
      }
    } catch (error) {
      console.error('🧨 Error en la petición:', error);
      Swal.fire('❌ Error de red', 'No se pudo conectar con el servidor.', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEdit || !formEdit.canchaId) {
      Swal.fire("❌ Error", "ID de cancha no válido para actualizar.", "error");
      return;
    }

    const { canchaId, nombre, capacidad, estado } = formEdit;

    try {
      const res = await fetch(`${API_URL}/UpdateCancha`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ canchaId, nombre, capacidad, estado })
      });

      if (res.ok) {
        Swal.fire('✅ Cancha actualizada', 'La cancha fue modificada correctamente.', 'success');
        setFormEdit(null);
        setMostrarFormularioEdicion(false);
        fetchChanchas();
      } else {
        const error = await res.text();
        console.error('❌ Error del backend:', error);
        Swal.fire('❌ Error', 'No se pudo actualizar la cancha.', 'error');
      }
    } catch (err) {
      console.error('❌ Error en la petición:', err);
      Swal.fire('❌ Error de red', 'No se pudo conectar con el servidor.', 'error');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className="text-2xl font-bold text-center mb-4">🏟️ Administración de Canchas</h2>

      {!mostrarFormularioEdicion ? (
        <div className="bg-light p-4 rounded shadow-sm mb-4">
          <h3 className="text-lg font-semibold mb-3">➕ Crear nueva cancha</h3>
          <form onSubmit={handleCreateSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                value={newForm.nombre}
                onChange={(e) => setNewForm({ ...newForm, nombre: e.target.value })}
                placeholder="Ej. Cancha Norte"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Capacidad</label>
              <input
                type="number"
                className="form-control"
                value={newForm.capacidad}
                onChange={(e) => setNewForm({ ...newForm, capacidad: +e.target.value })}
                placeholder="Ej. 100"
                required
              />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100">💾 Crear Chancha</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-light p-4 rounded shadow-sm mb-4">
          <h3 className="text-lg font-semibold mb-3">✏️ Editar cancha</h3>
          <form onSubmit={handleEditSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                value={formEdit?.nombre || ''}
                onChange={(e) => setFormEdit({ ...formEdit!, nombre: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Capacidad</label>
              <input
                type="number"
                className="form-control"
                value={formEdit?.capacidad || 0}
                onChange={(e) => setFormEdit({ ...formEdit!, capacidad: +e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={formEdit?.estado || 'Disponible'}
                onChange={(e) => setFormEdit({ ...formEdit!, estado: e.target.value })}
              >
                <option value="Disponible">Disponible</option>
                <option value="Reservada">Reservada</option>
                <option value="Ocupada">Ocupada</option>
                <option value="EnMantenimiento">En Mantenimiento</option>
                <option value="FueraDeServicio">Fuera de Servicio</option>
                <option value="Eliminado">Eliminado</option>
              </select>
            </div>
            <div className="col-12 d-flex gap-2">
              <button type="submit" className="btn btn-success w-100">💾 Guardar cambios</button>
              <button type="button" className="btn btn-secondary w-100" onClick={() => { setFormEdit(null); setMostrarFormularioEdicion(false); }}>❌ Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-center">⏳ Cargando canchas...</p>
      ) : (
        <table className="table table-striped table-bordered">
          <thead className="table-success">
            <tr>
              <th>Nombre</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {chanchas.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">No hay canchas registradas.</td>
              </tr>
            ) : (
              chanchas.map((cancha) => (
                <tr key={cancha.canchaId}>
                  <td>{cancha.nombre}</td>
                  <td>{cancha.capacidad}</td>
                  <td>{cancha.estado || '—'}</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(cancha)}>✏️ Editar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ChanchasAdmin;
