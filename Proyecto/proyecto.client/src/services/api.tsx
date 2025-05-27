import axios from 'axios';

// Configuración de axios
const api = axios.create({
  baseURL: 'http://localhost:5291/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
export default api;

const baseURL = 'http://localhost:5291/api/TeamManagementControllers';

// Tipos TypeScript
export type Departamento = {
  departamentoId: number;
  nombre: string;
};

export type Municipio = {
  municipioId: number;
  nombre: string;
};

export type Carrera = {
  carreraId: number;
  nombre: string;
};

export type Semestre = {
  carreraSemestreId: number;
  codigoCarrera: string;
  carreraId: number;
  semestre: number;
  seccion: string;

};

export const getDepartamentos = async (): Promise<Departamento[]> => {
  const res = await api.get(`${baseURL}/GetDepartamentos`);
  return res.data.data as Departamento[]; // ✅ Aquí haces cast explícito
};

export const getMunicipiosByDepartamento = async (
  departamentoId: number
): Promise<Municipio[]> => {
  const res = await api.get(`${baseURL}/GetMunicipiosByDepartamento`, {
    params: { DepartamentoID: departamentoId },
  });
  return res.data.data as Municipio[];
};

export const getCarrerasByFacultad = async (
  facultadId: number
): Promise<Carrera[]> => {
  const res = await api.get(`${baseURL}/GetCarrerasByFacultad`, {
    params: { FacultadId: facultadId },
  });
  return res.data.data as Carrera[];
};

export const getSemestreByCarrera = async (
  carreraId: number
): Promise<Semestre[]> => {
  const res = await api.get(`${baseURL}/GetSemestreByCarrera`, {
    params: { CarreraId: carreraId },
  });
  return res.data.data as Semestre[];
};


export const updateJugador = async (id: number, datos: any, file?: File | null): Promise<void> => {
  const formData = new FormData();

  formData.append("Nombre", datos.nombre);
  formData.append("Apellido", datos.apellido);
  formData.append("Carne", datos.carne.toString());
  formData.append("MunicipioId", datos.municipioId.toString());
  formData.append("CarreraSemestreId", datos.carreraSemestreId.toString());
  formData.append("FechaNacimiento", datos.fechaNacimiento);
  formData.append("Edad", datos.edad.toString());

  if (datos.telefono) formData.append("Telefono", datos.telefono);

  if (datos.borrarFoto === true) {
    const borrarBlob = new Blob(["borrar"], { type: "text/plain" });
    formData.append("file", borrarBlob, "borrar.txt");
  } else if (file) {
    formData.append("file", file);
  }

  try {
    const response = await fetch(`http://localhost:5291/api/Players/UpdatePlayer/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        // ❌ NO agregar Content-Type cuando se usa FormData
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "Error al actualizar el jugador.";
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        // No se pudo leer JSON del error
      }
      throw new Error(errorMessage);
    }
  } catch (err: any) {
    throw new Error(err.message || "Error de red al actualizar el jugador.");
  }
};
