import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useTournamentData from '../../../hook/useTournamentData';
import { toast } from 'react-toastify';
import styles from './TorneoAdminEditar.module.css';
import { usePromptExitGuard } from '../hooks/usePromptExitGuard';

const TorneoAdminEditar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tournaments, fetchTorneos } = useTournamentData();
  const [torneo, setTorneo] = useState<any | null>(null);
  const [archivoPDF, setArchivoPDF] = useState<File | null>(null);
  const [urlPDF, setUrlPDF] = useState('');
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [tieneCambios, setTieneCambios] = useState(false);

  useEffect(() => {
    fetchTorneos();
  }, []);

  useEffect(() => {
    const encontrado = tournaments.find(t => t.torneoId === parseInt(id || ''));
    if (encontrado) {
      setTorneo(encontrado);
      setUrlPDF(encontrado.basesTorneo || '');
    }
  }, [tournaments, id]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (tieneCambios) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [tieneCambios]);

  usePromptExitGuard(tieneCambios, "⚠️ Hay cambios sin guardar. ¿Seguro que deseas salir?");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTorneo((prev: any) => ({ ...prev, [name]: value }));
    setTieneCambios(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (archivoPDF) {
      const formData = new FormData();
      formData.append("file", archivoPDF);
      try {
        const response = await fetch(`http://localhost:5291/api/TournamentControllers/UpdateBasesTournaments?TorneoId=${parseInt(id || '')}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`
          },
          body: formData
        });

        const result = await response.json();
        if (!result.success) {
          toast.error("❌ Error al subir el nuevo PDF");
          return;
        }
        toast.success("📄 PDF actualizado correctamente");
      } catch (err) {
        toast.error("❌ Error de red al subir PDF");
        return;
      }
    }

    const dataActualizada = {
      torneoId: parseInt(id || ''),
      nombre: torneo.nombre,
      descripcion: torneo.descripcion,
      fechaInicio: torneo.fechaInicio,
      fechaFin: torneo.fechaFin,
      fechaInicioInscripcion: torneo.fechaInicioInscripcion,
      fechaFinInscripcion: torneo.fechaFinInscripcion
    };

    try {
      const res = await fetch(`http://localhost:5291/api/TournamentControllers/UpdateTournament`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(dataActualizada)
      });

      if (res.ok) {
        toast.success('✅ Torneo actualizado');
        navigate('/admin/torneos');
      } else {
        toast.error('❌ Error al actualizar torneo');
      }
    } catch (err) {
      toast.error('❌ Error de red');
    }
  };

  if (!torneo) return <p className="text-center">Cargando torneo...</p>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="container mt-4" style={{ flex: 1, padding: '20px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">✏️ Editar Torneo</h2>
          <div>
            <button className="btn btn-danger me-2" onClick={() => setMostrarModalEliminar(true)}>🗑️ Eliminar</button>
            <button className="btn btn-secondary" onClick={() => console.log("🔄 Cambiar estado del torneo:", torneo.torneoId)}>🔄 Cambiar Estado</button>
          </div>
        </div>
        {mostrarModalEliminar && (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>

      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className={`modal-content ${styles.modalAnim}`}>
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Confirmar Eliminación</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setMostrarModalEliminar(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className={styles.bigX}>✖️</div>
              <p className="text-center">¿Estás seguro de que deseas eliminar este torneo?</p>
              </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setMostrarModalEliminar(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  try {
                    const res = await fetch(`http://localhost:5291/api/TournamentControllers/DeleteTournament/${torneo.torneoId}`, {
                      method: 'DELETE',
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`
                      }
                    });

                    if (res.ok) {
                      toast.success("🗑️ Torneo eliminado correctamente");
                      setMostrarModalEliminar(false);
                      navigate('/admin/torneos');
                    } else {
                      toast.error("❌ No se pudo eliminar el torneo");
                    }
                  } catch (err) {
                    toast.error("❌ Error de red al eliminar");
                  }
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )}

  <form onSubmit={handleGuardar} className="bg-light p-4 rounded shadow">
    <div className="mb-2">
      <label>Nombre</label>
      <input className="form-control" name="nombre" value={torneo.nombre} onChange={handleChange} required />
    </div>

    <div className="mb-2">
      <label>Descripción</label>
      <textarea className="form-control" name="descripcion" value={torneo.descripcion} onChange={handleChange} />
    </div>

    <div className="row mb-2">
      <div className="col">
        <label>Fecha Inicio</label>
        <input type="date" name="fechaInicio" className="form-control" value={torneo.fechaInicio.split('T')[0]} onChange={handleChange} required />
      </div>
      <div className="col">
        <label>Fecha Fin</label>
        <input type="date" name="fechaFin" className="form-control" value={torneo.fechaFin.split('T')[0]} onChange={handleChange} required />
      </div>
    </div>

    <div className="row mb-2">
      <div className="col">
        <label>Inicio Inscripción</label>
        <input type="date" name="fechaInicioInscripcion" className="form-control" value={torneo.fechaInicioInscripcion.split('T')[0]} onChange={handleChange} required />
      </div>
      <div className="col">
        <label>Fin Inscripción</label>
        <input type="date" name="fechaFinInscripcion" className="form-control" value={torneo.fechaFinInscripcion.split('T')[0]} onChange={handleChange} required />
      </div>
    </div>

    <div className="mb-2">
      <label>Actualizar PDF (opcional)</label>
      <input type="file" accept=".pdf" className="form-control" onChange={(e) => setArchivoPDF(e.target.files?.[0] || null)} />
    </div>

    <div className="mb-2">
      <label>PDF actual:</label><br />
      {urlPDF ? (
        <a href={`${urlPDF}?v=${new Date().getTime()}`} target="_blank" rel="noopener noreferrer">Ver documento actual</a>
      ) : '—'}
    </div>

    <div className="mb-2">
      <label>Tipo Torneo</label>
      <input className="form-control" value={torneo.nameTipoTorneo} disabled />
    </div>

    <div className="mb-2">
      <label>Tipo Juego</label>
      <input className="form-control" value={torneo.nameTipoJuego} disabled />
    </div>

    <button type="submit" className="btn btn-primary">💾 Guardar Cambios</button>
  </form>
</div>
        
      </div>
  );
};

export default TorneoAdminEditar;

