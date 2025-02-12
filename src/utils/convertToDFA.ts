// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NFA, TransitionTable } from "../utils/types";

/**
 * 📌 Convierte un AFN a un AFD utilizando el método de conjuntos de estados.
 */
export const convertToDFA = (nfa: NFA): NFA => {
  const newTransitionTable: TransitionTable = {};
  const newStates = new Map<string, number>(); // Mapea conjuntos de estados a nuevos índices
  const newAlphabet = new Set(nfa.alphabet);
  const newAcceptingStates = new Set<number>();

  let newStateCounter = 0;

  // 📌 Definir el estado inicial del AFD
  const initialStateSet = new Set<number>([nfa.initialState]);
  const initialStateKey = JSON.stringify([...initialStateSet].sort());
  newStates.set(initialStateKey, newStateCounter++);
  const pendingStates: Set<number>[] = [initialStateSet];

  while (pendingStates.length > 0) {
    const currentSet = pendingStates.shift()!;
    const currentKey = JSON.stringify([...currentSet].sort());
    const representativeState = newStates.get(currentKey)!;
    newTransitionTable[representativeState] = {};

    newAlphabet.forEach((symbol) => {
      const reachableStates = new Set<number>();

      // 📌 Encontrar los estados alcanzables con el símbolo actual
      currentSet.forEach((state) => {
        if (nfa.transitionTable[state]?.[symbol]) {
          nfa.transitionTable[state][symbol].forEach((nextState) =>
            reachableStates.add(nextState)
          );
        }
      });

      if (reachableStates.size > 0) {
        const newKey = JSON.stringify([...reachableStates].sort());

        if (!newStates.has(newKey)) {
          newStates.set(newKey, newStateCounter++);
          pendingStates.push(reachableStates);
        }

        newTransitionTable[representativeState][symbol] = newTransitionTable[
          representativeState
        ][symbol] = [newStates.get(newKey)!];
      }
    });
  }

  // 📌 Determinar los estados de aceptación
  newStates.forEach((stateIndex, stateKey) => {
    const stateSet = new Set<number>(JSON.parse(stateKey));
    if ([...stateSet].some((s) => nfa.acceptingStates.has(s))) {
      newAcceptingStates.add(stateIndex);
    }
  });

  return {
    states: new Set(newStates.values()),
    alphabet: newAlphabet,
    transitionTable: newTransitionTable,
    initialState: newStates.get(initialStateKey)!,
    acceptingStates: newAcceptingStates,
  };
};
