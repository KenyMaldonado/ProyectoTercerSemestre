import { useContext, useEffect, useRef } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import Swal from 'sweetalert2'; // Asegúrate de importar SweetAlert2

export function usePromptExitGuard(when: boolean, message: string) {
  const navigator = useContext(NavigationContext).navigator;
  const messageRef = useRef(message); // Usar useRef para el mensaje

  // Actualizar el ref si el mensaje cambia
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    // Si 'when' es falso, no aplicamos el guardián.
    if (!when) return;

    // Guardar la función original de 'push' para poder restaurarla.
    const originalPush = navigator.push;
    type PushArgs = Parameters<typeof originalPush>;

    // Definir nuestra función 'push' personalizada.
    const customPush = (...args: PushArgs) => {
      // Mostrar la alerta de SweetAlert2 en lugar de window.confirm
      Swal.fire({
        title: '¡Atención!',
        text: messageRef.current, // Usar el mensaje actualizado desde el ref
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, restaurar la función original de 'push'
          // y luego ejecutarla para permitir la navegación.
          navigator.push = originalPush;
          originalPush(...args);
        }
        // Si el usuario cancela, no hacemos nada y la navegación se bloquea.
      });
    };

    // Sobrescribir la función 'push' del navegador con nuestra versión personalizada.
    // Esto es lo que "intercepta" los intentos de navegación.
    navigator.push = customPush;

    // Función de limpieza: restaurar la función original de 'push'
    // cuando el componente se desmonte o cuando 'when' cambie a falso.
    return () => {
      navigator.push = originalPush;
    };
  }, [when, navigator]); // Dependencias: 'when' y 'navigator'
}