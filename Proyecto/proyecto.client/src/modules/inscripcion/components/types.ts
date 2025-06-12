import { ReactNode } from "react";

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface JugadorResponse {
    datosJugador: null;
    aprobado: unknown;
    success: boolean;
    data: Jugador[];
}

export interface Jugador {
    aprobado: boolean;
    datosJugador: DatosJugador | null;
}

export interface DatosJugador {
    nombre: string | null;
    apellido: string | null;
    carne: string;
    telefono: string;
    fechaNacimiento: string;
    edad: number;
    departamentoId: number;
    municipioId: number;
    facultadId: number;
}

export interface Carrera {
    carreraId: number;
    nombre: string;
    facultadId: number;
}

export interface Facultad {
    facultadId: number;
    nombre: string;
}

export interface Municipio {
    municipioId: number;
    nombre: string;
    departamentoId: number;
}

export interface Departamento {
    departamentoId: number;
    nombre: string;
}

export interface Posicion {
    abreviatura: ReactNode;
    posicionId: number;
    nombrePosicion: string;
}

export interface Semestre {
    carreraSemestreId: number;
    codigoCarrera: string;
    semestre: number;
    seccion: string;
}

export interface Torneo {
    torneoId: number;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    descripcion: string;
    basesTorneo: string;
    fechaInicioInscripcion: string;
    fechaFinInscripcion: string;
    usuarioId: number;
    nameUsuario: string;
    tipoTorneoId: number;
    nameTipoTorneo: string;
    estado: string;
    tipoJuegoId: number;
    nameTipoJuego: string;
    nameUserModify: string;
    userModifyId: number;
    fechaModificacion: string;
}

export interface TorneoResponse {
    success: boolean;
    message: string;
    data: Torneo[];
}

export interface SubTorneo {
    subTorneoId: number;
    categoria: string;
    torneoId: number;
    estado: string;
    cantidadEquipos: number;
}

export interface SubTorneoResponse {
    success: boolean;
    message: string;
    data: SubTorneo[];
}

export interface StepContentProps {
    formData: unknown;
    preInscripcionId: number | null;
    datosRecuperados: boolean;
    fase: "inicio" | "cargando" | "formulario";
    setFase: React.Dispatch<
        React.SetStateAction<"inicio" | "cargando" | "formulario">
    >;
    email: string; // Nueva prop para el correo electrónico
}

export interface JugadorRegistro {
    nombre: string;
    apellido: string;
    jugadorId: number;
    carne: number;
    fotografia: string;
    municipioId: number;
    municipioName: string;
    departamentoId: number;
    departamentoName: string;
    carreraId: number;
    carreraName: string;
    carreraSemestreId: number;
    semestre: number;
    seccion: string;
    codigoCarrera: string;
    fechaNacimiento: string;
    edad: number;
    telefono: string;
    estado: number;
    estadoTexto: string;
    asignacion: {
        posicionId: number;
        posicionName: string;
        dorsal: number;
        equipoId: number;
        jugadorId: number;
        estado: boolean;
        facultadID: number;
    };
}

export interface EquipoRegistro {
    equipoId: number;
    nombre: string;
    colorUniforme: string;
    colorUniformeSecundario: string;
    subTorneoId: number;
    grupoId: number;
    facultadId: number;
    nameFacultad: string;
    imagenEquipo: string;
    nameSubTournament: string;
    nameTournament: string;
    estado: number;
}

export interface RegistroPayload {
    idSubtorneo: number;
    preInscripcionId: number;
    capitan: {
        jugadorCapitan: JugadorRegistro;
        correoElectronico: string;
        jugadorId: number;
    };
    newTeam: EquipoRegistro;
    listaJugadores: JugadorRegistro[];
}

export interface FormDataInscripcion {
    apellidoCapitan: string;
    nombreCapitan: string;
    nombreEquipo: string;
    torneoId: number;
    subTorneoId: number;
}