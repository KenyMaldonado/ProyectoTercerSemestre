export function useCapitanVerification({ setIsCarneValido, setShowCapitanForm, setJugadorVerificado, setCaptain }) {
    const verificarJugador = async (carne) => {
      try {
        const response = await api.post("/Players/VerifyPlayers", [parseInt(carne)]);
        const result = response.data;
  
        if (result.success && result.data && result.data.length > 0) {
          const jugador = result.data[0];
          const estado = jugador.aprobado;
  
          if (!estado) {
            setIsCarneValido(false);
            setShowCapitanForm(false);
            setJugadorVerificado(false);
            return { status: "restringido" };
          }
  
          if (estado && jugador.datosJugador?.nombre == null) {
            setIsCarneValido(true);
            setShowCapitanForm(true);
            setJugadorVerificado(false);
            setCaptain((prev) => ({
              ...prev,
              nombre: "",
              apellido: "",
              telefono: "",
              fechaNacimiento: "",
              edad: 0,
              facultadId: 0,
              municipioId: 0,
              departamentoId: 0,
              carreraSemestreId: 0,
              posicionId: 0,
              dorsal: 0,
            }));
            return { status: "nuevo" };
          }
  
          if (estado && jugador.datosJugador?.nombre != null) {
            setIsCarneValido(true);
            setShowCapitanForm(true);
            setJugadorVerificado(true);
            const datos = jugador.datosJugador;
            setCaptain((prev) => ({
              ...prev,
              nombre: datos.nombre,
              apellido: datos.apellido,
              telefono: datos.telefono,
              fechaNacimiento: datos.fechaNacimiento.split("T")[0],
              edad: datos.edad,
              municipioId: datos.municipioId,
              departamentoId: datos.departamentoId,
              carreraSemestreId: datos.carreraSemestreId,
              facultadId: datos.facultadId || 0,
              posicionId: datos.asignacion?.posicionId || 0,
              dorsal: datos.asignacion?.dorsal || 0,
            }));
            return { status: "existente" };
          }
        } else {
          setIsCarneValido(false);
          setShowCapitanForm(true);
          setJugadorVerificado(false);
          setCaptain((prev) => ({
            ...prev,
            nombre: "",
            apellido: "",
            telefono: "",
            fechaNacimiento: "",
            edad: 0,
            facultadId: 0,
            municipioId: 0,
            departamentoId: 0,
            carreraSemestreId: 0,
            posicionId: 0,
            dorsal: 0,
          }));
          return { status: "no_encontrado" };
        }
      } catch (error) {
        console.error("Error al verificar el jugador", error);
        setIsCarneValido(false);
        setShowCapitanForm(false);
        setJugadorVerificado(false);
        return { status: "error" };
      }
    };
  
    return verificarJugador;
  }