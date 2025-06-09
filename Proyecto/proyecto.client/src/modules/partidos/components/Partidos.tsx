import { useState, useEffect } from 'react';
import { getTorneos, getSubtorneos } from '../../admin/services/api';
import { Container, Row, Col, Form, Spinner, Card } from 'react-bootstrap';

const Partidos = () => {
  const [torneos, setTorneos] = useState<any[]>([]);
  const [subtorneos, setSubtorneos] = useState<any[]>([]);
  const [partidosPorJornada, setPartidosPorJornada] = useState<any[]>([]);
  const [selectedTorneo, setSelectedTorneo] = useState<number | null>(null);
  const [selectedSubtorneo, setSelectedSubtorneo] = useState<number | null>(null);
  const [loadingSubtorneos, setLoadingSubtorneos] = useState(false);
  const [loadingPartidos, setLoadingPartidos] = useState(false);
  const [filtroEquipo, setFiltroEquipo] = useState('');
  const [filtroJornada, setFiltroJornada] = useState<number | null>(null);

  useEffect(() => {
    const fetchTorneos = async () => {
      const data = await getTorneos();
      setTorneos(data);
    };
    fetchTorneos();
  }, []);

  useEffect(() => {
    if (selectedTorneo !== null) {
      const fetchSubtorneos = async () => {
        setLoadingSubtorneos(true);
        const data = await getSubtorneos(selectedTorneo);
        setSubtorneos(data);
        setLoadingSubtorneos(false);
      };
      fetchSubtorneos();
    } else {
      setSubtorneos([]);
    }
  }, [selectedTorneo]);

  useEffect(() => {
    if (selectedSubtorneo !== null) {
      const fetchPartidos = async () => {
        setLoadingPartidos(true);
        try {
          const response = await fetch(
            `https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/MatchesControllers/subtorneo/${selectedSubtorneo}/partidosPorJornada`
          );
          const data = await response.json();
          setPartidosPorJornada(data);
        } catch (error) {
          console.error('❌ Error al obtener partidos:', error);
        }
        setLoadingPartidos(false);
      };
      fetchPartidos();
    } else {
      setPartidosPorJornada([]);
    }
  }, [selectedSubtorneo]);

  const filtrarPartidos = (partidos: any[]) => {
    return partidos.filter((p) => {
      const equipo1 = p.equipo1?.nombre?.toLowerCase() || '';
      const equipo2 = p.equipo2?.nombre?.toLowerCase() || '';
      return (
        !filtroEquipo ||
        equipo1.includes(filtroEquipo.toLowerCase()) ||
        equipo2.includes(filtroEquipo.toLowerCase())
      );
    });
  };

  const jornadasDisponibles = Array.from(
    new Set(partidosPorJornada.map((j: any) => j.numeroJornada))
  ).sort((a, b) => a - b);

  return (
    <Container className="mt-4">
      <h1>Partidos</h1>
      <p>Listado y gestión de partidos.</p>

      {/* Torneo y Subtorneo */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Label>Torneo</Form.Label>
          <Form.Select
            value={selectedTorneo ?? ''}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setSelectedTorneo(!isNaN(value) ? value : null);
              setSelectedSubtorneo(null);
              setPartidosPorJornada([]);
            }}
          >
            <option value="">Selecciona un Torneo</option>
            {torneos.map((torneo) => (
              <option key={torneo.torneoId} value={torneo.torneoId}>
                {torneo.nombre}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={6}>
          <Form.Label>Subtorneo</Form.Label>
          <Form.Select
            value={selectedSubtorneo ?? ''}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setSelectedSubtorneo(!isNaN(value) ? value : null);
            }}
            disabled={!selectedTorneo || loadingSubtorneos}
          >
            <option value="">Selecciona un Subtorneo</option>
            {subtorneos.map((subtorneo) => (
              <option key={subtorneo.subTorneoId} value={subtorneo.subTorneoId}>
                {subtorneo.categoria}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Filtros */}
      {partidosPorJornada.length > 0 && (
        <Row className="mb-4">
          <Col md={6}>
            <Form.Label>Buscar por nombre de equipo</Form.Label>
            <Form.Control
              type="text"
              value={filtroEquipo}
              onChange={(e) => setFiltroEquipo(e.target.value)}
              placeholder="Ej: Tigres, Dragones..."
            />
          </Col>
          <Col md={6}>
            <Form.Label>Filtrar por jornada</Form.Label>
            <Form.Select
              value={filtroJornada ?? ''}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setFiltroJornada(isNaN(value) ? null : value);
              }}
            >
              <option value="">Todas las jornadas</option>
              {jornadasDisponibles.map((jornada) => (
                <option key={jornada} value={jornada}>
                  Jornada {jornada}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      )}

      {/* Spinner */}
      {loadingPartidos && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* Partidos por jornada */}
      {!loadingPartidos && partidosPorJornada.length > 0 && (
        <>
          <h4 className="mt-4">📅 Partidos por Jornada</h4>
          {partidosPorJornada
            .filter((j: any) => filtroJornada === null || j.numeroJornada === filtroJornada)
            .map((jornada, index) => {
              const partidosFiltrados = filtrarPartidos(jornada.partidos);
              if (partidosFiltrados.length === 0) return null;

              return (
                <div key={index} className="mb-4">
                  <h5>🗓 Jornada {jornada.numeroJornada}</h5>
                  <Row className="g-3">
                    {partidosFiltrados.map((partido: any, idx: number) => {
                      const fecha = partido.fechaPartido?.split('T')[0];
                      const fechaHora = new Date(`${fecha}T${partido.horaPartido}`);
                      return (
                        <Col key={idx} md={6}>
                          <Card>
                            <Card.Body>
                              <Card.Title>
                                {partido.equipo1.nombre} 🆚 {partido.equipo2.nombre}
                              </Card.Title>
                              <Card.Text>
                                <strong>Fecha:</strong>{' '}
                                {fechaHora.toLocaleString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                <br />
                                <strong>Cancha:</strong> {partido.nombreCancha} <br />
                                <strong>Estado:</strong> {partido.estado}
                              </Card.Text>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              );
            })}
        </>
      )}
    </Container>
  );
};

export default Partidos;
