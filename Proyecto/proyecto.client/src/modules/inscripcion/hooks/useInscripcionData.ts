import { SetStateAction, useEffect } from "react";
import { Carrera, Departamento, Facultad, Municipio, Posicion } from "../components/types";
import api from "../../../services/api";
import { useInitialData } from "./useInscripcionData";

export function useInitialData(
  setDepartamentos,
  setFacultades,
  setMunicipios,
  setCarreras,
  setPosiciones
) {
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [depRes, facRes, munRes, carRes, posRes] = await Promise.all([
          api.get<{ data: Departamento[] }>("/TeamManagementControllers/GetDepartamentos"),
          api.get<{ data: Facultad[] }>("/TeamManagementControllers/GetFacultades"),
          api.get<{ data: Municipio[] }>("/TeamManagementControllers/GetMunicipiosByDepartamento", {
            params: { departamentoId: 0 },
          }),
          api.get<{ data: Carrera[] }>("/TeamManagementControllers/GetCarrerasByFacultad", {
            params: { facultadId: 0 },
          }),
          api.get<{ data: Posicion[] }>("/Players/GetPosicionesJugadores"),
        ]);

        setDepartamentos(depRes.data.data || []);
        setFacultades(facRes.data.data || []);
        setMunicipios(munRes.data.data || []);
        setCarreras(carRes.data.data || []);
        setPosiciones(posRes.data.data || []);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };

    fetchInitialData();
  }, []);
}

export function useCarrerasByFacultad(selectedFacultadId, setCarreras) {
  useEffect(() => {
    const fetchCarreras = async () => {
      if (!selectedFacultadId) return;
      try {
        const res = await api.get(
          "/TeamManagementControllers/GetCarrerasByFacultad",
          {
            params: { facultadId: selectedFacultadId },
          }
        );
        setCarreras(res.data.data);
      } catch (error) {
        console.error("Error al cargar carreras", error);
      }
    };
    fetchCarreras();
  }, [selectedFacultadId]);
}

export function useSemestresByCarrera(
  selectedCarreraId,
  setSemestresFiltrados
) {
  useEffect(() => {
    const fetchSemestres = async () => {
      if (!selectedCarreraId) return;
      try {
        const res = await api.get(
          "/TeamManagementControllers/GetSemestreByCarrera",
          {
            params: { carreraId: selectedCarreraId },
          }
        );
        setSemestresFiltrados(res.data.data);
      } catch (error) {
        console.error("Error al cargar semestres", error);
      }
    };
    fetchSemestres();
  }, [selectedCarreraId]);
}

export function useMunicipiosByDepartamento(
  selectedDepartamentoId,
  setMunicipios
) {
  useEffect(() => {
    const fetchMunicipios = async () => {
      if (!selectedDepartamentoId) return;
      try {
        const res = await api.get(
          "/TeamManagementControllers/GetMunicipiosByDepartamento",
          {
            params: { departamentoId: selectedDepartamentoId },
          }
        );
        setMunicipios(res.data.data);
      } catch (error) {
        console.error("Error al cargar municipios", error);
      }
    };
    fetchMunicipios();
  }, [selectedDepartamentoId]);
}

export function usePosiciones(setPosiciones) {
  useEffect(() => {
    const fetchPosiciones = async () => {
      try {
        const response = await api.get("/Players/GetPosicionesJugadores");
        setPosiciones(response.data.data || []);
      } catch (error) {
        console.error("Error al cargar posiciones:", error);
        setPosiciones([]);
      }
    };
    fetchPosiciones();
  }, []);
}
