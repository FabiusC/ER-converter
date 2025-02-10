export const infixToPostfix = (
  expression: string,
  alphabet: string[]
): string => {
  const precedence: { [key: string]: number } = { "•": 2, U: 1, "*": 3 };
  const output: string[] = [];
  const operators: string[] = [];

  const isOperator = (char: string) => Object.keys(precedence).includes(char);
  const isAlphabet = (char: string) => alphabet.includes(char);

  // eslint-disable-next-line prefer-const
  for (let char of expression) {
    if (isAlphabet(char)) {
      output.push(char);
    } else if (char === "(") {
      operators.push(char);
    } else if (char === ")") {
      while (operators.length && operators[operators.length - 1] !== "(") {
        output.push(operators.pop()!);
      }
      operators.pop();
    } else if (isOperator(char)) {
      while (
        operators.length &&
        precedence[operators[operators.length - 1]] >= precedence[char]
      ) {
        output.push(operators.pop()!);
      }
      operators.push(char);
    }
  }

  while (operators.length) {
    output.push(operators.pop()!);
  }

  return output.join("");
};
