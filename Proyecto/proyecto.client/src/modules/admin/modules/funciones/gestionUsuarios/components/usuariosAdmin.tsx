import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './usuariosAdmin.modules.css';

const UsuariosAdmin: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim() || !correo.trim()) {
      Swal.fire('❗ Campos requeridos', 'Por favor, completa todos los campos.', 'warning');
      return;
    }

    const nuevoUsuario = {
  nombre: nombre.trim(),
  apellido: apellido.trim(),
  rolId: 1,
  correoElectronico: correo.trim(),
  contrasenia: '', // campo obligatorio aunque sea backend el que asigne real
  tokenActivacion: '' // lo mismo aquí
};


    console.log("➡️ Enviando usuario:", nuevoUsuario);

    try {
      const res = await fetch('http://localhost:5291/api/AuthControllers/CreateNewUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(nuevoUsuario)
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire('✅ Usuario creado', 'El usuario ha sido registrado correctamente.', 'success');
        setNombre('');
        setApellido('');
        setCorreo('');
      } else {
        Swal.fire('❌ Error', data.message || 'No se pudo registrar el usuario.', 'error');
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      Swal.fire('❌ Error de red', 'No se pudo conectar al servidor.', 'error');
    }
  };

  return (
    <div className="formulario-admin">
      <h2>Crear nuevo usuario Admin</h2>
      <form onSubmit={handleSubmit}>
        <div className="campo">
          <label>Nombre:</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>

        <div className="campo">
          <label>Apellido:</label>
          <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
        </div>

        <div className="campo">
          <label>Correo Electrónico:</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        </div>

        <button type="submit" className="btn btn-success">Crear Usuario</button>
      </form>
    </div>
  );
};

export default UsuariosAdmin;

