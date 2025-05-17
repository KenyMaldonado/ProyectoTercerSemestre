// src/pages/EquiposPage.jsx
import React, { useState } from 'react';
import TorneoList from '../components/TorneoList';
import SubtorneoList from '../components/SubtorneoList';
import EquipoList from '../components/EquipoList';
import { Container, Row, Col } from 'react-bootstrap';

const EquiposPage = () => {
    const [selectedTorneo, setSelectedTorneo] = useState(null);
    const [selectedSubtorneo, setSelectedSubtorneo] = useState(null);

    return (
        <Container>
            <h2>Equipos por Torneo</h2>
             <h4>Equipos</h4>
             <EquipoList subtorneoId={selectedSubtorneo} />

        </Container>
    );
};

export default EquiposPage;
