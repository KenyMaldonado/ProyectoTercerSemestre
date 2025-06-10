// src/modules/inscripcion/hooks/defineStepper.tsx

import React, { createContext, JSX, useContext, useState } from "react";

// Paso individual
export type Step = {
  id: string;
  title: string;
  description: string;
};

// Definición del stepper
export type StepperDefinition = {
  steps: Step[];
  current: Step;
  next: () => void;
  previous: () => void;
  isFirst: boolean;
  isLast: boolean;
  switchStep: (handlers: Record<string, () => JSX.Element>) => JSX.Element | null;
};

// Contexto
const StepperContext = createContext<StepperDefinition | undefined>(undefined);

// Hook para usar el stepper
export const useStepper = (): StepperDefinition => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error("useStepper must be used within a <ScopedStepper>.");
  }
  return context;
};

// Hook principal para definir y devolver componentes
export const defineStepper = (...steps: Step[]) => {
  const ScopedStepper = ({ children }: { children: React.ReactNode }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const switchStep = (handlers: Record<string, () => JSX.Element>) => {
      const id = steps[currentIndex]?.id;
      return handlers[id] ? handlers[id]() : null;
    };

    const stepper: StepperDefinition = {
      steps,
      current: steps[currentIndex],
      next: () => setCurrentIndex((prev) => Math.min(prev + 1, steps.length - 1)),
      previous: () => setCurrentIndex((prev) => Math.max(prev - 1, 0)),
      isFirst: currentIndex === 0,
      isLast: currentIndex === steps.length - 1,
      switchStep,
    };

    return (
      <StepperContext.Provider value={stepper}>
        {children}
      </StepperContext.Provider>
    );
  };

  return {
    ScopedStepper,
    useStepper,
    steps,
  };
};
