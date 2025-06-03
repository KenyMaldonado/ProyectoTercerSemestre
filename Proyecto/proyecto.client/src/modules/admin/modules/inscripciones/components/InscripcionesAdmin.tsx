import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegIdCard } from 'react-icons/fa';
import { obtenerInscripciones, Inscripcion } from '../../../services/api';

const nombresEstados: Record<string, string> = {
  EnRevision: 'En Revisión',
  EnCorreccion: 'En Corrección',
  Aprobada: 'Aprobadas',
  Rechazada: 'Rechazadas',
  Cancelada: 'Canceladas',
};

const colores: Record<string, string> = {
  EnRevision: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  EnCorreccion: 'bg-orange-100 border-orange-400 text-orange-800',
  Aprobada: 'bg-green-100 border-green-400 text-green-800',
  Rechazada: 'bg-red-100 border-red-400 text-red-800',
  Cancelada: 'bg-gray-100 border-gray-400 text-gray-800',
};

const coloresBg: Record<string, string> = {
  EnRevision: 'bg-yellow-100',
  EnCorreccion: 'bg-orange-100',
  Aprobada: 'bg-green-100',
  Rechazada: 'bg-red-100',
  Cancelada: 'bg-gray-100',
};

const InscripcionesAdmin: React.FC = () => {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const datos = await obtenerInscripciones();
      setInscripciones(datos);
      setCargando(false);
    };
    fetchData();
  }, []);

  const inscripcionesFiltradas = filtro
    ? inscripciones.filter((i) => i.estado === filtro)
    : inscripciones;

  const inscripcionesPorEstado = inscripcionesFiltradas.reduce<Record<string, Inscripcion[]>>(
    (acc, ins) => {
      if (!acc[ins.estado]) acc[ins.estado] = [];
      acc[ins.estado].push(ins);
      return acc;
    },
    {}
  );

  const estadosConOrden = ['EnRevision', 'EnCorreccion', 'Aprobada', 'Rechazada', 'Cancelada'];

  const formatearFecha = (fechaISO: string): string => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES'); // dd/mm/yyyy
  };

  const formatearHora = (fechaISO: string): string => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  if (cargando) {
    return <p className="text-center mt-10">Cargando inscripciones...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaRegIdCard className="text-blue-500" /> Inscripciones de Equipos
      </h1>

      <div className="mb-6">
        <label htmlFor="filtro" className="block mb-2 font-medium text-gray-700">
          Filtrar por estado:
        </label>
        <select
          id="filtro"
          className="border rounded p-2 w-full md:w-64 shadow-sm"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="">Todos</option>
          {estadosConOrden.map((estado) => (
            <option key={estado} value={estado}>
              {nombresEstados[estado]}
            </option>
          ))}
        </select>
      </div>

      {estadosConOrden.map((estado) => {
        const lista = inscripcionesPorEstado[estado] || [];
        if (lista.length === 0) return null;

        return (
          <section key={estado} className="mb-10">
            <h2 className={`text-xl font-semibold mb-4 px-3 py-2 inline-block rounded ${colores[estado]}`}>
              {nombresEstados[estado]}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm bg-white border rounded-md">
                <thead className={`${coloresBg[estado]} text-gray-800`}>
                  <tr>
                    <th className="p-2 text-left">Código</th>
                    <th className="p-2 text-left">Equipo</th>
                    <th className="p-2 text-left">Capitán</th>
                    <th className="p-2 text-left">Correo</th>
                    <th className="p-2 text-left">Fecha</th>
                    <th className="p-2 text-left">Hora</th>
                    <th className="p-2 text-left">Descripción</th>
                    <th className="p-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((ins) => (
                    <tr key={ins.inscripcionId} className="border-t hover:bg-gray-50">
                      <td className="p-2 font-semibold whitespace-nowrap">{ins.codigo}</td>
                      <td className="p-2 whitespace-nowrap">{ins.nombreEquipo}</td>
                      <td className="p-2 whitespace-nowrap">{ins.nombreCapitan}</td>
                      <td className="p-2 whitespace-nowrap">{ins.correoCapitan}</td>
                      <td className="p-2 whitespace-nowrap">{formatearFecha(ins.fechaInscripcion)}</td>
                      <td className="p-2 whitespace-nowrap">{formatearHora(ins.fechaInscripcion)}</td>
                      <td className="p-2 whitespace-nowrap">{ins.descripcion}</td>
                      <td className="p-2 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/inscripciones/${ins.inscripcionId}`, {
                            state: { ...ins }
                          })}
                          className="text-blue-600 hover:underline"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {Object.keys(inscripcionesPorEstado).length === 0 && (
        <p className="text-center mt-10 text-gray-600">
          No hay inscripciones para el filtro seleccionado.
        </p>
      )}
    </div>
  );
};

export default InscripcionesAdmin;
