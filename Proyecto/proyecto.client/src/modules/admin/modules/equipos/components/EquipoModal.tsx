import React, { useEffect, useState } from 'react';
import { Modal, Button, Row, Col, Image, Spinner, Card, Table } from 'react-bootstrap';
import { getJugadoresPorEquipo } from '../Services/api';

interface Asignacion {
    posicionId: number;
    posicionName: string;
    dorsal: number;
    equipoId: number;
    jugadorId: number;
    estado: boolean;
}

interface Jugador {
    nombre: string;
    apellido: string;
    jugadorId: number;
    carne: number;
    fotografia: string | null;
    municipioName: string;
    departamentoName: string;
    carreraName: string;
    semestre: number;
    seccion: string;
    codigoCarrera: string;
    edad: number;
    telefono: string;
    estadoTexto: string | null;
    asignacion: Asignacion;
}

interface Equipo {
    equipoId: number;
    nombre: string;
    colorUniforme: string | null;
    colorUniformeSecundario: string | null;
    nameFacultad: string | null;
    imagenEquipo: string | null;
    torneo: string;
    subtorneo: string;
}

interface Props {
    show: boolean;
    onHide: () => void;
    equipo: Equipo | null;
}

const posicionCoordenadas = {
    GK: { top: '50%', left: '9%' },
    DCD: { top: '62%', left: '30%' },
    RB: { top: '83%', left: '35%' },
    LB: { top: '18%', left: '35%' },
    RM: { top: '75%', left: '60%' },
    LM: { top: '25%', left: '60%' },
    RW: { top: '80%', left: '75%' },
    LW: { top: '20%', left: '75%' },
    ST: { top: '50%', left: '80%' },
    DCI: { top: '38%', left: '30%' },
    MC: { top: '50%', left: '50%' }
};

const posicionMap = [
    'GK', 'DCD', 'RB', 'LB', 'RM', 'LM', 'RW', 'LW', 'ST', 'DCI', 'MC'
];

const EquipoModal: React.FC<Props> = ({ show, onHide, equipo }) => {
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [loadingJugadores, setLoadingJugadores] = useState(false);

    useEffect(() => {
        if (equipo && show) {
            setLoadingJugadores(true);
            getJugadoresPorEquipo(equipo.equipoId)
                .then(res => {
                    if (res.success && res.data) {
                        setJugadores(res.data);
                    } else {
                        setJugadores([]);
                    }
                    setLoadingJugadores(false);
                })
                .catch(() => setLoadingJugadores(false));
        }
    }, [equipo, show]);

    return (
        <Modal show={show} onHide={onHide} size="xl" centered animation>
            <Modal.Header closeButton>
                <Modal.Title>{equipo?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={4} className="text-center">
                        <Image src={equipo?.imagenEquipo || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenEquipoNull.png'} fluid rounded className="mb-3" />
                    </Col>
                    <Col md={8}>
                        <h5>Información del Equipo</h5>
                        <p><strong>Color Primario:</strong> {equipo?.colorUniforme || 'N/A'}</p>
                        <p><strong>Color Secundario:</strong> {equipo?.colorUniformeSecundario || 'N/A'}</p>
                        <p><strong>Facultad:</strong> {equipo?.nameFacultad || 'N/A'}</p>
                        <p><strong>Torneo:</strong> {equipo?.torneo || 'N/A'}</p>
                        <p><strong>Subtorneo:</strong> {equipo?.subtorneo || 'N/A'}</p>
                    </Col>
                </Row>

                <h5 className="mt-4">Jugadores</h5>
                {loadingJugadores ? (
                    <Spinner animation="border" />
                ) : (
                    <Table striped bordered hover responsive className="text-center" style={{ backgroundColor: '#f0f0f0', color: '#333' }} >
                        <thead>
                            <tr>
                                <th>Foto</th>
                                <th>Carne</th>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Dorsal</th>
                                <th>Posición</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jugadores.map(j => (
                                <tr key={j.jugadorId}>
                                    <td><Image src={j.fotografia || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png'} roundedCircle width={50} height={50} /></td>
                                    <td>{j.carne}</td>
                                    <td>{j.nombre}</td>
                                    <td>{j.apellido}</td>
                                    <td>{j.asignacion.dorsal}</td>
                                    <td>{j.asignacion.posicionName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}

                <h5 className="mt-4">Mapa del Equipo</h5>
                <div style={{ position: 'relative', width: '100%', height: '715px', backgroundImage: 'url("https://documentstorneoumes.blob.core.windows.net/asset/cancha.jpg")', backgroundSize: 'cover' }}>
                    {jugadores.map(j => (
                        <Card key={j.jugadorId} bg="light" text="dark" style={{ position: 'absolute', ...posicionCoordenadas[posicionMap[j.asignacion.posicionId - 1]], transform: 'translate(-50%, -50%)', width: '80px', height: 'auto', textAlign: 'center', transition: 'all 0.5s ease', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)' }}>
                            <Card.Img variant="top" src={j.fotografia || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png'} style={{ height: '60px', width: '100%', objectFit: 'cover' }} />
                            <Card.Body className="p-1">
                                <Card.Title className="fs-6 mb-0">{j.nombre} {j.apellido}</Card.Title>
                                <Card.Text style={{ fontSize: '10px' }}>{posicionMap[j.asignacion.posicionId - 1]}</Card.Text>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EquipoModal;
