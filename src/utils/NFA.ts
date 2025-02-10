import { NFA } from "./types";

/** 📌 Crear un AFN vacío */
export const createEmptyNFA = (): NFA => ({
  states: new Set(),
  alphabet: new Set(),
  transitionTable: {},
  initialState: 0,
  acceptingStates: new Set(),
});

/** 📌 Agregar una transición al AFN */
export const addTransition = (
  nfa: NFA,
  from: number,
  symbol: string,
  to: number
) => {
  if (!nfa.transitionTable[from]) {
    nfa.transitionTable[from] = {};
  }
  if (!nfa.transitionTable[from][symbol]) {
    nfa.transitionTable[from][symbol] = [];
  }
  nfa.transitionTable[from][symbol].push(to);
};
