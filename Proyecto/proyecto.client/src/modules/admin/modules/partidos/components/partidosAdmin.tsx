// Importaciones necesarias
import { useState, useEffect } from 'react';
import { getTorneos, getSubtorneos, getJugadoresPorEquipo, getArbitros } from '../../../services/api';
import { Form, Container, Row, Col, Spinner, Card, Modal, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';

const PartidosAdmin = () => {
  const [torneos, setTorneos] = useState([]);
  const [subtorneos, setSubtorneos] = useState([]);
  const [partidosPorJornada, setPartidosPorJornada] = useState([]);
  const [selectedTorneo, setSelectedTorneo] = useState(null);
  const [selectedSubtorneo, setSelectedSubtorneo] = useState(null);
  const [loadingSubtorneos, setLoadingSubtorneos] = useState(false);
  const [loadingPartidos, setLoadingPartidos] = useState(false);
  const [filtroEquipo, setFiltroEquipo] = useState('');
  const [filtroJornada, setFiltroJornada] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [jugadoresEquipo1, setJugadoresEquipo1] = useState([]);
  const [jugadoresEquipo2, setJugadoresEquipo2] = useState([]);
  const [golesEquipo1, setGolesEquipo1] = useState([]);
  const [golesEquipo2, setGolesEquipo2] = useState([]);

  const [showArbitroModal, setShowArbitroModal] = useState(false);
  const [arbitros, setArbitros] = useState([]);
  const [arbitroSeleccionado, setArbitroSeleccionado] = useState(null);
  const [partidoParaArbitro, setPartidoParaArbitro] = useState(null);

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
          console.error('Error al obtener los partidos por jornada:', error);
          setPartidosPorJornada([]);
        }
        setLoadingPartidos(false);
      };
      fetchPartidos();
    } else {
      setPartidosPorJornada([]);
    }
  }, [selectedSubtorneo]);

  const abrirModalArbitro = async (partido) => {
    try {
      const data = await getArbitros();
      setArbitros(Array.isArray(data) ? data : data.data || []);
      setPartidoParaArbitro(partido);
      setArbitroSeleccionado(null);
      setShowArbitroModal(true);
    } catch (error) {
      console.error("Error al obtener árbitros:", error);
      Swal.fire("Error", "No se pudieron obtener los árbitros", "error");
    }
  };

  const jornadasDisponibles = Array.from(
    new Set(partidosPorJornada.map((j) => j.numeroJornada))
  ).sort((a, b) => a - b);

  const filtrarPartidos = (partidos) => partidos.filter((p) => {
    const equipo1 = p.equipo1?.nombre?.toLowerCase() || '';
    const equipo2 = p.equipo2?.nombre?.toLowerCase() || '';
    return (
      !filtroEquipo ||
      equipo1.includes(filtroEquipo.toLowerCase()) ||
      equipo2.includes(filtroEquipo.toLowerCase())
    );
  });

  return (
    <Container className="mt-4">
      {/* ... selector de torneo y subtorneo ... */}

      {/* ... filtros por nombre y jornada ... */}

      {!loadingPartidos && partidosPorJornada.length > 0 && (
        partidosPorJornada
          .filter(j => filtroJornada === null || j.numeroJornada === filtroJornada)
          .map((jornada, index) => (
            <div key={index}>
              <h5>Jornada {jornada.numeroJornada}</h5>
              <Row>
                {filtrarPartidos(jornada.partidos).map((partido, idx) => (
                  <Col key={idx} md={6}>
                    <Card>
                      <Card.Body>
                        <Card.Title>{partido.equipo1.nombre} vs {partido.equipo2.nombre}</Card.Title>
                        <Card.Text>
                          Fecha: {new Date(partido.fechaPartido + 'T' + partido.horaPartido).toLocaleString()}
                        </Card.Text>
                        <Button variant="primary" onClick={() => { setPartidoSeleccionado(partido); setShowModal(true); }}>Ingresar Resultado</Button>
                        <Button variant="secondary" className="ms-2" onClick={() => abrirModalArbitro(partido)}>Agregar Árbitro</Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))
      )}

      {/* Modal de árbitro */}
      <Modal show={showArbitroModal} onHide={() => setShowArbitroModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Asignar Árbitro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {partidoParaArbitro && (
            <>
              <p><strong>{partidoParaArbitro.equipo1.nombre}</strong> 🆚 <strong>{partidoParaArbitro.equipo2.nombre}</strong></p>
              <Form.Select value={arbitroSeleccionado ?? ''} onChange={(e) => setArbitroSeleccionado(parseInt(e.target.value))}>
                <option value="">Selecciona un árbitro</option>
                {arbitros.map((a) => (
                  <option key={a.arbitroId} value={a.arbitroId}>{a.nombre}</option>
                ))}
              </Form.Select>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowArbitroModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={() => { console.log('Árbitro asignado:', arbitroSeleccionado); setShowArbitroModal(false); }}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de resultados (aquí solo mostramos una parte) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ingresar Resultado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {golesEquipo1.map((gol, index) => (
            <Row key={index}>
              <Col>
                <Form.Select value={gol.jugadorId ?? ''} onChange={(e) => {
                  const updated = [...golesEquipo1];
                  updated[index].jugadorId = parseInt(e.target.value);
                  setGolesEquipo1(updated);
                }}>
                  <option value="">Selecciona jugador</option>
                  {jugadoresEquipo1.map(j => <option key={j.jugadorId} value={j.jugadorId}>{j.nombre}</option>)}
                </Form.Select>
              </Col>
              <Col>
                <Form.Control type="number" value={gol.minuto} onChange={(e) => {
                  const updated = [...golesEquipo1];
                  updated[index].minuto = e.target.value;
                  setGolesEquipo1(updated);
                }} />
              </Col>
              <Col>
                <Form.Check type="checkbox" label="Penal" checked={gol.esPenal || false} onChange={(e) => {
                  const updated = [...golesEquipo1];
                  updated[index].esPenal = e.target.checked;
                  setGolesEquipo1(updated);
                }} />
              </Col>
            </Row>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="success">Guardar Resultado</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PartidosAdmin;

