import { NFA, DFA } from "./types";

/** 📌 Convierte un AFN en un AFD usando el método de subconjuntos */
export const convertNFAtoDFA = (nfa: NFA): DFA => {
  const dfa: DFA = {
    states: new Set(),
    alphabet: new Set(nfa.alphabet),
    transitionTable: {},
    initialState: 0,
    acceptingStates: new Set(),
  };

  const stateMapping = new Map<string, number>(); // Mapea conjuntos de estados a IDs únicos
  let stateCounter = 0;

  const getStateID = (stateSet: Set<number>): number => {
    const key = [...stateSet].sort().join(",");
    if (!stateMapping.has(key)) {
      stateMapping.set(key, stateCounter++);
    }
    return stateMapping.get(key)!;
  };

  const queue: Set<number>[] = [new Set([nfa.initialState])];
  dfa.initialState = getStateID(queue[0]);

  while (queue.length > 0) {
    const currentSet = queue.shift()!;
    const currentID = getStateID(currentSet);
    dfa.states.add(currentID);

    if ([...currentSet].some((state) => nfa.acceptingStates.has(state))) {
      dfa.acceptingStates.add(currentID);
    }

    for (const symbol of dfa.alphabet) {
      // eslint-disable-next-line prefer-const
      let newStateSet = new Set<number>();
      currentSet.forEach((state) => {
        if (nfa.transitionTable[state]?.[symbol]) {
          nfa.transitionTable[state][symbol].forEach((target) =>
            newStateSet.add(target)
          );
        }
      });

      if (newStateSet.size > 0) {
        const newStateID = getStateID(newStateSet);
        if (!dfa.transitionTable[currentID]) {
          dfa.transitionTable[currentID] = {};
        }
        dfa.transitionTable[currentID][symbol] = newStateID;
        if (![...dfa.states].includes(newStateID)) queue.push(newStateSet);
      }
    }
  }

  return dfa;
};
