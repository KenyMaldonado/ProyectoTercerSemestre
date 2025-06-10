import { useState } from "react";
import api from "../../../services/api";

export const usePreloadedFormData = () => {
  const [formData, setFormData] = useState<unknown>(null);
  const [preInscripcionId, setPreInscripcionId] = useState<number | null>(null);
  const [datosRecuperados, setDatosRecuperados] = useState(false);

  const verificarCodigo = async (codigo: string) => {
    try {
      const response = await api.get(
        "/TeamManagementControllers/GetInscripciones"
      );
      const resultado = response.data.data.find(
        (item) => item.codigo.toLowerCase() === codigo.toLowerCase()
      );

      if (!resultado) return false;

      setFormData({
        nombreEquipo: resultado.nombreEquipo,
        subTorneoId: resultado.subTorneoId,
        nombreCapitan: resultado.nombreCapitan,
        apellidoCapitan: resultado.apellidoCapitan,
        correoCapitan: resultado.correoCapitan,
      });

      setPreInscripcionId(resultado.preInscripcionId);
      setDatosRecuperados(true);
      return true;
    } catch (error) {
      console.error("Error al verificar código:", error);
      return false;
    }
  };

  return {
    formData,
    preInscripcionId,
    datosRecuperados,
    verificarCodigo,
  };
};

export default usePreloadedFormData;
