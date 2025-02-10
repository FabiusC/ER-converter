export const isValidRegex = (
  expression: string,
  alphabet: string[]
): boolean => {
  if (expression.length === 0) return false; // ❌ Expresión vacía

  const operators = new Set(["U", "•", "*", "(", ")"]);
  const validSymbols = new Set([...alphabet, ...operators]);

  let openParens = 0;
  let prevChar = "";
  let lastWasOperator = false;

  for (let i = 0; i < expression.length; i++) {
    const currentChar = expression[i];

    // 1️⃣ Validación de caracteres no permitidos
    if (!validSymbols.has(currentChar)) {
      console.error(`Carácter inválido: ${currentChar}`);
      return false;
    }

    // 2️⃣ Validación de paréntesis
    if (currentChar === "(") {
      openParens++;
      lastWasOperator = true; // Un paréntesis de apertura puede preceder a un operador
    } else if (currentChar === ")") {
      openParens--;
      if (openParens < 0) {
        console.error("Paréntesis cerrados sin abrir.");
        return false;
      }
      lastWasOperator = false; // Un paréntesis de cierre no puede preceder a un operador
    }

    // 3️⃣ Validación de operadores binarios (U y •)
    if (currentChar === "U" || currentChar === "•") {
      // No puede haber operadores al inicio o final
      if (i === 0 || i === expression.length - 1) {
        console.error(`Operador ${currentChar} mal posicionado.`);
        return false;
      }

      // No puede haber operadores consecutivos
      if (lastWasOperator) {
        console.error(
          `Operadores consecutivos no permitidos: ${prevChar}${currentChar}`
        );
        return false;
      }

      lastWasOperator = true;
    } else {
      lastWasOperator = false;
    }

    // 4️⃣ Validación del operador de Kleene (*)
    if (currentChar === "*") {
      // No puede estar al inicio
      if (i === 0) {
        console.error("El operador de Kleene (*) no puede estar al inicio.");
        return false;
      }

      // No puede seguir a otro *
      if (prevChar === "*") {
        console.error("Doble estrella (*) no permitida.");
        return false;
      }

      // No puede estar después de un operador binario
      if (prevChar === "U" || prevChar === "•") {
        console.error(
          "El operador de Kleene (*) no puede seguir a un operador binario."
        );
        return false;
      }
    }

    // 5️⃣ Validación de concatenaciones (•)
    if (currentChar === "•") {
      // No puede estar al inicio o final
      if (i === 0 || i === expression.length - 1) {
        console.error(
          "El operador de concatenación (•) no puede estar al inicio o final."
        );
        return false;
      }

      // No puede concatenar operadores binarios
      if (prevChar === "U" || prevChar === "•") {
        console.error(
          "El operador de concatenación (•) no puede estar junto a otro operador binario."
        );
        return false;
      }
    }

    // 6️⃣ Validación de símbolos del alfabeto
    if (alphabet.includes(currentChar)) {
      // No puede haber dos símbolos seguidos sin concatenación
      if (alphabet.includes(prevChar)) {
        console.error(
          "Dos símbolos del alfabeto no pueden estar seguidos sin concatenación explícita."
        );
        return false;
      }
    }

    prevChar = currentChar;
  }

  // 7️⃣ Verificar que todos los paréntesis se cerraron
  if (openParens !== 0) {
    console.error("Paréntesis abiertos sin cerrar.");
    return false;
  }

  return true;
};
