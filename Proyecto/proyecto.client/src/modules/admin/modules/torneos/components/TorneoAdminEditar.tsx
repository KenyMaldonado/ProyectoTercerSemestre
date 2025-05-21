import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useTournamentData from '../../../hook/useTournamentData';
import { toast } from 'react-toastify';

const TorneoAdminEditar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tournaments, fetchTorneos } = useTournamentData();
  const [torneo, setTorneo] = useState<any | null>(null);
  const [archivoPDF, setArchivoPDF] = useState<File | null>(null);
  const [urlPDF, setUrlPDF] = useState('');

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTorneo(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    let pdfUrl = urlPDF;
    if (archivoPDF) {
      const formData = new FormData();
      formData.append("file", archivoPDF);

      try {
        const response = await fetch("http://localhost:5291/api/TournamentControllers/UploadBasesTournaments", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`
          },
          body: formData
        });
        const result = await response.json();
        if (result.success) {
          pdfUrl = result.data.fileUrl;
        } else {
          toast.error("❌ Error al subir PDF");
          return;
        }
      } catch (err) {
        toast.error("❌ Error de red al subir PDF");
        return;
      }
    }

    const dataActualizada = {
      ...torneo,
      basesTorneo: pdfUrl
    };

    try {
      const res = await fetch(`http://localhost:5291/api/TournamentControllers/UpdateTournament/${id}`, {
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
    <div className="container mt-4">
      <h2>✏️ Editar Torneo</h2>
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
          {urlPDF ? <a href={urlPDF} target="_blank" rel="noopener noreferrer">Ver documento actual</a> : '—'}
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
  );
};

export default TorneoAdminEditar;
