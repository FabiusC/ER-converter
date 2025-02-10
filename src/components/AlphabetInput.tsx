import React, { useState } from "react";
import examples from "../data/examples.json"; // Importar ejemplos

interface AlphabetInputProps {
  onAlphabetSubmit: (alphabet: string[], expression?: string) => void;
}

const AlphabetInput: React.FC<AlphabetInputProps> = ({ onAlphabetSubmit }) => {
  const [inputValue, setInputValue] = useState("");
   
  const [, setSelectedExample] = useState<string>("");

  const handleSubmit = () => {
    const alphabetArray = inputValue
      .split(",")
      .map((char) => char.trim())
      .filter((char) => char !== "");
    if (alphabetArray.length > 0) {
      onAlphabetSubmit(alphabetArray);
    }
  };

  const handleExampleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const example = examples.find(e => e.expression === event.target.value);
    if (example) {
      setSelectedExample(example.expression);
      onAlphabetSubmit(example.alphabet, example.expression); // Se pasa también la expresión
    }
  };

  return (
    <div className="container">
      <h1>Ingrese el alfabeto del lenguaje</h1>

      {/* 📌 Selector de ejemplos */}
      <select onChange={handleExampleSelect} className="select-example">
        <option value="">Selecciona un ejemplo</option>
        {examples.map((example, index) => (
          <option key={index} value={example.expression}>
            {example.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Ejemplo: a, b, c"
        className="text-input"
      />
      <button onClick={handleSubmit} className="btn">
        Confirmar Alfabeto
      </button>
    </div>
  );
};

export default AlphabetInput;
