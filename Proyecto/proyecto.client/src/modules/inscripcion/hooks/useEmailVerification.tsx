import { useState } from "react";
import api from "../../../services/api";

export const useEmailVerification = () => {
  const [preInscripcionId, setPreInscripcionId] = useState<number | null>(null);

  const verificarCorreo = async (correo: string) => {
    try {
      const response = await api.post(
        "/TeamManagementControllers/RegistrationStart",
        null,
        { params: { correo } }
      );

      if (response.data.success) {
        setPreInscripcionId(response.data.data.preInscripcionId);
        return {
          codigo: response.data.data.codigo,
          isNew: response.data.data.isNew,
        };
      }
    } catch (error) {
      console.error("Error verificando correo:", error);
    }

    return null;
  };

  return { verificarCorreo, preInscripcionId };
};
