import { useEffect, useState } from 'react';
import { getTorneos, getSubtorneos, getTablaPosiciones, getResultadosPartidos } from '../../admin/services/api';

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
  urlImagenEquipo?: string;
}

interface Gol {
  minutoGol: number;
  esTiempoExtra: boolean;
  ordenPenal: number | null;
  jugadorNombre: string;
  tipoGol: string;
  imagenJugador?: string;
}

interface Tarjeta {
  minutoTarjeta: number;
  tipoTarjeta: string;
  descripcion?: string;
  jugadorNombre: string;
}

interface PartidoResultado {
  partidoId: number;
  fechaPartido: string;
  horaPartido: string;
  estado: string;
  equipo1Nombre: string;
  equipo2Nombre: string;
  golesEquipo1: number;
  golesEquipo2: number;
  goles: Gol[];
  tarjetas: Tarjeta[];
}

function TablaPosiciones() {
  const [torneos, setTorneos] = useState<any[]>([]);
  const [subTorneos, setSubTorneos] = useState<any[]>([]);
  const [selectedTorneoId, setSelectedTorneoId] = useState<number | null>(null);
  const [selectedSubTorneoId, setSelectedSubTorneoId] = useState<number | null>(null);
  const [tabla, setTabla] = useState<EquipoTabla[]>([]);
  const [resultados, setResultados] = useState<PartidoResultado[]>([]);
  const [vista, setVista] = useState<'tabla' | 'resultados' | null>(null);

  useEffect(() => {
    getTorneos().then(setTorneos).catch(() => setTorneos([]));
  }, []);

  useEffect(() => {
    if (selectedTorneoId !== null) {
      getSubtorneos(selectedTorneoId).then(setSubTorneos).catch(() => setSubTorneos([]));
      setSelectedSubTorneoId(null);
      setTabla([]);
      setResultados([]);
      setVista(null);
    }
  }, [selectedTorneoId]);

  const cargarTabla = () => {
    if (selectedSubTorneoId !== null) {
      getTablaPosiciones(selectedSubTorneoId).then(setTabla).catch(() => setTabla([]));
      setVista('tabla');
    }
  };

  const cargarResultados = () => {
    if (selectedSubTorneoId !== null) {
      getResultadosPartidos(selectedSubTorneoId).then(setResultados).catch(() => setResultados([]));
      setVista('resultados');
    }
  };

  const getRowBackground = (index: number) => {
    if (index === 0) return '#ffeaa7';
    if (index === 1) return '#dfe6e9';
    if (index === 2) return '#fab1a0';
    return index % 2 === 0 ? '#ffffff' : '#f9f9f9';
  };

  const getMedal = (index: number) => {
    return index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
  };

  return (
    <div style={{ maxWidth: 960, margin: '2rem auto', fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ textAlign: 'center', fontWeight: 700, color: '#2c3e50', marginBottom: '1.5rem' }}>
        Gestión de Subtorneos
      </h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 250px', minWidth: 250 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2c3e50' }}>
            Selecciona Torneo
          </label>
          <select
            style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
            onChange={(e) => setSelectedTorneoId(Number(e.target.value) || null)}
            value={selectedTorneoId ?? ''}
          >
            <option value="">-- Selecciona un torneo --</option>
            {torneos.map((torneo) => (
              <option key={torneo.torneoId} value={torneo.torneoId}>{torneo.nombre}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 250px', minWidth: 250 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#2c3e50' }}>
            Selecciona SubTorneo
          </label>
          <select
            style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
            onChange={(e) => setSelectedSubTorneoId(Number(e.target.value) || null)}
            value={selectedSubTorneoId ?? ''}
            disabled={!selectedTorneoId}
          >
            <option value="">-- Selecciona un subtorneo --</option>
            {subTorneos.map((sub) => (
              <option key={sub.subTorneoId} value={sub.subTorneoId}>{sub.categoria}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedSubTorneoId && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={cargarTabla} style={{ padding: '10px 16px', borderRadius: 6, background: '#0984e3', color: 'white', border: 'none', cursor: 'pointer' }}>Ver Tabla de Posiciones</button>
          <button onClick={cargarResultados} style={{ padding: '10px 16px', borderRadius: 6, background: '#00b894', color: 'white', border: 'none', cursor: 'pointer' }}>Ver Resultados de Partidos</button>
        </div>
      )}

      {vista === 'tabla' && tabla.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginTop: 20 }}>
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
                  <tr key={equipo.equipoId} style={{ backgroundColor: getRowBackground(index) }}>
                    <td style={{ padding: 12, textAlign: 'center', fontWeight: 700 }}>{getMedal(index)}</td>
                    <td style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={equipo.urlImagenEquipo || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenEquipoNull.png'} alt="Logo" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                      <span style={{ fontWeight: 600 }}>{equipo.nombreEquipo}</span>
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.puntos}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.partidosJugados}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.partidosGanados}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.partidosEmpatados}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.partidosPerdidos}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.golesAFavor}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{equipo.golesEnContra}</td>
                    <td style={{ padding: 12, textAlign: 'center', fontWeight: 700 }}>{equipo.diferenciaGoles}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {vista === 'resultados' && resultados.length > 0 && (
        <div style={{ marginTop: 30 }}>
          {resultados.map((partido) => (
            <div key={partido.partidoId} style={{ background: '#f9f9f9', padding: 16, borderRadius: 10, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontWeight: 600, color: '#2c3e50' }}>
                {new Date(partido.fechaPartido).toLocaleDateString()} - {partido.horaPartido} hrs
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <strong>{partido.equipo1Nombre}</strong>
                <span style={{ fontSize: 18 }}>{partido.golesEquipo1} - {partido.golesEquipo2}</span>
                <strong>{partido.equipo2Nombre}</strong>
              </div>
              {partido.goles.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  <strong>Goles:</strong>
                  <ul style={{ paddingLeft: 16 }}>
                    {partido.goles.map((g, i) => (
                      <li key={i}>{g.jugadorNombre} ({g.minutoGol}') - {g.tipoGol}</li>
                    ))}
                  </ul>
                </div>
              )}
              {partido.tarjetas.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  <strong>Tarjetas:</strong>
                  <ul style={{ paddingLeft: 16 }}>
                    {partido.tarjetas.map((t, i) => (
                      <li key={i}>{t.jugadorNombre} ({t.minutoTarjeta}') - {t.tipoTarjeta}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TablaPosiciones;
