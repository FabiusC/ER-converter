import React, { useState } from "react";
import AlphabetInput from "./components/AlphabetInput";
import RegexInput from "./components/RegexInput";
import { NFA } from "./utils/types";
import "./styles/styles.css";

const App: React.FC = () => {
  const [alphabet, setAlphabet] = useState<string[] | null>(null);
  const [expression, setExpression] = useState<string | null>(null);
  const [, setAutomaton] = useState<NFA | null>(null);

  const handleAlphabetSubmit = (alphabet: string[], expression?: string) => {
    setAlphabet(alphabet);
    setExpression(expression || null);
    setAutomaton(null); // Resetear el automáta al cambiar el alfabeto
  };

  const handleBack = () => {
    setAlphabet(null);
    setExpression(null);
    setAutomaton(null);
  };

  return (
    <div className="app-container">
      {!alphabet ? (
        <AlphabetInput onAlphabetSubmit={handleAlphabetSubmit} />
      ) : (
        <RegexInput
          alphabet={alphabet}
          expression={expression}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default App;
