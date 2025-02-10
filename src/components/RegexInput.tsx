import React, { useState, useEffect } from "react";
import VirtualKeyboard from "./VirtualKeyboard";
import { isValidRegex } from "../utils/regexValidator";
import { infixToPostfix } from "../utils/infixToPostfix"; // 📌 Conversión infija a posfija
import { regexToNFA } from "../utils/thompsonAlgorithm";
import AutomataViewer from "./AutomataViewer";
import TransitionTable from "./transitionTable";
import Modal from "./Modal";
import { NFA } from "../utils/types";
import "../styles/styles.css";

interface RegexInputProps {
  alphabet: string[];
  expression: string | null;
  onBack: () => void; // 📌 Función para volver a `AlphabetInput`
}

const RegexInput: React.FC<RegexInputProps> = ({
  alphabet,
  expression,
  onBack,
}) => {
  const [userExpression, setUserExpression] = useState(expression || "");
  const [isValid, setIsValid] = useState(true);
  const [automaton, setAutomaton] = useState<NFA | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsValid(isValidRegex(userExpression, alphabet));
  }, [userExpression, alphabet]);

  const handleKeyPress = (key: string) => {
    if (key === "DEL") {
      setUserExpression(userExpression.slice(0, -1));
    } else if (key === "()") {
      setUserExpression(userExpression + "()");
    } else {
      setUserExpression(userExpression + key);
    }
  };

  const generateAutomaton = () => {
    if (!isValid) {
      console.error("❌ Error: La expresión no es válida.");
      return;
    }

    // 📌 Convertir la expresión a posfija antes de generar el AFN
    const postfixExpression = infixToPostfix(userExpression, alphabet);
    console.log("📌 Expresión posfija:", postfixExpression);
    const generatedAutomaton = regexToNFA(postfixExpression, alphabet);

    console.log("📌 AFN generado:", generatedAutomaton);
    if (!generatedAutomaton) {
      console.error("❌ Error: No se pudo generar el AFN.");
      return;
    }

    setAutomaton(generatedAutomaton);
    setIsModalOpen(true);
  };

  return (
    <div className="container">
      {/* 📌 Botón de regreso a `AlphabetInput` */}
      <button onClick={onBack} className="btn btn-back">
        🔙 Atrás
      </button>

      <h1>Ingrese la Expresión Regular</h1>
      <input
        type="text"
        value={userExpression}
        readOnly
        className={`text-input ${isValid ? "" : "invalid"}`}
      />
      <VirtualKeyboard onKeyPress={handleKeyPress} alphabet={alphabet} />
      <button onClick={generateAutomaton} className="btn" disabled={!isValid}>
        Generar AFN
      </button>

      {/* 📌 Modal para mostrar el autómata */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        automaton={automaton} // ✅ Corregido, pasamos `automaton` en lugar de `generateAutomaton`
      >
        {automaton && (
          <AutomataViewer
            automaton={automaton}
            onClose={() => setIsModalOpen(false)}
          />
        )}
        {automaton && (
            <TransitionTable
              automaton={automaton}
              onClose={() => setIsModalOpen(false)}
            />
        )}
      </Modal>
    </div>
  );
};

export default RegexInput;
