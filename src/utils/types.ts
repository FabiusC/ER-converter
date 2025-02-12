/** 📌 Representa una tabla de transiciones */
export type TransitionTable = {
  // Estado origen -> Símbolo -> [Estados destino]
  [state: number]: { [symbol: string]: number[] };
};

/** 📌 Definición del Autómata Finito No Determinista (AFN) */
export interface NFA {
  states: Set<number>; // Conjunto de estados
  alphabet: Set<string>; // Alfabeto del autómata
  transitionTable: TransitionTable; // Tabla de transiciones (incluye ε)
  initialState: number; // Estado inicial
  acceptingStates: Set<number>; // Estados de aceptación
}
