import axios from 'axios';

// Configuración de axios
const api = axios.create({
  baseURL: 'https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

const baseURL = 'https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/TeamManagementControllers';

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

// ✅ Corregido con tipos genéricos para evitar errores TS18046
export const getDepartamentos = async (): Promise<Departamento[]> => {
  const res = await api.get<{ data: Departamento[] }>(`${baseURL}/GetDepartamentos`);
  return res.data.data;
};

export const getMunicipiosByDepartamento = async (
  departamentoId: number
): Promise<Municipio[]> => {
  const res = await api.get<{ data: Municipio[] }>(`${baseURL}/GetMunicipiosByDepartamento`, {
    params: { DepartamentoID: departamentoId },
  });
  return res.data.data;
};

export const getCarrerasByFacultad = async (
  facultadId: number
): Promise<Carrera[]> => {
  const res = await api.get<{ data: Carrera[] }>(`${baseURL}/GetCarrerasByFacultad`, {
    params: { FacultadId: facultadId },
  });
  return res.data.data;
};

export const getSemestreByCarrera = async (
  carreraId: number
): Promise<Semestre[]> => {
  const res = await api.get<{ data: Semestre[] }>(`${baseURL}/GetSemestreByCarrera`, {
    params: { CarreraId: carreraId },
  });
  return res.data.data;
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
    const response = await fetch(`https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/Players/UpdatePlayer/${id}`, {
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

// ✅ Corregido con tipo genérico boolean
export const verifyCarne = async (carne: string, jugadorID: number): Promise<boolean> => {
  try {
    const carneInt = parseInt(carne, 10);

    const res = await api.post<{ data: boolean }>(`/Players/VerifyCarne`, {
      Carne: carneInt,
      JugadorID: jugadorID
    });

    if (typeof res.data.data === 'boolean') {
      return res.data.data;
    } else {
      throw new Error("Formato de respuesta inesperado.");
    }
  } catch (error: any) {
    console.error("Error al verificar el carne:", error.message);
    throw new Error("No se pudo verificar el carne.");
  }
};
