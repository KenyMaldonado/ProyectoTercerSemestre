// src/components/TorneoList.jsx
import React, { useState, useEffect } from 'react';
import { getTorneos } from '../../../services/api';
import { ListGroup } from 'react-bootstrap';

const TorneoList = ({ onSelect }) => {
    const [torneos, setTorneos] = useState([]);

    useEffect(() => {
        const fetchTorneos = async () => {
            const data = await getTorneos();
            setTorneos(data);
        };
        fetchTorneos();
    }, []);

    return (
        <ListGroup>
            {torneos.map((torneo) => (
                <ListGroup.Item
                    action
                    key={torneo.torneoId}
                    onClick={() => onSelect(torneo.torneoId)}
                >
                    {torneo.nombre} - {torneo.nameTipoJuego}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default TorneoList;
