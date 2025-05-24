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
