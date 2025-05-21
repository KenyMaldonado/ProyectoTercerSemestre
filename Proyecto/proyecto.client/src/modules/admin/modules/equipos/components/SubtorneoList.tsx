// src/components/SubtorneoList.jsx
import React, { useState, useEffect } from 'react';
import { getSubtorneos } from '../../../services/api';
import { ListGroup } from 'react-bootstrap';

const SubtorneoList = ({ torneoId, onSelect }) => {
    const [subtorneos, setSubtorneos] = useState([]);

    useEffect(() => {
        const fetchSubtorneos = async () => {
            if (torneoId) {
                const data = await getSubtorneos(torneoId);
                setSubtorneos(data);
            }
        };
        fetchSubtorneos();
    }, [torneoId]);

    return (
        <ListGroup>
            {subtorneos.map((sub) => (
                <ListGroup.Item
                    action
                    key={sub.subTorneoId}
                    onClick={() => onSelect(sub.subTorneoId)}
                >
                    {sub.categoria} - {sub.estado}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default SubtorneoList;
