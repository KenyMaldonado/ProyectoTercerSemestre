import React, { useState, useEffect } from 'react';
import { getTorneos, getSubtorneos, getEquipos } from '../../../services/api';
import { Spinner, Button, Card, Form, Col, Row, Container } from 'react-bootstrap';
import EquipoModal from '../components/EquipoModal';
import './StyleSheet.css';

const EquipoList = () => {
    const [torneos, setTorneos] = useState<any[]>([]);
    const [subtorneos, setSubtorneos] = useState<any[]>([]);
    const [equipos, setEquipos] = useState<any[]>([]);
    const [selectedTorneo, setSelectedTorneo] = useState<number | null>(null);
    const [selectedSubtorneo, setSelectedSubtorneo] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedEquipo, setSelectedEquipo] = useState<any>(null);

    useEffect(() => {
        const fetchTorneos = async () => {
            const data = await getTorneos();
            setTorneos(data);
        };
        fetchTorneos();
    }, []);

    // Cargar subtorneos cuando cambie el torneo seleccionado
    useEffect(() => {
        if (selectedTorneo !== null) {
            const fetchSubtorneos = async () => {
                const data = await getSubtorneos(selectedTorneo);
                setSubtorneos(data);
            };
            fetchSubtorneos();
        }
    }, [selectedTorneo]);

    // Cargar equipos cuando cambie el subtorneo seleccionado o la p�gina
    useEffect(() => {
        if (selectedSubtorneo !== null) {
            const fetchEquipos = async () => {
                setLoading(true);
                const { items, totalPages } = await getEquipos(selectedSubtorneo, currentPage, 10);
                setEquipos(items);
                setTotalPages(totalPages);
                setLoading(false);
            };
            fetchEquipos();
        }
    }, [selectedSubtorneo, currentPage]);

    const handleShowModal = (equipo: any) => {
        setSelectedEquipo(equipo);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedEquipo(null);
        setShowModal(false);
    };

    return (
        <Container fluid>
            <h2 className="my-4">Equipos por Torneo y Subtorneo</h2>
            <Row className="mb-3">
                <Col md={4}>
                    <Form.Select onChange={(e) => setSelectedTorneo(parseInt(e.target.value))}>
                        <option>Selecciona un Torneo</option>
                        {torneos.map((torneo) => (
                            <option key={torneo.torneoId} value={torneo.torneoId}>
                                {torneo.nombre}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={4}>
                    <Form.Select
                        onChange={(e) => setSelectedSubtorneo(parseInt(e.target.value))}
                        disabled={!selectedTorneo}
                    >
                        <option>Selecciona un Subtorneo</option>
                        {subtorneos.map((subtorneo) => (
                            <option key={subtorneo.subTorneoId} value={subtorneo.subTorneoId}>
                                {subtorneo.categoria}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {loading ? (
                <Spinner animation="border" variant="primary" />
            ) : (
                <Row xs={1} md={3} lg={4} className="g-4">
                    {equipos.map((equipo) => (
                        <Col key={equipo.equipoId}>
                            <Card className="equipo-card">
                                <Card.Img
                                    variant="top"
                                    src={equipo.imagenEquipo ? equipo.imagenEquipo : 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenEquipoNull.png'}
                                    alt={equipo.nombre}
                                />

                                <Card.Body className="text-center">
                                    <Card.Title>{equipo.nombre}</Card.Title>
                                    <Button
                                        variant="info"
                                        className="btn-info-modal"
                                        onClick={() => handleShowModal(equipo)}
                                    >
                                        Más Información
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Modal de Informaci�n del Equipo */}
            <EquipoModal show={showModal} onHide={handleCloseModal} equipo={selectedEquipo} />

            {/* Paginaci�n */}
            <div className="mt-4 d-flex justify-content-center">
                <Button variant="secondary" onClick={() => setCurrentPage((prev) => prev - 1)} disabled={currentPage === 1}>
                    Anterior
                </Button>
                <span className="mx-2">Página {currentPage} de {totalPages}</span>
                <Button variant="secondary" onClick={() => setCurrentPage((prev) => prev + 1)} disabled={currentPage === totalPages}>
                    Siguiente
                </Button>
            </div>
        </Container>
    );
};

export default EquipoList;
