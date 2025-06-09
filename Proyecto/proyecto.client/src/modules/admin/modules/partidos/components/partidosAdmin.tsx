import { useState, useEffect } from 'react';
import { getTorneos, getSubtorneos } from '../../../services/api';
import { Form, Container, Row, Col, Spinner, Card, Modal, Button } from 'react-bootstrap';
import { getJugadoresPorEquipo } from '../../../services/api';

const PartidosAdmin = () => {
  const [torneos, setTorneos] = useState<any[]>([]);
  const [subtorneos, setSubtorneos] = useState<any[]>([]);
  const [partidosPorJornada, setPartidosPorJornada] = useState<any[]>([]);
  const [selectedTorneo, setSelectedTorneo] = useState<number | null>(null);
  const [selectedSubtorneo, setSelectedSubtorneo] = useState<number | null>(null);
  const [loadingSubtorneos, setLoadingSubtorneos] = useState(false);
  const [loadingPartidos, setLoadingPartidos] = useState(false);
  const [filtroEquipo, setFiltroEquipo] = useState('');
  const [filtroJornada, setFiltroJornada] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<any | null>(null);
const [jugadoresEquipo1, setJugadoresEquipo1] = useState<any[]>([]);
const [jugadoresEquipo2, setJugadoresEquipo2] = useState<any[]>([]);
const [golesEquipo1, setGolesEquipo1] = useState<{ jugadorId: number | null; minuto: string }[]>([]);
const [golesEquipo2, setGolesEquipo2] = useState<{ jugadorId: number | null; minuto: string }[]>([]);


  useEffect(() => {
    const fetchTorneos = async () => {
      const data = await getTorneos();
      setTorneos(data);
    };
    fetchTorneos();
  }, []);

  useEffect(() => {
  if (partidoSeleccionado) {
    getJugadoresPorEquipo(partidoSeleccionado.equipo1.equipoId).then(data => {
      const jugadores = Array.isArray(data) ? data : data?.data ?? [];
      setJugadoresEquipo1(jugadores);
    });

    getJugadoresPorEquipo(partidoSeleccionado.equipo2.equipoId).then(data => {
      const jugadores = Array.isArray(data) ? data : data?.data ?? [];
      setJugadoresEquipo2(jugadores);
    });
  }
}, [partidoSeleccionado]);



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
          const response = await fetch(`https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/MatchesControllers/subtorneo/${selectedSubtorneo}/partidosPorJornada`);
          const data = await response.json();
          setPartidosPorJornada(data);
        } catch (error) {
          console.error('❌ Error al obtener los partidos por jornada:', error);
          setPartidosPorJornada([]);
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
      <h2 className="mb-3">Gestión de Partidos (Admin)</h2>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Label>Torneo</Form.Label>
          <Form.Select
            value={selectedTorneo ?? ''}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value)) {
                setSelectedTorneo(value);
                setSelectedSubtorneo(null);
                setPartidosPorJornada([]);
              }
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
              if (!isNaN(value)) {
                setSelectedSubtorneo(value);
              }
            }}
            disabled={!selectedTorneo || loadingSubtorneos}
          >
            <option value="">Selecciona un Subtorneo</option>
            {Array.isArray(subtorneos) &&
  subtorneos.map((subtorneo) => (
    <option key={subtorneo.subTorneoId} value={subtorneo.subTorneoId}>
      {subtorneo.categoria}
    </option>
))}

          </Form.Select>
        </Col>
      </Row>

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

      {loadingPartidos && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {!loadingPartidos && partidosPorJornada.length > 0 && (
        <>
          <h4 className="mt-4">📅 Partidos por Jornada</h4>
          {partidosPorJornada
            .filter((jornada: any) => filtroJornada === null || jornada.numeroJornada === filtroJornada)
            .map((jornada, index) => {
              const partidosFiltrados = filtrarPartidos(jornada.partidos);
              if (partidosFiltrados.length === 0) return null;

              return (
                <div key={index} className="mb-4">
                  <h5>🗓 Jornada {jornada.numeroJornada}</h5>
                  <Row className="g-3">
                    {partidosFiltrados.map((partido: any, idx: number) => {
                      const fechaStr = partido.fechaPartido?.split('T')[0];
                      const fechaHora = new Date(`${fechaStr}T${partido.horaPartido}`);

                      return (
                        <Col key={idx} md={6}>
                          <Card>
                            <Card.Body>
                              <Card.Title>
                                <img
                                  src={partido.equipo1.imagenEquipo || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenEquipoNull.png'}
                                  alt={partido.equipo1.nombre}
                                  style={{ width: '32px', height: '32px', objectFit: 'cover', marginRight: '8px', borderRadius: '50%' }}
                                />
                                {partido.equipo1.nombre} 🆚 {partido.equipo2.nombre}
                                <img
                                  src={partido.equipo2.imagenEquipo || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenEquipoNull.png'}
                                  alt={partido.equipo2.nombre}
                                  style={{ width: '32px', height: '32px', objectFit: 'cover', marginLeft: '8px', borderRadius: '50%' }}
                                />
                              </Card.Title>
                              <Card.Text>
                                <strong>Fecha:</strong>{' '}
                                {fechaHora.toLocaleString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                                <br />
                                <strong>Cancha:</strong> {partido.nombreCancha} <br />
                                <strong>Estado:</strong> {partido.estado}
                              </Card.Text>
                              <div className="d-flex justify-content-end">
                                <Button
                                  variant="primary"
                                  onClick={() => {
                                    setPartidoSeleccionado(partido);
                                    setShowModal(true);
                                  }}
                                >
                                  Ingresar Resultado
                                </Button>
                              </div>
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

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ingresar Resultado</Modal.Title>
        </Modal.Header>
        ...
<Modal.Body>
  {partidoSeleccionado && (
    <>
      {console.log("🧪 golesEquipo1:", golesEquipo1)}
      {console.log("🧪 golesEquipo2:", golesEquipo2)}
      <p><strong>{partidoSeleccionado.equipo1.nombre}</strong> 🆚 <strong>{partidoSeleccionado.equipo2.nombre}</strong></p>
      <Form>
        <h5>⚽ Goles {partidoSeleccionado.equipo1.nombre}</h5>
        {(Array.isArray(golesEquipo1) ? golesEquipo1 : []).map((gol: { jugadorId: number | null; minuto: string }, index: number) => (
          <Row key={index} className="mb-2">
            <Col>
              <Form.Select
                value={gol.jugadorId ?? ''}
                onChange={(e) => {
                  const updated = [...golesEquipo1];
                  updated[index].jugadorId = parseInt(e.target.value);
                  setGolesEquipo1(updated);
                }}
              >
                <option value="">Selecciona jugador</option>
                {(jugadoresEquipo1 || []).map((jug: any) => (
                  <option key={jug.jugadorId} value={jug.jugadorId}>
                    {jug.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Control
                type="number"
                placeholder="Minuto"
                min={0}
                max={120}
                value={gol.minuto}
                onChange={(e) => {
                  const updated = [...golesEquipo1];
                  updated[index].minuto = e.target.value;
                  setGolesEquipo1(updated);
                }}
              />
            </Col>
            <Col xs="auto">
              <Button variant="danger" onClick={() => {
                const updated = golesEquipo1.filter((_, i) => i !== index);
                setGolesEquipo1(updated);
              }}>
                ❌
              </Button>
            </Col>
          </Row>
        ))}
        <Button variant="outline-primary" onClick={() => {
          setGolesEquipo1([...(Array.isArray(golesEquipo1) ? golesEquipo1 : []), { jugadorId: null, minuto: '' }]);
        }}>
          ➕ Agregar Gol
        </Button>

        <hr />

        <h5>⚽ Goles {partidoSeleccionado.equipo2.nombre}</h5>
        {(Array.isArray(golesEquipo2) ? golesEquipo2 : []).map((gol: { jugadorId: number | null; minuto: string }, index: number) => (
          <Row key={index} className="mb-2">
            <Col>
              <Form.Select
                value={gol.jugadorId ?? ''}
                onChange={(e) => {
                  const updated = [...golesEquipo2];
                  updated[index].jugadorId = parseInt(e.target.value);
                  setGolesEquipo2(updated);
                }}
              >
                <option value="">Selecciona jugador</option>
                {(jugadoresEquipo2 || []).map((jug: any) => (
                  <option key={jug.jugadorId} value={jug.jugadorId}>
                    {jug.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Control
                type="number"
                placeholder="Minuto"
                min={0}
                max={120}
                value={gol.minuto}
                onChange={(e) => {
                  const updated = [...golesEquipo2];
                  updated[index].minuto = e.target.value;
                  setGolesEquipo2(updated);
                }}
              />
            </Col>
            <Col xs="auto">
              <Button variant="danger" onClick={() => {
                const updated = golesEquipo2.filter((_, i) => i !== index);
                setGolesEquipo2(updated);
              }}>
                ❌
              </Button>
            </Col>
          </Row>
        ))}
        <Button variant="outline-primary" onClick={() => {
          setGolesEquipo2([...(Array.isArray(golesEquipo2) ? golesEquipo2 : []), { jugadorId: null, minuto: '' }]);
        }}>
          ➕ Agregar Gol
        </Button>
      </Form>
    </>
  )}
</Modal.Body>
...

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success">
            Guardar Resultado
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PartidosAdmin;