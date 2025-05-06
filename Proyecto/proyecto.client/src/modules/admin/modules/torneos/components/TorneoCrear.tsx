import { useState } from "react";

const CrearTorneo = () => {
  const [formulario, setFormulario] = useState({
    Nombre: "",
    Fecha_Inicio: "",
    Fecha_Fin: "",
    Descripcion: "",
    Bases_Torneo: "",
    Fecha_Inicio_Inscripcion: "",
    Fecha_Fin_Inscripcion: "",
    Cantidad_Participantes: 0,
    Tipo_Torneo_ID: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: name === "Cantidad_Participantes" || name === "Tipo_Torneo_ID"
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("https://tu-api.com/api/torneo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });

      if (res.ok) {
        alert("✅ Torneo creado exitosamente");
        setFormulario({
          Nombre: "",
          Fecha_Inicio: "",
          Fecha_Fin: "",
          Descripcion: "",
          Bases_Torneo: "",
          Fecha_Inicio_Inscripcion: "",
          Fecha_Fin_Inscripcion: "",
          Cantidad_Participantes: 0,
          Tipo_Torneo_ID: 0,
        });
      } else {
        alert("❌ Error al crear el torneo");
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>📋 Crear nuevo torneo</h2>

      <input
        type="text"
        name="Nombre"
        placeholder="Nombre del torneo"
        value={formulario.Nombre}
        onChange={handleChange}
        required
      />

      <input
        type="date"
        name="Fecha_Inicio"
        value={formulario.Fecha_Inicio}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="Fecha_Fin"
        value={formulario.Fecha_Fin}
        onChange={handleChange}
        required
      />

      <input
        type="date"
        name="Fecha_Inicio_Inscripcion"
        value={formulario.Fecha_Inicio_Inscripcion}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="Fecha_Fin_Inscripcion"
        value={formulario.Fecha_Fin_Inscripcion}
        onChange={handleChange}
        required
      />

      <textarea
        name="Descripcion"
        placeholder="Descripción del torneo"
        value={formulario.Descripcion}
        onChange={handleChange}
        required
      />

      <textarea
        name="Bases_Torneo"
        placeholder="Bases del torneo"
        value={formulario.Bases_Torneo}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="Cantidad_Participantes"
        placeholder="Cantidad de participantes"
        value={formulario.Cantidad_Participantes}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="Tipo_Torneo_ID"
        placeholder="ID del tipo de torneo"
        value={formulario.Tipo_Torneo_ID}
        onChange={handleChange}
        required
      />

      <button type="submit" style={{ marginTop: "10px" }}>
        Crear Torneo
      </button>
    </form>
  );
};

export default CrearTorneo;
