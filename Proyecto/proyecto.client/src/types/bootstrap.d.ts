// src/types/bootstrap.d.ts

declare module 'bootstrap' {
  export class Modal {
    // Cambia Record<string, any> a Record<string, unknown>
    constructor(element: HTMLElement, options?: Record<string, unknown>);
    static getInstance(element: HTMLElement): Modal | null;
    show(): void;
    hide(): void;
    toggle(): void;
  }
}

interface Window {
  bootstrap: {
    Modal: typeof import('bootstrap').Modal;
  };
}