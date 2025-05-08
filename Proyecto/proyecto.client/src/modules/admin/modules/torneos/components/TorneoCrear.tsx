import React, { useState } from "react";
import { toast } from "react-toastify";

const TorneoCrear = () => {
  const [form, setForm] = useState({
    nombre: "",
    fechaInicio: "",
    fechaFin: "",
    descripcion: "",
    basesTorneo: "",
    fechaInicioInscripcion: "",
    fechaFinInscripcion: "",
    cantidadParticipantes: 0,
    tipoTorneoID: 0,
    ramas: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5291/api/TournamentControllers/CreateNewTournament", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}` // si usas autenticación
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        toast.success("✅ Torneo creado correctamente");
        setForm({
          nombre: "",
          fechaInicio: "",
          fechaFin: "",
          descripcion: "",
          basesTorneo: "",
          fechaInicioInscripcion: "",
          fechaFinInscripcion: "",
          cantidadParticipantes: 0,
          tipoTorneoID: 0,
          ramas: ""
        });
      } else {
        toast.error("❌ Hubo un error al crear el torneo");
      }
    } catch (error) {
      toast.error("❌ Error al conectar con el servidor");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre" placeholder="Nombre del torneo" value={form.nombre} onChange={handleChange} required />
      <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} required />
      <input type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} required />
      <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
      <textarea name="basesTorneo" placeholder="Bases del torneo" value={form.basesTorneo} onChange={handleChange} />
      <input type="date" name="fechaInicioInscripcion" value={form.fechaInicioInscripcion} onChange={handleChange} required />
      <input type="date" name="fechaFinInscripcion" value={form.fechaFinInscripcion} onChange={handleChange} required />
      <input type="number" name="cantidadParticipantes" value={form.cantidadParticipantes} onChange={handleChange} min="1" />
      <input type="number" name="tipoTorneoID" value={form.tipoTorneoID} onChange={handleChange} />
      <input name="ramas" placeholder="Ramas (separadas por coma, por ejemplo: masculina,femenina)" value={form.ramas} onChange={handleChange} />
      <button type="submit">Crear Torneo</button>
    </form>
  );
};

export default TorneoCrear;
