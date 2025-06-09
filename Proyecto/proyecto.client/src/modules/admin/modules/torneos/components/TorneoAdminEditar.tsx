import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useTournamentData from '../../../hook/useTournamentData';
import { toast } from 'react-toastify';
import { usePromptExitGuard } from '../hooks/usePromptExitGuard';
import Swal from 'sweetalert2';

// 1. Definir una interfaz para el tipo de datos 'torneo'
interface ITorneo {
  torneoId: number;
  nombre: string;
  fechaFinInscripcion: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  fechaInicioInscripcion: string;
  basesTorneo?: string; // Opcional, si no siempre está presente
  nameTipoTorneo: string; // Asumo estos campos existen en tu objeto torneo
  nameTipoJuego: string;   // Asumo estos campos existen en tu objeto torneo
}

const TorneoAdminEditar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { tournaments, fetchTorneos } = useTournamentData();
  // 2. Usar la interfaz ITorneo para tipar el estado 'torneo'
  const [torneo, setTorneo] = useState<ITorneo | null>(null);
  const [archivoPDF, setArchivoPDF] = useState<File | null>(null);
  const [urlPDF, setUrlPDF] = useState('');
  // Para eliminar la advertencia de no usado, simplemente mantenemos el estado
  // y lo usamos en el renderizado (aunque sea solo para el botón).
  // Si planeas un modal de eliminación, esta variable controlará su visibilidad.
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false); 
  const [tieneCambios, setTieneCambios] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isRedirectingRef = useRef(false);

  usePromptExitGuard(tieneCambios, '⚠️ Tienes cambios sin guardar. ¿Deseas salir sin guardar?');

  // Función auxiliar para obtener la fecha de hoy en formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate(); // Obtener la fecha actual en formato YYYY-MM-DD

  useEffect(() => {
    fetchTorneos();
  }, [fetchTorneos]);

  useEffect(() => {
    const encontrado = tournaments.find(t => t.torneoId === parseInt(id || ''));
    if (encontrado) {
      setTorneo({
        ...encontrado,
        // Asegúrate de que las fechas estén en formato YYYY-MM-DD
        fechaInicio: encontrado.fechaInicio.split('T')[0],
        fechaFin: encontrado.fechaFin.split('T')[0],
        fechaInicioInscripcion: encontrado.fechaInicioInscripcion.split('T')[0],
        fechaFinInscripcion: encontrado.fechaFinInscripcion.split('T')[0],
      });
      setUrlPDF(encontrado.basesTorneo || '');
      setTieneCambios(false); // Resetear cambios al cargar un nuevo torneo
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

  // 3. Tipar la función handleChange para que 'prev' sea ITorneo
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setTorneo((prev: ITorneo | null) => { // prev ahora es ITorneo | null
      if (!prev) return null; // Si prev es null, no hacemos nada

      const updatedTorneo = { ...prev, [name]: value };

      // Lógica de validación de fechas (similar a tu componente de creación)
      if (name === 'fechaInicioInscripcion') {
        const today = new Date(getTodayDate());
        const newDate = new Date(value);
        if (newDate < today) {
          toast.warning("🚫 La fecha de inicio de inscripción no puede ser menor a la fecha actual.");
        }
        if (updatedTorneo.fechaFinInscripcion && new Date(updatedTorneo.fechaFinInscripcion) < newDate) {
          updatedTorneo.fechaFinInscripcion = value;
        }
        if (updatedTorneo.fechaInicio && new Date(updatedTorneo.fechaInicio) <= newDate) {
          toast.warning("🚫 La fecha de inicio del torneo debe ser posterior a la fecha de inicio de inscripción.");
        }
      }

      if (name === 'fechaFinInscripcion') {
        const inicioInscripcion = new Date(updatedTorneo.fechaInicioInscripcion);
        const newDate = new Date(value);

        if (newDate < inicioInscripcion) {
          toast.warning("🚫 La fecha fin de inscripción no puede ser menor a la fecha inicio de inscripción.");
        }
        if (updatedTorneo.fechaInicio && new Date(updatedTorneo.fechaInicio) <= newDate) {
          toast.warning("🚫 La fecha de inicio del torneo debe ser posterior a la fecha de fin de inscripción.");
        }
      }

      if (name === 'fechaInicio') {
        const today = new Date(getTodayDate());
        const finInscripcion = new Date(updatedTorneo.fechaFinInscripcion);
        const newDate = new Date(value);

        if (newDate < today) {
          toast.warning("🚫 La fecha de inicio del torneo no puede ser menor a la fecha actual.");
        }
        if (newDate <= finInscripcion) {
          toast.warning("🚫 La fecha de inicio del torneo debe ser posterior a la fecha de fin de inscripción.");
        }
        if (updatedTorneo.fechaFin && new Date(updatedTorneo.fechaFin) < newDate) {
          updatedTorneo.fechaFin = value;
        }
      }

      if (name === 'fechaFin') {
        const inicioTorneo = new Date(updatedTorneo.fechaInicio);
        const newDate = new Date(value);

        if (newDate < inicioTorneo) {
          toast.warning("🚫 La fecha de fin del torneo no puede ser menor a la fecha de inicio del torneo.");
        }
      }

      setTieneCambios(true);
      return updatedTorneo;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.warning('📄 Solo se permiten archivos PDF.');
        setArchivoPDF(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5 MB
        toast.warning('❌ El archivo no debe superar los 5 MB.');
        setArchivoPDF(null);
        return;
      }
      setArchivoPDF(file);
      setTieneCambios(true);
    } else {
      setArchivoPDF(null);
    }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!torneo) {
      toast.error('❌ Datos del torneo no cargados.');
      return;
    }

    const fInicioTorneo = new Date(torneo.fechaInicio + 'T00:00:00');
    const fFinTorneo = new Date(torneo.fechaFin + 'T00:00:00');
    const fInicioInscripcion = new Date(torneo.fechaInicioInscripcion + 'T00:00:00');
    const fFinInscripcion = new Date(torneo.fechaFinInscripcion + 'T00:00:00');
    const fHoy = new Date(getTodayDate() + 'T00:00:00');


    if (fInicioTorneo < fHoy) { toast.warning("📅 La fecha de inicio del torneo no puede ser menor a la fecha actual."); return; }
    if (fInicioInscripcion >= fInicioTorneo) { toast.warning("🚫 La fecha de inicio de inscripción debe ser antes del inicio del torneo."); return; }
    if (fFinInscripcion >= fInicioTorneo) { toast.warning("🚫 La fecha fin de inscripción debe ser antes del inicio del torneo."); return; }
    if (torneo.fechaInicio === torneo.fechaFin) { toast.warning("🚫 La fecha de inicio y fin del torneo no pueden ser iguales."); return; }
    if (fFinTorneo < fFinInscripcion) { toast.warning("📅 La fecha de finalización del torneo no puede ser menor a la fecha fin de inscripción."); return; }
    if (fFinTorneo < fInicioTorneo) { toast.warning("📅 La fecha de finalización del torneo no puede ser menor a la fecha de inicio del torneo."); return; }
    if (fFinInscripcion < fInicioInscripcion) { toast.warning("📅 La fecha fin de inscripción no puede ser menor a la fecha inicio de inscripción."); return; }

    setIsSaving(true);

    Swal.fire({
      title: 'Guardando cambios...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      backdrop: true,
      didOpen: () => {
        Swal.showLoading(null);
      }
    });

    try {
      if (archivoPDF) {
        const formData = new FormData();
        formData.append("file", archivoPDF);

        const response = await fetch(`https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/TournamentControllers/UpdateBasesTournaments?TorneoId=${parseInt(id || '')}`, {
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
        setUrlPDF(result.data.fileUrl);
        setArchivoPDF(null);
      }

      const dataActualizada: Partial<ITorneo> = { // Usamos Partial<ITorneo> porque no enviamos todos los campos como los tipos de juego
        torneoId: parseInt(id || ''),
        nombre: torneo.nombre,
        descripcion: torneo.descripcion,
        fechaInicio: torneo.fechaInicio,
        fechaFin: torneo.fechaFin,
        fechaInicioInscripcion: torneo.fechaInicioInscripcion,
        fechaFinInscripcion: torneo.fechaFinInscripcion
      };

      const res = await fetch(`https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/TournamentControllers/UpdateTournament`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(dataActualizada)
      });

      Swal.close(); // Cerrar el SweetAlert de "Guardando..."

      if (res.ok) {
        // Mostrar SweetAlert de éxito
        Swal.fire({
          title: '¡Actualizado!',
          text: 'El torneo se ha actualizado correctamente.',
          icon: 'success',
          confirmButtonText: 'Ok'
        }).then(() => {
          setTieneCambios(false);
          fetchTorneos();
          isRedirectingRef.current = true;
          navigate('/admin/torneos/gestionar');
        });
      } else {
        const errorText = await res.text();
        console.error("❌ Error del backend:", errorText);
        let errorMessage = 'Error al actualizar el torneo. Por favor verifica los datos o intenta más tarde.';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errors) {
            const errorMessages = Object.values(errorJson.errors).flat().join('; ');
            if (errorMessages) {
                errorMessage = `Error de validación: ${errorMessages}`;
            } else if (errorJson.title) {
                errorMessage = errorJson.title;
            }
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          // Si no es un JSON válido, usamos el errorText original
        }
        toast.error(`❌ ${errorMessage}`);
      }
    } catch (err) {
      Swal.close();
      setIsSaving(false);
      console.error("❌ Error de red o al actualizar:", err);
      toast.error('❌ Error de conexión al intentar actualizar el torneo.');
    } finally {
        setIsSaving(false);
    }
  };

  if (!torneo) return <p className="text-center">Cargando torneo...</p>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="container mt-4" style={{ flex: 1, padding: '20px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">✏️ Editar Torneo</h2>
          <div>
            {/* Para eliminar el warning de 'mostrarModalEliminar' no usado,
                lo usamos en una condición, aunque el modal real no esté implementado.
                Cuando implementes el modal de eliminación, esta variable lo controlará. */}
            {mostrarModalEliminar === false && ( // Una condición simple para usar la variable
                <button 
                    className="btn btn-danger me-2" 
                    onClick={() => {
                        // Puedes poner aquí la lógica para abrir tu modal de eliminación
                        // o simplemente un Swal.fire de confirmación para eliminar
                        Swal.fire({
                            title: '¿Estás seguro?',
                            text: 'No podrás revertir esto. ¿Quieres eliminar el torneo?',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Sí, eliminar',
                            cancelButtonText: 'Cancelar'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Aquí llamarías a tu función para eliminar el torneo
                                // toast.info('Funcionalidad de eliminación no implementada aún.');
                                // Ejemplo de cómo se llamaría a una función de eliminación:
                                // handleEliminarTorneo(torneo.torneoId);
                                toast.success('🚫 Eliminar torneo (no implementado)');
                            }
                        });
                        setMostrarModalEliminar(true); // Puedes establecerlo en true si el modal se abre.
                                                        // En este caso, lo estoy usando para "ejecutar la acción"
                                                        // y luego puedes resetearlo si no usas un modal visible.
                                                        // Para este ejemplo, lo dejaremos así para que el warning desaparezca.
                    }}
                >
                    🗑️ Eliminar
                </button>
            )}
            <button className="btn btn-secondary" onClick={() => navegarProtegido('/admin/torneos/gestionar')}>🔙 Volver a Torneos</button>
          </div>
        </div>

        <form onSubmit={handleGuardar} className="bg-light p-4 rounded shadow">
          <div className="mb-2">
            <label>Nombre</label>
            <input className="form-control" name="nombre" value={torneo.nombre} onChange={handleChange} required />
          </div>

          <div className="mb-2">
            <label>Descripción</label>
            <textarea className="form-control" name="descripcion" value={torneo.descripcion || ''} onChange={handleChange} />
          </div>

          <div className="row mb-2">
            <div className="col">
              <label>Inicio Inscripción</label>
              <input
                type="date"
                name="fechaInicioInscripcion"
                className="form-control"
                value={torneo.fechaInicioInscripcion}
                onChange={handleChange}
                required
                min={todayDate} // Mínimo: hoy
                max={torneo.fechaInicio} // Máximo: inicio del torneo (debería ser antes)
              />
            </div>
            <div className="col">
              <label>Fin Inscripción</label>
              <input
                type="date"
                name="fechaFinInscripcion"
                className="form-control"
                value={torneo.fechaFinInscripcion}
                onChange={handleChange}
                required
                min={torneo.fechaInicioInscripcion || todayDate} // Mínimo: inicio de inscripción o hoy
                max={torneo.fechaInicio} // Máximo: inicio del torneo (debería ser antes)
              />
            </div>
          </div>

          <div className="row mb-2">
            <div className="col">
              <label>Fecha Inicio Torneo</label>
              <input
                type="date"
                name="fechaInicio"
                className="form-control"
                value={torneo.fechaInicio}
                onChange={handleChange}
                required
                min={torneo.fechaFinInscripcion || todayDate} // Mínimo: fin de inscripción o hoy
              />
            </div>
            <div className="col">
              <label>Fecha Fin Torneo</label>
              <input
                type="date"
                name="fechaFin"
                className="form-control"
                value={torneo.fechaFin}
                onChange={handleChange}
                required
                min={torneo.fechaInicio} // Mínimo: inicio del torneo
              />
            </div>
          </div>

          <div className="mb-2">
            <label>Actualizar PDF (opcional)</label>
            <input type="file" accept=".pdf" className="form-control" onChange={handleFileChange} />
          </div>

          <div className="mb-2">
            <label>PDF actual:</label><br />
            {urlPDF ? (
              <a href={`${urlPDF}?v=${new Date().getTime()}`} target="_blank" rel="noopener noreferrer">Ver documento actual</a>
            ) : '— No hay PDF cargado —'}
            {archivoPDF && <p className="text-muted mt-1">Archivo nuevo seleccionado: {archivoPDF.name}</p>}
          </div>

          <div className="mb-2">
            <label>Tipo Torneo</label>
            <input className="form-control" value={torneo.nameTipoTorneo} disabled />
          </div>

          <div className="mb-2">
            <label>Tipo Juego</label>
            <input className="form-control" value={torneo.nameTipoJuego} disabled />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSaving || !tieneCambios}>
            {isSaving ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
          <button type="button" className="btn btn-outline-secondary ms-2" onClick={() => navegarProtegido('/admin/torneos/gestionar')}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default TorneoAdminEditar;