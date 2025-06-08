import React, { useEffect, useState } from 'react';
import { Modal, Button, Row, Col, Image, Spinner, Card, Table } from 'react-bootstrap';
import { getJugadoresPorEquipo } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

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
    nameSubTournament: string;
    nameTournament: string;
    estado: string;
}

interface Props {
    show: boolean;
    onHide: () => void;
    equipo: Equipo | null;
}

// Define explícitamente las posiciones posibles
type PosicionKey = 'GK' | 'DCD' | 'RB' | 'LB' | 'RM' | 'LM' | 'RW' | 'LW' | 'ST' | 'DCI' | 'MC';

const posicionCoordenadas: Record<PosicionKey, { top: string; left: string }> = {
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

const colorMap: { [key: string]: string } = {
    rojo: 'red',
    azul: 'blue',
    verde: 'green',
    amarillo: 'yellow',
    negro: 'black',
    blanco: 'white',
    morado: 'purple',
    rosa: 'pink',
    naranja: 'orange',
    gris: 'gray',
    marrón: 'brown',
    celeste: 'skyblue',
    violeta: 'violet',
    dorado: 'gold',
    plateado: 'silver',
};

const getColor = (color: string): string => {
    return colorMap[color.toLowerCase()] || color;
};

// Aquí mantenemos el arreglo de posiciones en el mismo orden que posicionCoordenadas keys
const posicionMap: PosicionKey[] = [
    'GK', 'DCD', 'RB', 'LB', 'RM', 'LM', 'RW', 'LW', 'ST', 'DCI', 'MC'
];

const EquipoModal: React.FC<Props> = ({ show, onHide, equipo }) => {
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [loadingJugadores, setLoadingJugadores] = useState(false);
    const navigate = useNavigate();

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
                    {/* Logo del equipo */}
                    <Col md={4} className="text-center">
                        <Image
                            src={equipo?.imagenEquipo || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenEquipoNull.png'}
                            fluid
                            rounded
                            className="mb-3"
                            style={{ maxHeight: '200px', objectFit: 'contain' }}
                        />
                    </Col>

                    {/* Información del equipo + botón */}
                    <Col md={8}>
                        <div style={{
                            borderRadius: '12px',
                            backgroundColor: '#f9f9f9',
                            padding: '20px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <h4 style={{ color: '#1e3a8a', marginBottom: '15px', fontWeight: '700' }}>Detalles del Equipo</h4>
                                <Row>
                                    <Col xs={6}>
                                        <p><strong>Color Primario:</strong> <span style={{ color: getColor(equipo?.colorUniforme || '#555') }}>{equipo?.colorUniforme || 'N/A'}</span></p>
                                        <p><strong>Color Secundario:</strong> <span style={{ color: getColor(equipo?.colorUniformeSecundario || '#555') }}>{equipo?.colorUniformeSecundario || 'N/A'}</span></p>
                                        <p><strong>Facultad:</strong> {equipo?.nameFacultad || 'N/A'}</p>
                                    </Col>
                                    <Col xs={6}>
                                        <p><strong>Torneo:</strong> {equipo?.nameTournament || 'N/A'}</p>
                                        <p><strong>Subtorneo:</strong> {equipo?.nameSubTournament || 'N/A'}</p>
                                        <p><strong>Estado:</strong> <span style={{ color: equipo?.estado === 'Activo' ? '#059669' : '#dc2626' }}>{equipo?.estado || 'N/A'}</span></p>
                                    </Col>
                                </Row>
                            </div>

                            <div className="mt-3" style={{ textAlign: 'right' }}>
                                <Button
                                    variant="primary"
                                    style={{
                                        borderRadius: '25px',
                                        padding: '10px 25px',
                                        fontWeight: '600',
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                                        transition: 'background-color 0.3s ease'
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#3b82f6')}
                                    onClick={() => navigate(`/admin/equipos/editar-equipo/${equipo?.equipoId}`, { state: { equipo } })}
                                >
                                    Modificar Información
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                <h5 className="mt-4">Jugadores</h5>
                {loadingJugadores ? (
                    <Spinner animation="border" />
                ) : (
                    <Table striped bordered hover responsive className="text-center" style={{ backgroundColor: '#f0f0f0', color: '#333' }}>
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
                    {jugadores.map(j => {
                        // Obtenemos la clave de posición segura para el objeto posicionCoordenadas
                        const posicionKey = posicionMap[j.asignacion.posicionId - 1];
                        // Evitar renderizar si la posición no está definida
                        if (!posicionKey || !(posicionKey in posicionCoordenadas)) return null;
                        return (
                            <Card
                                key={j.jugadorId}
                                bg="light"
                                text="dark"
                                style={{
                                    position: 'absolute',
                                    top: posicionCoordenadas[posicionKey].top,
                                    left: posicionCoordenadas[posicionKey].left,
                                    transform: 'translate(-50%, -50%)',
                                    width: '80px',
                                    height: 'auto',
                                    textAlign: 'center',
                                    transition: 'all 0.5s ease',
                                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)'
                                }}
                            >
                                <Card.Img
                                    variant="top"
                                    src={j.fotografia || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png'}
                                    style={{ height: '60px', width: '100%', objectFit: 'cover' }}
                                />
                                <Card.Body className="p-1">
                                    <Card.Title className="fs-6 mb-0">{j.nombre} {j.apellido}</Card.Title>
                                    <Card.Text style={{ fontSize: '10px' }}>
                                        {posicionKey}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </div>v
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EquipoModal;
