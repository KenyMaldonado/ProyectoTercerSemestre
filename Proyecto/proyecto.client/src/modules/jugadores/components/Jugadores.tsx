import { useEffect, useState } from 'react';
import { getTorneos, getSubtorneos, getTablaPosiciones } from '../../admin/services/api';

interface EquipoTabla {
  equipoId: number;
  nombreEquipo: string;
  puntos: number;
  partidosJugados: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  golesAFavor: number;
  golesEnContra: number;
  diferenciaGoles: number;
  urlImagenEquipo?: string; // Opcional: puedes añadir esto en tu backend si tienes logos
}

function TablaPosiciones() {
  const [torneos, setTorneos] = useState<any[]>([]);
  const [subTorneos, setSubTorneos] = useState<any[]>([]);
  const [selectedTorneoId, setSelectedTorneoId] = useState<number | null>(null);
  const [selectedSubTorneoId, setSelectedSubTorneoId] = useState<number | null>(null);
  const [tabla, setTabla] = useState<EquipoTabla[]>([]);

  useEffect(() => {
    getTorneos()
      .then((data) => setTorneos(data))
      .catch(() => setTorneos([]));
  }, []);

  useEffect(() => {
    if (selectedTorneoId !== null) {
      getSubtorneos(selectedTorneoId)
        .then((data) => setSubTorneos(data))
        .catch(() => setSubTorneos([]));
      setSelectedSubTorneoId(null);
      setTabla([]);
    }
  }, [selectedTorneoId]);

  useEffect(() => {
    if (selectedSubTorneoId !== null) {
      getTablaPosiciones(selectedSubTorneoId)
        .then((data) => setTabla(data))
        .catch(() => setTabla([]));
    } else {
      setTabla([]);
    }
  }, [selectedSubTorneoId]);

  const getRowBackground = (index: number) => {
    if (index === 0) return '#ffeaa7'; // Oro
    if (index === 1) return '#dfe6e9'; // Plata
    if (index === 2) return '#fab1a0'; // Bronce
    return index % 2 === 0 ? '#ffffff' : '#f9f9f9';
  };

  const getMedal = (index: number) => {
    return index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
  };

  return (
    <div style={{ maxWidth: 960, margin: '2rem auto', fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ textAlign: 'center', fontWeight: 700, color: '#2c3e50', marginBottom: '1.5rem' }}>
        Tabla de Posiciones
      </h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 250px', minWidth: 250 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2c3e50' }}>
            Selecciona Torneo
          </label>
          <select
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 16,
              color: '#2c3e50',
              cursor: 'pointer',
            }}
            onChange={(e) => setSelectedTorneoId(Number(e.target.value) || null)}
            value={selectedTorneoId ?? ''}
          >
            <option value="">-- Selecciona un torneo --</option>
            {torneos.map((torneo) => (
              <option key={torneo.torneoId} value={torneo.torneoId}>
                {torneo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 250px', minWidth: 250 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2c3e50' }}>
            Selecciona SubTorneo
          </label>
          <select
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 16,
              color: '#2c3e50',
              cursor: selectedTorneoId ? 'pointer' : 'not-allowed',
              backgroundColor: selectedTorneoId ? 'white' : '#f5f5f5',
            }}
            onChange={(e) => setSelectedSubTorneoId(Number(e.target.value) || null)}
            value={selectedSubTorneoId ?? ''}
            disabled={!selectedTorneoId}
          >
            <option value="">-- Selecciona un subtorneo --</option>
            {subTorneos.map((sub) => (
              <option key={sub.subTorneoId} value={sub.subTorneoId}>
                {sub.categoria}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tabla.length > 0 ? (
        <div style={{ overflowX: 'auto', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
            <thead>
              <tr style={{ backgroundColor: '#2c3e50', color: 'white', textTransform: 'uppercase' }}>
                <th style={{ padding: 12 }}>#</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Equipo</th>
                <th style={{ padding: 12 }}>Ptos</th>
                <th style={{ padding: 12 }}>Jug</th>
                <th style={{ padding: 12 }}>G</th>
                <th style={{ padding: 12 }}>E</th>
                <th style={{ padding: 12 }}>P</th>
                <th style={{ padding: 12 }}>GF</th>
                <th style={{ padding: 12 }}>GC</th>
                <th style={{ padding: 12 }}>Dif</th>
              </tr>
            </thead>
            <tbody>
              {tabla
                .sort((a, b) => b.puntos - a.puntos || b.diferenciaGoles - a.diferenciaGoles)
                .map((equipo, index) => (
                  <tr
                    key={equipo.equipoId}
                    style={{
                      backgroundColor: getRowBackground(index),
                      transition: 'background-color 0.3s',
                    }}
                  >
                    <td style={{ padding: 12, textAlign: 'center', fontWeight: 700 }}>
                      {getMedal(index)}
                    </td>
                    <td style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={
                          equipo.urlImagenEquipo ||
                          'https://documentstorneoumes.blob.core.windows.net/asset/ImagenEquipoNull.png'
                        }
                        alt="Logo"
                        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontWeight: 600 }}>{equipo.nombreEquipo}</span>
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.puntos}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.partidosJugados}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.partidosGanados}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.partidosEmpatados}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.partidosPerdidos}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.golesAFavor}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.golesEnContra}</td>
                    <td
                      style={{
                        padding: 12,
                        textAlign: 'center',
                        fontWeight: 700,
                        color:
                          equipo.diferenciaGoles > 0
                            ? '#2ecc71'
                            : equipo.diferenciaGoles < 0
                            ? '#e74c3c'
                            : '#7f8c8d',
                      }}
                    >
                      {equipo.diferenciaGoles}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : selectedSubTorneoId !== null ? (
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#7f8c8d', marginTop: 40 }}>
          No hay datos para este subtorneo.
        </p>
      ) : null}
    </div>
  );
}

export default TablaPosiciones;
