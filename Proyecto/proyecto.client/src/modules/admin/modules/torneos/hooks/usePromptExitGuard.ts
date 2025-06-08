import { useContext, useEffect } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

export function usePromptExitGuard(when: boolean, message: string) {
  const navigator = useContext(NavigationContext).navigator;

  useEffect(() => {
    if (!when) return;

    const originalPush = navigator.push;
    type PushArgs = Parameters<typeof originalPush>; 

    const customPush = (...args: PushArgs) => {
      if (window.confirm(message)) {
        navigator.push = originalPush;
        originalPush(...args);
      }
    };

    navigator.push = customPush;

    return () => {
      navigator.push = originalPush;
    };
  }, [when, message, navigator]);
}

