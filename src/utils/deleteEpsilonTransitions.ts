/* eslint-disable @typescript-eslint/no-explicit-any */
import { NFA, TransitionTable } from "../utils/types";

/**
 * 📌 Calcula la λ-clausura de un estado en un AFN-λ.
 */
const computeEpsilonClosure = (
  state: number,
  transitionTable: TransitionTable
): Set<number> => {
  const closure = new Set<number>();
  const stack = [state];

  while (stack.length > 0) {
    const currentState = stack.pop()!;
    if (!closure.has(currentState)) {
      closure.add(currentState);
      if (transitionTable[currentState]?.["ε"]) {
        transitionTable[currentState]["ε"].forEach((nextState) => {
          if (!closure.has(nextState)) stack.push(nextState);
        });
      }
    }
  }
  return closure;
};

/**
 * 📌 Elimina las transiciones λ de un AFN-λ y devuelve un AFN sin transiciones λ.
 */
export const deleteEpsilonTransitions = (nfa: NFA, regex: string): NFA => {
  // 📌 Obtener todos los caracteres del alfabeto desde regex
  const alphabet = Array.from(new Set(regex.split(""))).filter(
    (char) => char !== "ε"
  );
  const newTransitionTable: TransitionTable = {};
  const stateGroups = new Map<string, number>();
  const newAcceptingStates = new Set<number>();

  // 📌 Calcular la λ-clausura de cada estado y almacenarlas
  const lambdaClosures: Record<number, Set<number>> = {};
  nfa.states.forEach((state) => {
    lambdaClosures[state] = computeEpsilonClosure(state, nfa.transitionTable);
  });

  // 📌 Configuración inicial
  const initialClosure = Array.from(lambdaClosures[nfa.initialState]).sort();
  const initialStateKey = JSON.stringify(initialClosure);
  let stateCounter = 0;
  stateGroups.set(initialStateKey, stateCounter++);

  // 📌 Tabla intermedia con estados combinados
  const intermediateTable: any[] = [];
  const pendingStates = [initialStateKey];

  // 📌 Construcción de la tabla intermedia
  while (pendingStates.length > 0) {
    const currentStateKey = pendingStates.shift()!;
    const stateSet = new Set(JSON.parse(currentStateKey)) as Set<number>;
    const row: Record<string, any> = { Q: stateGroups.get(currentStateKey) };

    // 📌 Evaluar las transiciones lambda (ε)
    const epsilonStates = new Set<number>();
    stateSet.forEach((state) => {
      lambdaClosures[state].forEach((s) => epsilonStates.add(s));
    });
    row["ε"] =
      Array.from(epsilonStates).length > 0 ? Array.from(epsilonStates) : "--";

    // 📌 Evaluar transiciones para cada símbolo en el alfabeto
    alphabet.forEach((symbol) => {
      const reachableStates = new Set<number>();

      stateSet.forEach((state) => {
        if (nfa.transitionTable[state]?.[symbol]) {
          nfa.transitionTable[state][symbol].forEach((nextState) => {
            lambdaClosures[nextState].forEach((s) => reachableStates.add(s));
          });
        }
      });

      if (reachableStates.size > 0) {
        const newStateArray = Array.from(reachableStates).sort();
        const newStateKey = JSON.stringify(newStateArray);

        if (!stateGroups.has(newStateKey)) {
          stateGroups.set(newStateKey, stateCounter++);
          pendingStates.push(newStateKey);
        }

        row[symbol] = stateGroups.get(newStateKey);
      } else {
        row[symbol] = "--";
      }
    });

    intermediateTable.push(row);
  }

  console.table(intermediateTable, ["Q", "ε", ...alphabet]);

  // 📌 Construcción de la tabla final sin transiciones λ
  const finalTable: any[] = [];
  stateGroups.forEach((index, stateKey) => {
    const row: Record<string, any> = { Q: index };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stateSet = new Set(JSON.parse(stateKey)) as Set<number>;

    alphabet.forEach((symbol) => {
      row[symbol] = "--";

      intermediateTable.forEach((intermediateRow) => {
        if (intermediateRow.Q === index && intermediateRow[symbol] !== "--") {
          row[symbol] = intermediateRow[symbol];
        }
      });
    });

    finalTable.push(row);
  });

  console.table(finalTable, ["Q", ...alphabet]);

  // 📌 Determinar los nuevos estados de aceptación
  stateGroups.forEach((index, stateKey) => {
    const stateSet = new Set(JSON.parse(stateKey)) as Set<number>;
    if ([...stateSet].some((s) => nfa.acceptingStates.has(s))) {
      newAcceptingStates.add(index);
    }
  });

  // 📌 Construcción de la tabla de transiciones sin transiciones λ
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stateGroups.forEach((index, stateKey) => {
    newTransitionTable[index] = {};
    alphabet.forEach((symbol) => {
      finalTable.forEach((row) => {
        if (row.Q === index && row[symbol] !== "--") {
          newTransitionTable[index][symbol] = [row[symbol]];
        }
      });
    });
  });

  return {
    states: new Set(stateGroups.values()),
    alphabet: new Set(alphabet),
    transitionTable: newTransitionTable,
    initialState: stateGroups.get(initialStateKey)!,
    acceptingStates: newAcceptingStates,
  };
};
