import React from "react";
import "../styles/styles.css";

const OPERATORS = ["(", ")", "•", "U", "*", "DEL"];

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  alphabet: string[];
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  alphabet,
}) => {
  const keys = [...OPERATORS, ...alphabet];

  return (
    <div className="keyboard">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onKeyPress(key)}
          className={`key ${key === "DEL" ? "delete-key" : ""}`}
        >
          {key}
        </button>
      ))}
    </div>
  );
};

export default VirtualKeyboard;
