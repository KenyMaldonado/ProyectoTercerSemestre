import { useEffect } from "react";
import api from "../../../services/api";

export function useInitialData(setDepartamentos, setFacultades) {
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [depRes, facRes] = await Promise.all([
          api.get("/TeamManagementControllers/GetDepartamentos"),
          api.get("/TeamManagementControllers/GetFacultades"),
        ]);
        setDepartamentos(depRes.data.data);
        setFacultades(facRes.data.data);
      } catch (error) {
        console.error("Error al cargar datos generales", error);
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
        const res = await api.get("/TeamManagementControllers/GetCarrerasByFacultad", {
          params: { facultadId: selectedFacultadId },
        });
        setCarreras(res.data.data);
      } catch (error) {
        console.error("Error al cargar carreras", error);
      }
    };
    fetchCarreras();
  }, [selectedFacultadId]);
}

export function useSemestresByCarrera(selectedCarreraId, setSemestresFiltrados) {
  useEffect(() => {
    const fetchSemestres = async () => {
      if (!selectedCarreraId) return;
      try {
        const res = await api.get("/TeamManagementControllers/GetSemestreByCarrera", {
          params: { carreraId: selectedCarreraId },
        });
        setSemestresFiltrados(res.data.data);
      } catch (error) {
        console.error("Error al cargar semestres", error);
      }
    };
    fetchSemestres();
  }, [selectedCarreraId]);
}

export function useMunicipiosByDepartamento(selectedDepartamentoId, setMunicipios) {
  useEffect(() => {
    const fetchMunicipios = async () => {
      if (!selectedDepartamentoId) return;
      try {
        const res = await api.get("/TeamManagementControllers/GetMunicipiosByDepartamento", {
          params: { departamentoId: selectedDepartamentoId },
        });
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
