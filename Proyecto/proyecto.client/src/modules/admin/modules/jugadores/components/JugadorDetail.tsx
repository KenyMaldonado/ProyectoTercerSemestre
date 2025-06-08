import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    getDepartamentos,
    getMunicipiosByDepartamento,
    getCarrerasByFacultad,
    getSemestreByCarrera,
    updateJugador,
    verifyCarne
} from '../../../../../services/api'; // Asegúrate de que estas rutas sean correctas
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// --- Interfaces (se mantienen como las tenías, solo añado para claridad) ---
type Departamento = {
    departamentoId: number;
    nombre: string;
};

type Municipio = {
    municipioId: number;
    nombre: string;
};

type Carrera = {
    carreraId: number;
    nombre: string;
};

type Semestre = {
    carreraSemestreId: number;
    codigoCarrera: string;
    carreraId: number;
    semestre: number;
    seccion: string;
};

// Interface para el estado del formulario, alineado con lo que recibe el backend
// y con los tipos de los campos de entrada.
interface JugadorFormData {
    id?: number;
    nombre: string;
    apellido: string;
    carne: number | ''; // Carne es número, pero el input puede devolver ''
    telefono: string; // Se mantiene como string para el formato
    fechaNacimiento: string;
    edad: number;
    carreraId: number | ''; // Combo
    codigoCarrera: string; // Combo
    semestre: number | ''; // Es un número pero puede ser ''
    seccion: string;
    departamentoId: number | ''; // Combo
    municipioId: number | ''; // Combo
    fotografia?: string; // URL de la foto actual
    estadoTexto: string;
    file?: File | null; // Para la nueva foto
    borrarFoto?: boolean; // Para indicar si se borra la foto existente
    jugadorId?: number; // Asegúrate de que el id del jugador esté aquí si lo necesitas en el formData
}

// Interface para los errores de validación
interface FormErrors {
    [key: string]: string; // Permite indexar con cualquier string, el valor es el mensaje de error
}

// --- Funciones de Utilidad ---
const calcularEdad = (fechaNacimiento: string): number => {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
};

// Función para formatear el teléfono a 1234-5678
const formatPhoneNumber = (phoneNumber: string): string => {
    const cleaned = ('' + phoneNumber).replace(/\D/g, ''); // Elimina todo lo que no sea dígito
    const match = cleaned.match(/^(\d{4})(\d{4})$/);
    if (match) {
        return match[1] + '-' + match[2];
    }
    return phoneNumber; // Retorna el original si no coincide con el formato
};

// Función para desformatear el teléfono (quitar el guion)
const unformatPhoneNumber = (formattedNumber: string): string => {
    return ('' + formattedNumber).replace(/-/g, '');
};

const formatearLabel = (key: string) => {
    const map: Record<string, string> = {
        nombre: 'Nombre',
        apellido: 'Apellido',
        carne: 'Carné',
        edad: 'Edad',
        fechaNacimiento: 'Fecha de Nacimiento',
        telefono: 'Teléfono',
        carreraId: 'Carrera',
        codigoCarrera: 'Código de Carrera',
        semestre: 'Semestre',
        seccion: 'Sección',
        departamentoId: 'Departamento',
        municipioId: 'Municipio',
        estadoTexto: 'Estado'
    };
    return map[key] || key;
};

// --- Componente JugadorDetail ---
const JugadorDetail = () => {
    const { jugador } = useLocation().state || {};
    const navigate = useNavigate();

    const [isEditable, setIsEditable] = useState(false);

    // Estados para los combos
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [carreras, setCarreras] = useState<Carrera[]>([]);
    const [semestres, setSemestres] = useState<Semestre[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [borrarFoto, setBorrarFoto] = useState(false);
    const [nombreMunicipioOriginal, setNombreMunicipioOriginal] = useState<string | null>(null);

    // Estado para el carné validado (true por defecto si no hay cambios o es el carné original)
    const [carneValidado, setCarneValidado] = useState(true);

    // Nuevo estado para los errores de validación
    const [errors, setErrors] = useState<FormErrors>({});

    // Ref para dirigir el foco
    const inputRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});

    // Estado para guardar la data original del jugador para comparar cambios
    const [originalFormData, setOriginalFormData] = useState<JugadorFormData | null>(null);

    // Estado editable del jugador
    const [formData, setFormData] = useState<JugadorFormData>({
        nombre: '',
        apellido: '',
        carne: '',
        telefono: '',
        fechaNacimiento: '',
        edad: 0,
        carreraId: '',
        codigoCarrera: '',
        semestre: '',
        seccion: '',
        departamentoId: '',
        municipioId: '',
        estadoTexto: '',
        file: null,
        borrarFoto: false,
        jugadorId: undefined, // Asegúrate de que el id del jugador esté disponible
    });

    useEffect(() => {
        if (!jugador) {
            navigate('/ruta-a-lista-jugadores'); // Redirige si no hay jugador
            return;
        }

        // Formatea el teléfono al cargar si no está ya formateado
        const initialTelefono = jugador.telefono ? formatPhoneNumber(jugador.telefono.toString()) : '';

        const initialFormData = {
            ...jugador,
            carne: Number(jugador.carne), // Asegúrate de que carne sea número
            telefono: initialTelefono,
            semestre: jugador.semestre || '', // Asegura que semestre sea número o ''
            departamentoId: jugador.departamentoId || '',
            municipioId: jugador.municipioId || '',
            carreraId: jugador.carreraId || '',
            file: null,
            borrarFoto: false,
        };

        setFormData(initialFormData);
        setOriginalFormData(initialFormData); // Guarda la data original
        setPreviewImage(jugador.fotografia || null);
        setNombreMunicipioOriginal(jugador.municipioName ?? null);

        getDepartamentos()
            .then(data => {
                if (Array.isArray(data)) {
                    setDepartamentos(data);
                } else {
                    console.error("Respuesta inesperada en getDepartamentos:", data);
                }
            })
            .catch(err => console.error("Error cargando departamentos:", err));

        if (jugador?.asignacion?.facultadID) {
            getCarrerasByFacultad(jugador.asignacion.facultadID).then(setCarreras);
        } else {
            console.warn("facultadID es null o undefined");
        }

        if (jugador.departamentoId) {
            getMunicipiosByDepartamento(jugador.departamentoId).then(setMunicipios);
        }

        if (jugador.carreraId) {
            getSemestreByCarrera(jugador.carreraId).then(setSemestres);
        }
    }, [jugador, navigate]);

    // Sincronizar carreraId si es necesario (lógica existente, mantenida)
    useEffect(() => {
        if (
            jugador &&
            carreras.length > 0 &&
            // Verifica si formData.carreraId no es '' y no se encuentra en carreras
            (formData.carreraId !== '' && !carreras.find(c => c.carreraId === Number(formData.carreraId)))
        ) {
            console.log('Sincronizando carreraId con carreras:', jugador.carreraId);
            setFormData(prev => ({
                ...prev,
                carreraId: jugador.carreraId
            }));
        }
    }, [carreras, jugador, formData.carreraId]);

    // Función de validación mejorada
    const validateForm = (data: JugadorFormData): boolean => {
        const newErrors: FormErrors = {};

        // 1. Mensajes de campos vacíos y combos sin llenar
        if (!data.nombre?.trim()) {
            newErrors.nombre = 'El nombre es requerido.';
        }
        if (!data.apellido?.trim()) {
            newErrors.apellido = 'El apellido es requerido.';
        }

        // Validación de carne: número y 9 dígitos
        if (data.carne === null || data.carne === undefined || data.carne === '') {
            newErrors.carne = 'El carné es requerido.';
        } else {
            const carneStr = String(data.carne);
            if (!/^\d{9}$/.test(carneStr)) {
                newErrors.carne = 'El carné debe ser un número de 9 dígitos.';
            } else if (isNaN(Number(data.carne))) {
                newErrors.carne = 'El carné debe ser un número válido.';
            }
        }

        // 2. Teléfono: solo números y formato 1234-5678
        if (!data.telefono?.trim()) {
            newErrors.telefono = 'El teléfono es requerido.';
        } else {
            const cleanedTelefono = unformatPhoneNumber(data.telefono);
            if (!/^\d{8}$/.test(cleanedTelefono)) { // 8 dígitos para Guatemala
                newErrors.telefono = 'El teléfono debe ser un número de 8 dígitos.';
            }
        }

        if (!data.fechaNacimiento) {
            newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida.';
        }

        // 4. Combos no vacíos
        if (!data.carreraId) {
            newErrors.carreraId = 'La carrera es requerida.';
        }
        if (!data.departamentoId) {
            newErrors.departamentoId = 'El departamento es requerido.';
        }
        if (!data.municipioId) {
            newErrors.municipioId = 'El municipio es requerido.';
        }
        if (!data.codigoCarrera) {
             newErrors.codigoCarrera = 'El código de carrera es requerido.';
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
    };

    // 6. Verificar si hubo cambios
    const seModificoAlgo = (): boolean => {
        if (!originalFormData) return false; // No hay data original para comparar

        // Compara campo por campo
        const hasChanges = Object.keys(formData).some(key => {
            if (['fotografia', 'estadoTexto', 'file', 'borrarFoto'].includes(key)) {
                return false; // Ignorar estos campos para la comparación directa
            }

            const currentVal = formData[key as keyof JugadorFormData];
            const originalVal = originalFormData[key as keyof JugadorFormData];

            // Manejo especial para el teléfono: desformatear para comparar
            if (key === 'telefono') {
                return unformatPhoneNumber(String(currentVal)) !== unformatPhoneNumber(String(originalVal));
            }

            // Comparación de valores simples
            return String(currentVal) !== String(originalVal);
        });

        // También considera cambios de foto
        return hasChanges || borrarFoto || !!formData.file;
    };

    const generarResumenCambios = () => {
        if (!departamentos.length || !municipios.length || !carreras.length || !originalFormData) {
            return '<p>Cargando datos para mostrar cambios...</p>';
        }

        let resumen = '';

        const getNombreDepartamento = (id: number | '') =>
            departamentos.find(d => d.departamentoId === Number(id))?.nombre || `ID ${id}`;

        const getNombreMunicipio = (id: number | '') =>
            id === originalFormData.municipioId
                ? nombreMunicipioOriginal ?? `ID ${id}`
                : municipios.find(m => m.municipioId === Number(id))?.nombre ?? `ID ${id}`;

        const getNombreCarrera = (id: number | '') =>
            carreras.find(c => c.carreraId === Number(id))?.nombre || `ID ${id}`;

        const clavesMostradas = [
            'nombre',
            'apellido',
            'carne',
            'telefono',
            'fechaNacimiento',
            'edad',
            'carreraId',
            'codigoCarrera',
            'semestre',
            'seccion',
            'departamentoId',
            'municipioId'
        ];

        clavesMostradas.forEach((key) => {
            const valorOriginal = originalFormData[key as keyof JugadorFormData];
            const valorNuevo = formData[key as keyof JugadorFormData];

            let mostradoOriginal = valorOriginal;
            let mostradoNuevo = valorNuevo;

            // Formatear valores para la tabla de resumen
            switch (key) {
                case 'carreraId':
                    mostradoOriginal = getNombreCarrera(valorOriginal as number | '');
                    mostradoNuevo = getNombreCarrera(valorNuevo as number | '');
                    break;
                case 'departamentoId':
                    mostradoOriginal = getNombreDepartamento(valorOriginal as number | '');
                    mostradoNuevo = getNombreDepartamento(valorNuevo as number | '');
                    break;
                case 'municipioId':
                    mostradoOriginal = getNombreMunicipio(valorOriginal as number | '');
                    mostradoNuevo = getNombreMunicipio(valorNuevo as number | '');
                    break;
                case 'telefono':
                    // Asegúrate de que siempre se muestra formateado si es un número válido
                    mostradoOriginal = valorOriginal ? formatPhoneNumber(String(valorOriginal)) : '';
                    mostradoNuevo = valorNuevo ? formatPhoneNumber(String(valorNuevo)) : '';
                    break;
                case 'carne':
                    // Carne es número, lo convertimos a string para mostrar
                    mostradoOriginal = valorOriginal ? String(valorOriginal) : '';
                    mostradoNuevo = valorNuevo ? String(valorNuevo) : '';
                    break;
                default:
                    // Convertir a string para la comparación general y mostrar
                    mostradoOriginal = String(valorOriginal ?? '');
                    mostradoNuevo = String(valorNuevo ?? '');
                    break;
            }

            // Comparación de valores "limpios" para determinar si realmente hay un cambio
            // Para teléfono, desformateamos para comparar
            const originalClean = key === 'telefono' ? unformatPhoneNumber(String(valorOriginal ?? '')) : String(valorOriginal ?? '');
            const newClean = key === 'telefono' ? unformatPhoneNumber(String(valorNuevo ?? '')) : String(valorNuevo ?? '');

            if (originalClean !== newClean) {
                resumen += `
                <tr>
                    <td><strong>${formatearLabel(key)}</strong></td>
                    <td>${mostradoOriginal || 'Vacío'}</td>
                    <td>→</td>
                    <td>${mostradoNuevo || 'Vacío'}</td>
                </tr>`;
            }
        });

        if (formData.file) {
            resumen += `
            <tr>
                <td><strong>Foto</strong></td>
                <td></td>
                <td>→</td>
                <td>Nueva imagen seleccionada</td>
            </tr>`;
        } else if (borrarFoto && originalFormData?.fotografia) {
            resumen += `
            <tr>
                <td><strong>Foto</strong></td>
                <td>${originalFormData.fotografia ? 'Imagen actual' : 'Sin imagen'}</td>
                <td>→</td>
                <td>Se eliminará la imagen</td>
            </tr>`;
        }


        return resumen
            ? `<table class="table table-sm table-bordered"><thead><tr><th>Campo</th><th>Original</th><th></th><th>Nuevo</th></tr></thead><tbody>${resumen}</tbody></table>`
            : '<p>No hay cambios para guardar.</p>';
    };

    const handleActualizar = async () => {
        // Validar todos los campos antes de cualquier otra cosa
        const isValid = validateForm(formData);
        if (!isValid) {
            // 3. Dirigir el cursor al primer error
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField && inputRefs.current[firstErrorField]) {
                inputRefs.current[firstErrorField]?.focus();
            }
            await MySwal.fire({
                icon: 'error',
                title: 'Error de Validación',
                text: 'Por favor, corrige los errores en el formulario.',
            });
            return;
        }

        // 6. y 8. Verificar si hubo cambios
        if (!seModificoAlgo()) {
            await MySwal.fire({
                icon: 'info',
                title: 'Sin cambios',
                text: 'No has realizado ningún cambio para actualizar.',
            });
            return;
        }

        // Validación del carné solo si cambió y está en modo edición
        if (isEditable && String(formData.carne) !== String(originalFormData?.carne)) {
             // Validar longitud del carné antes de la API (punto 5)
             const carneStr = String(formData.carne);
             if (carneStr.length !== 9) {
                await MySwal.fire({
                    icon: 'error',
                    title: 'Carné Inválido',
                    text: 'El carné debe tener exactamente 9 dígitos.',
                });
                if (inputRefs.current['carne']) {
                    inputRefs.current['carne'].focus();
                }
                return;
            }

            MySwal.fire({
            title: 'Validando carné...',
            allowOutsideClick: false,
            didOpen: () => {
                const btn = MySwal.getConfirmButton();
                if (btn) {
                MySwal.showLoading(btn);
                }
            }
            });
            try {
            const carne = String(formData.carne);
            const carneExiste = await verifyCarne(carne, jugador.jugadorId);
            MySwal.close();
            if (carneExiste) {
                await MySwal.fire({
                    icon: 'error',
                    title: 'Carné existente',
                    text: 'El carné que intentas usar ya existe para otro jugador. Por favor, elige uno diferente.',
                });
                setCarneValidado(false);
                if (inputRefs.current['carne']) {
                    inputRefs.current['carne'].focus();
                }
                return;
            } else {
                setCarneValidado(true);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                MySwal.close();
                await MySwal.fire({
                    icon: 'error',
                    title: 'Error de validación',
                    text: error.message || 'Error al verificar el carné.',
                });
                return;
            }
        }

        // Si el carné no se modificó o la validación previa fue exitosa
        if (!carneValidado) {
            await MySwal.fire({
                icon: 'warning',
                title: 'Carné inválido',
                text: 'Por favor, corrige el carné antes de guardar.',
            });
            if (inputRefs.current['carne']) {
                inputRefs.current['carne'].focus();
            }
            return;
        }

        const confirm = await MySwal.fire({
            title: '¿Guardar cambios?',
            html: generarResumenCambios(),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirm.isConfirmed) return;

        MySwal.fire({
        title: 'Guardando...',
        allowOutsideClick: false,
        didOpen: () => {
            const btn = MySwal.getConfirmButton();
            if (btn) {
            MySwal.showLoading(btn);
            }
        }
        });

        try {
            // Prepara los datos a enviar
            const dataToUpdate = {
                ...formData,
                telefono: unformatPhoneNumber(formData.telefono), // Envía el teléfono sin formato
                carne: Number(formData.carne), // Asegura que carne se envía como número
                borrarFoto: borrarFoto,
            };

            await updateJugador(jugador.jugadorId, dataToUpdate, formData.file);

            await MySwal.fire({
                title: '¡Guardado!',
                text: 'El jugador ha sido actualizado correctamente.',
                icon: 'success'
            });

            // Actualiza la data original después de un guardado exitoso
            // y resetea el modo de edición
            setIsEditable(false);
            // Esto es crucial para que `seModificoAlgo` funcione correctamente
            // en futuras ediciones y para que la UI se actualice.
            const updatedJugador = {
                ...jugador,
                ...dataToUpdate,
                fotografia: formData.file ? previewImage : (borrarFoto ? 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png' : jugador.fotografia), // Actualiza la foto
            };
            // Vuelve a formatear el teléfono para el estado de visualización
            updatedJugador.telefono = formatPhoneNumber(String(updatedJugador.telefono));
            setOriginalFormData(updatedJugador);
            setFormData(updatedJugador); // Actualiza formData para reflejar los datos guardados
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            await MySwal.fire({
                title: 'Error',
                text: error.message || 'Error desconocido al guardar.',
                icon: 'error'
            });
        } finally {
            MySwal.close();
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newValue: string | number = value;

        // Limpia cualquier error para el campo que se está modificando
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });

        if (name === 'carne') {
            // Solo permite dígitos para el carné y limita a 9
            const cleanedValue = value.replace(/\D/g, '').substring(0, 9);
            newValue = cleanedValue === '' ? '' : Number(cleanedValue);

            // Validar longitud del carné en tiempo real
            if (cleanedValue.length !== 9 && cleanedValue !== '') {
                setErrors(prev => ({ ...prev, carne: 'El carné debe tener 9 dígitos.' }));
            } else if (cleanedValue === '') {
                setErrors(prev => ({ ...prev, carne: 'El carné es requerido.' }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.carne;
                    return newErrors;
                });
            }

            // Comprueba si el carné es diferente al original para la validación API
            if (isEditable && cleanedValue !== String(originalFormData?.carne) && cleanedValue.length === 9) {
                if (isEditable && cleanedValue !== String(originalFormData?.carne) && cleanedValue.length === 9) {
                    try {
                        const carneExiste = await verifyCarne(cleanedValue, jugador.jugadorId);
                        setCarneValidado(!carneExiste);
                        if (carneExiste) {
                            setErrors(prev => ({ ...prev, carne: 'Este carné ya está registrado.' }));
                            MySwal.fire({
                                icon: 'warning',
                                title: 'Carné ya existe',
                                text: 'Este carné ya está registrado para otro jugador.',
                                toast: true,
                                position: 'top-end',
                                showConfirmButton: false,
                                timer: 3000
                            });
                        } else {
                            setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.carne;
                                return newErrors;
                            });
                        }
                    } catch (error) {
                        console.error("Error al verificar carné:", error);
                        setCarneValidado(false);
                        setErrors(prev => ({ ...prev, carne: 'Error al verificar carné.' }));
                    }
                }
            } else {
                // Si el carné no cambia o es vacío, se considera válido para no bloquear la edición
                setCarneValidado(true);
            }
        } else if (name === 'telefono') {
            // Permite solo números para el teléfono y formatea
            const cleaned = value.replace(/\D/g, ''); // Elimina todo lo que no sea dígito
            const truncated = cleaned.substring(0, 8); // Limita a 8 dígitos para Guatemala
            newValue = formatPhoneNumber(truncated);

            if (truncated.length !== 8 && truncated !== '') {
                setErrors(prev => ({ ...prev, telefono: 'El teléfono debe tener 8 dígitos.' }));
            } else if (truncated === '') {
                setErrors(prev => ({ ...prev, telefono: 'El teléfono es requerido.' }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.telefono;
                    return newErrors;
                });
            }
        } else if (name === 'fechaNacimiento') {
            newValue = value;
            const nuevaEdad = calcularEdad(value);
            setFormData(prev => ({
                ...prev,
                fechaNacimiento: newValue as string,
                edad: nuevaEdad
            }));
            // No hacemos el return aquí para que la actualización del estado general se haga al final
        } else if (name === 'departamentoId') {
            newValue = Number(value);
            getMunicipiosByDepartamento(newValue).then(setMunicipios);
            setFormData(prev => ({ ...prev, municipioId: '' }));  // Resetea el municipio al cambiar departamento
        } else if (name === 'carreraId') {
            newValue = Number(value);
            getSemestreByCarrera(Number(value)).then(data => {
                setSemestres(data || []);
                if (data && data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        carreraId: newValue as number,
                        semestre: data[0].semestre,
                        seccion: data[0].seccion,
                        carreraSemestreId: data[0].carreraSemestreId,
                        codigoCarrera: data[0].codigoCarrera
                    }));
                } else {
                     setFormData(prev => ({
                        ...prev,
                        carreraId: newValue as number,
                        semestre: '',
                        seccion: '',
                        carreraSemestreId: undefined,
                        codigoCarrera: ''
                    }));
                }
            });
        } else if (name === 'codigoCarrera') {
            const selectedSemestre = semestres.find(s => s.codigoCarrera === value);
            if (selectedSemestre) {
                setFormData(prev => ({
                    ...prev,
                    codigoCarrera: value,
                    carreraSemestreId: selectedSemestre.carreraSemestreId,
                    semestre: selectedSemestre.semestre,
                    seccion: selectedSemestre.seccion
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    codigoCarrera: value,
                    carreraSemestreId: undefined,
                    semestre: '',
                    seccion: ''
                }));
            }
        } else if (e.target.type === 'file') {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                setFormData(prev => ({ ...prev, file }));
                setBorrarFoto(false);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setFormData(prev => ({ ...prev, file: null }));
                setPreviewImage(jugador.fotografia || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png');
            }
            return; // Evita la actualización genérica
        }


        // Actualiza el estado general
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    // Al salir del modo edición, resetea el formulario a los valores originales si no se guardaron cambios
    const handleCancelEdit = () => {
        setIsEditable(false);
        // Restaura los datos del formulario a los originales y los errores
        if (originalFormData) {
            setFormData(originalFormData);
            setErrors({}); // Limpia los errores
            setPreviewImage(originalFormData.fotografia || null);
            setBorrarFoto(false);
            // Recargar municipios y semestres para asegurar que los combos reflejen los valores originales
            if (originalFormData.departamentoId) {
                getMunicipiosByDepartamento(originalFormData.departamentoId).then(setMunicipios);
            }
            if (originalFormData.carreraId) {
                getSemestreByCarrera(originalFormData.carreraId).then(setSemestres);
            }
        }
    };


    if (!jugador) {
        return (
            <div className="container mt-5">
                <h2>No se encontraron detalles del jugador.</h2>
                <button onClick={() => navigate(-1)} className="btn btn-primary mt-3">Volver</button>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="card shadow-lg p-4">
                <h2 className="text-center mb-4">Ficha del Jugador</h2>
                <div className="row">
                    <div className="col-md-4 text-center mb-3">
                        <img
                            src={
                                borrarFoto
                                    ? 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png'
                                    : previewImage || jugador.fotografia || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png'
                            }
                            alt="Foto del Jugador"
                            className="img-thumbnail"
                            style={{ width: '100%', maxWidth: '250px', height: 'auto' }}
                        />

                        {isEditable && (
                            <div className="mt-3">
                                <label htmlFor="file-upload" className="form-label">Actualizar Fotografía</label>
                                <input
                                type="file"
                                id="file-upload"
                                className="form-control"
                                accept="image/*"
                                onChange={handleChange}
                                ref={el => { inputRefs.current['file'] = el; }} // Ref para el archivo
                                />

                                {errors.file && <span style={{ color: 'red' }} className="text-danger">{errors.file}</span>}

                                {jugador.fotografia && ( // Solo muestra el botón de borrar si hay una foto original
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger mt-2"
                                        onClick={() => {
                                            setBorrarFoto(true);
                                            setPreviewImage('https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png');
                                            setFormData(prev => ({ ...prev, file: null }));
                                        }}
                                    >
                                        Borrar Foto
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="col-md-8">
                        <div className="row">
                            {[
                                { label: 'Nombre', key: 'nombre', type: 'text' },
                                { label: 'Apellido', key: 'apellido', type: 'text' },
                                { label: 'Carné', key: 'carne', type: 'number' },
                                { label: 'Teléfono', key: 'telefono', type: 'tel' },
                                { label: 'Fecha de Nacimiento', key: 'fechaNacimiento', type: 'date' },
                                { label: 'Edad', key: 'edad', type: 'text', disabled: true },
                            ].map(({ label, key, type, disabled }) => (
                                <div className="col-md-6 mb-3" key={key}>
                                    <label htmlFor={key} className="form-label">{label}</label>
                                    <input
                                    type={type}
                                    id={key}
                                    name={key}
                                    className={`form-control ${errors[key] ? 'is-invalid' : ''}`}
                                    value={
                                        formData[key as keyof JugadorFormData] === null || formData[key as keyof JugadorFormData] === undefined
                                        ? ''
                                        : String(formData[key as keyof JugadorFormData])
                                    }
                                    onChange={handleChange}
                                    disabled={!isEditable || disabled}
                                    ref={el => { inputRefs.current[key] = el; }}
                                    {...(key === 'telefono' && {
                                        pattern: "\\d{4}-\\d{4}",
                                        title: "Formato: 1234-5678",
                                        placeholder: "Ej: 1234-5678"
                                    })}
                                    />

                                    {errors[key] && <div className="invalid-feedback">{errors[key]}</div>}
                                </div>
                            ))}

                            {/* Combos dinámicos */}
                            <div className="col-md-6 mb-3">
                                <label htmlFor="carreraId" className="form-label">Carrera</label>
                                <select
                                id="carreraId"
                                className={`form-select ${errors.carreraId ? 'is-invalid' : ''}`}
                                name="carreraId"
                                value={formData.carreraId || ''}
                                onChange={handleChange}
                                disabled={!isEditable}
                                ref={el => { inputRefs.current['carreraId'] = el; }}
                                >
                                    <option value="">Seleccione carrera</option>
                                    {carreras.map(c => (
                                        <option key={c.carreraId} value={c.carreraId}>{c.nombre}</option>
                                    ))}
                                </select>
                                {errors.carreraId && <div className="invalid-feedback">{errors.carreraId}</div>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="codigoCarrera" className="form-label">Código de Carrera</label>
                                <select
                                id="codigoCarrera"
                                className={`form-select ${errors.codigoCarrera ? 'is-invalid' : ''}`}
                                name="codigoCarrera"
                                value={formData.codigoCarrera || ''}
                                onChange={handleChange}
                                disabled={!isEditable || !formData.carreraId}
                                ref={el => { inputRefs.current['codigoCarrera'] = el; }}
                                >
                                    <option value="">Seleccione código</option>
                                    {[...new Set(semestres.map(s => s.codigoCarrera))].map(codigo => (
                                        <option key={codigo} value={codigo}>{codigo}</option>
                                    ))}
                                </select>
                                {errors.codigoCarrera && <div className="invalid-feedback">{errors.codigoCarrera}</div>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="semestre" className="form-label">Semestre</label>
                                <input
                                    type="text"
                                    id="semestre"
                                    className="form-control"
                                    name="semestre"
                                    value={formData.semestre || ''}
                                    disabled
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="seccion" className="form-label">Sección</label>
                                <input
                                    type="text"
                                    id="seccion"
                                    className="form-control"
                                    name="seccion"
                                    value={formData.seccion || ''}
                                    disabled
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="departamentoId" className="form-label">Departamento</label>
                                <select
                                    id="departamentoId"
                                    className={`form-select ${errors.departamentoId ? 'is-invalid' : ''}`}
                                    name="departamentoId"
                                    value={formData.departamentoId || ''}
                                    onChange={handleChange}
                                    disabled={!isEditable}
                                    ref={el => {inputRefs.current['departamentoId'] = el}}
                                >
                                    <option value="">Seleccione departamento</option>
                                    {departamentos.map(d => (
                                        <option key={d.departamentoId} value={d.departamentoId}>{d.nombre}</option>
                                    ))}
                                </select>
                                {errors.departamentoId && <div className="invalid-feedback">{errors.departamentoId}</div>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="municipioId" className="form-label">Municipio</label>
                                <select
                                    id="municipioId"
                                    className={`form-select ${errors.municipioId ? 'is-invalid' : ''}`}
                                    name="municipioId"
                                    value={formData.municipioId || ''}
                                    onChange={handleChange}
                                    disabled={!isEditable || municipios.length === 0}
                                    ref={el => {inputRefs.current['municipioId'] = el}}
                                >
                                    <option value="">Seleccione municipio</option>
                                    {municipios.map(m => (
                                        <option key={m.municipioId} value={m.municipioId}>{m.nombre}</option>
                                    ))}
                                </select>
                                {errors.municipioId && <div className="invalid-feedback">{errors.municipioId}</div>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="estadoTexto" className="form-label">Estado</label>
                                <input
                                    type="text"
                                    id="estadoTexto"
                                    className="form-control"
                                    name="estadoTexto"
                                    value={formData.estadoTexto || 'No disponible'}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={async () => {
                            if (isEditable) {
                                await handleActualizar();
                            } else {
                                setIsEditable(true);
                                // Al entrar en modo edición, reseteamos el estado de validación
                                setCarneValidado(true);
                                // Limpia errores al entrar en modo edición
                                setErrors({});
                            }
                        }}
                        className={`btn ${isEditable ? 'btn-success' : 'btn-warning'} me-2`}
                        // 3. El botón de guardar estará siempre activo. Las validaciones se hacen en handleActualizar.
                    >
                        {isEditable ? 'Guardar' : 'Editar'}
                    </button>

                    {isEditable && (
                        <button type="button" onClick={handleCancelEdit} className="btn btn-danger me-2">
                            Cancelar Edición
                        </button>
                    )}

                    <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JugadorDetail;