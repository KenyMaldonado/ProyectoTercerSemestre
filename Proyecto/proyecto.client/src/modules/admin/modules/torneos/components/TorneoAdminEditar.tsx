import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useTournamentData from '../../../hook/useTournamentData';
import { toast } from 'react-toastify';
import styles from './TorneoAdminEditar.module.css';
import { usePromptExitGuard } from '../hooks/usePromptExitGuard';
import Swal from 'sweetalert2';

const TorneoAdminEditar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { tournaments, fetchTorneos } = useTournamentData();
  const [torneo, setTorneo] = useState<any | null>(null);
  const [archivoPDF, setArchivoPDF] = useState<File | null>(null);
  const [urlPDF, setUrlPDF] = useState('');
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [tieneCambios, setTieneCambios] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isRedirectingRef = useRef(false);

  usePromptExitGuard(tieneCambios, '⚠️ Tienes cambios sin guardar. ¿Deseas salir sin guardar?');

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

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (tieneCambios && !isRedirectingRef.current) {
        e.preventDefault();
        window.history.pushState(null, '', location.pathname);

        Swal.fire({
          title: '⚠️ Cambios sin guardar',
          text: '¿Deseas salir sin guardar?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, salir',
          cancelButtonText: 'Cancelar',
          reverseButtons: true
        }).then(result => {
          if (result.isConfirmed) {
            setTieneCambios(false);
            isRedirectingRef.current = true;
            window.history.back();
          }
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [tieneCambios, location.pathname]);

  const navegarProtegido = (ruta: string) => {
    if (tieneCambios) {
      Swal.fire({
        title: '⚠️ Cambios sin guardar',
        text: '¿Deseas salir sin guardar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then(result => {
        if (result.isConfirmed) {
          setTieneCambios(false);
          isRedirectingRef.current = true;
          navigate(ruta);
        }
      });
    } else {
      navigate(ruta);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTorneo((prev: any) => ({ ...prev, [name]: value }));
    setTieneCambios(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const hoy = new Date().toISOString().split('T')[0];

    const {
      fechaInicio,
      fechaFin,
      fechaInicioInscripcion,
      fechaFinInscripcion
    } = torneo;

    // Validaciones de fechas
    if (
      fechaInicio < hoy ||
      fechaFin < hoy ||
      fechaInicioInscripcion < hoy ||
      fechaFinInscripcion < hoy
    ) {
      setIsSaving(false);
      Swal.fire('❌ Error en fechas', 'Ninguna fecha puede ser menor al día actual.', 'error');
      return;
    }

    if (fechaInicio > fechaFin) {
      setIsSaving(false);
      Swal.fire('❌ Fechas incorrectas', 'La fecha de inicio del torneo no puede ser mayor que la fecha de fin.', 'error');
      return;
    }

    if (fechaInicioInscripcion > fechaFinInscripcion) {
      setIsSaving(false);
      Swal.fire('❌ Fechas incorrectas', 'La fecha de inicio de inscripción no puede ser mayor que la de fin.', 'error');
      return;
    }

    if (fechaInicio < fechaFinInscripcion) {
      setIsSaving(false);
      Swal.fire('❌ Fechas inválidas', 'La fecha de inicio del torneo no puede ser menor que la fecha fin de inscripción.', 'error');
      return;
    }

    if (fechaFin < fechaFinInscripcion) {
      setIsSaving(false);
      Swal.fire('❌ Fechas inválidas', 'La fecha de fin del torneo no puede ser menor que la fecha fin de inscripción.', 'error');
      return;
    }

    Swal.fire({
      title: 'Guardando cambios...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      backdrop: true,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      if (archivoPDF) {
        const formData = new FormData();
        formData.append("file", archivoPDF);

        const response = await fetch(`http://localhost:5291/api/TournamentControllers/UpdateBasesTournaments?TorneoId=${parseInt(id || '')}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`
          },
          body: formData
        });

        const result = await response.json();
        if (!result.success) {
          Swal.close();
          setIsSaving(false);
          toast.error("❌ Error al subir el nuevo PDF");
          return;
        }
        toast.success("📄 PDF actualizado correctamente");
      }

      const dataActualizada = {
        torneoId: parseInt(id || ''),
        nombre: torneo.nombre,
        descripcion: torneo.descripcion,
        fechaInicio,
        fechaFin,
        fechaInicioInscripcion,
        fechaFinInscripcion
      };

      const res = await fetch(`http://localhost:5291/api/TournamentControllers/UpdateTournament`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(dataActualizada)
      });

      Swal.close();
      setIsSaving(false);

      if (res.ok) {
        toast.success('✅ Torneo actualizado');
        setTieneCambios(false);
        isRedirectingRef.current = true;
        setTimeout(() => {
          navigate('/admin/torneos/gestionar');
        }, 100);
      } else {
        toast.error('❌ Error al actualizar torneo');
      }
    } catch (err) {
      Swal.close();
      setIsSaving(false);
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
            <button className="btn btn-secondary" onClick={() => navegarProtegido('/admin/torneos')}>🔄 Cambiar Estado</button>
          </div>
        </div>

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

          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TorneoAdminEditar;
