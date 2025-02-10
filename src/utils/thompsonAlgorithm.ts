import { NFA } from "./types";
import { createEmptyNFA, addTransition } from "./NFA";

export const regexToNFA = (regex: string, alphabet: string[]): NFA | null => {
  const stack: NFA[] = [];
  let stateCounter = 0;

  for (let i = 0; i < regex.length; i++) {
    const char = regex[i];

    if (alphabet.includes(char)) {
      // 📌 AFN para un símbolo
      const nfa = createEmptyNFA();
      const start = stateCounter++;
      const end = stateCounter++;

      nfa.states.add(start);
      nfa.states.add(end);
      nfa.alphabet.add(char);
      addTransition(nfa, start, char, end);
      nfa.initialState = start;
      nfa.acceptingStates.add(end);

      stack.push(nfa);
    } else if (char === "U") {
      // 📌 Unión (a U b)
      if (stack.length < 2) {
        console.error("❌ Error: Operador U sin suficientes operandos.");
        return null;
      }
      const b = stack.pop()!;
      const a = stack.pop()!;
      const nfa = createEmptyNFA();
      const start = stateCounter++;

      // 📌 Crear transiciones desde el nuevo estado inicial `start`
      addTransition(nfa, start, "ε", a.initialState);
      addTransition(nfa, start, "ε", b.initialState);

      // 📌 Fusionar `transitionTable` de `a` y `b` en `nfa`
      nfa.transitionTable = { ...a.transitionTable, ...b.transitionTable };
      nfa.transitionTable[start] = { ε: [a.initialState, b.initialState] };

      // 📌 Estados de aceptación de `a` y `b` se convierten en los finales de la unión
      nfa.acceptingStates = new Set([
        ...a.acceptingStates,
        ...b.acceptingStates,
      ]);

      // 📌 Unificar todos los estados y alfabeto
      nfa.states = new Set([...a.states, ...b.states, start]);
      nfa.alphabet = new Set([...a.alphabet, ...b.alphabet]);
      nfa.initialState = start;

      stack.push(nfa);
    } else if (char === "•") {
      // 📌 Concatenación (a • b)
      if (stack.length < 2) {
        console.error("❌ Error: Operador • sin suficientes operandos.");
        return null;
      }
      const b = stack.pop()!;
      const a = stack.pop()!;

      // 📌 Conectar los estados finales de `a` con el inicio de `b`
      a.acceptingStates.forEach((state) =>
        addTransition(a, state, "ε", b.initialState)
      );

      // 📌 Fusionar estados y transiciones
      a.states = new Set([...a.states, ...b.states]);
      a.transitionTable = { ...a.transitionTable, ...b.transitionTable };
      a.acceptingStates = b.acceptingStates;

      stack.push(a);
    } else if (char === "*") {
      // 📌 Clausura de Kleene (A*)
      if (stack.length < 1) {
        console.error("❌ Error: Falta operando para *.");
        return null;
      }
      const a = stack.pop()!; // 📌 AFN contenido en la estrella

      // 📌 Agregar transiciones ε para repetir el ciclo
      a.acceptingStates.forEach((state) => {
        addTransition(a, state, "ε", a.initialState); // ε → Permite repetir el ciclo
      });

      // 📌 Hacer que el estado inicial también sea un estado de aceptación
      a.acceptingStates.add(a.initialState);

      stack.push(a);
    }
  }

  if (stack.length !== 1) {
    console.error(
      "❌ Error: Expresión mal formada, la pila no tiene un solo AFN."
    );
    return null;
  }

  return stack[0];
};
