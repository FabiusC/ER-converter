import React, { useState, useEffect } from "react";
import TransitionTable from "./TransitionTable";
import AutomataViewer from "./AutomataViewer";
//import AutomataViewer from "./AV";
import { NFA } from "../utils/types";
import { deleteEpsilonTransitions } from "../utils/deleteEpsilonTransitions";
import { convertToDFA } from "../utils/convertToDFA";
import "../styles/styles.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  automaton: NFA | null;
  regex: string;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  automaton,
  regex,
  children,
}) => {
  const [afnWithoutEpsilon, setAfnWithoutEpsilon] = useState<NFA | null>(null);
  const [dfa, setDfa] = useState<NFA | null>(null);
  const [currentAutomaton, setCurrentAutomaton] = useState<NFA | null>(null);
  const [currentView, setCurrentView] = useState<"AFN-ε" | "AFN" | "AFD">(
    "AFN-ε"
  );

  // 📌 Generar los autómatas cuando se abre el modal
  useEffect(() => {
    if (isOpen && automaton) {
      console.log("📌 Generando AFN-ε...");
      const newAfn = deleteEpsilonTransitions(automaton, regex);
      setAfnWithoutEpsilon(newAfn);

      if (newAfn) {
        console.log("📌 Convirtiendo AFN sin ε a AFD...");
        const dfaAutomaton = convertToDFA(newAfn);
        setDfa(dfaAutomaton);
      }

      // 📌 Inicializa el autómata actual
      setCurrentAutomaton(automaton);
      setCurrentView("AFN-ε");
    }
  }, [isOpen, automaton, regex]);

  // 📌 Actualizar `currentAutomaton` cuando cambia la vista
  useEffect(() => {
    if (currentView === "AFN-ε") setCurrentAutomaton(automaton);
    if (currentView === "AFN") setCurrentAutomaton(afnWithoutEpsilon);
    if (currentView === "AFD") setCurrentAutomaton(dfa);
  }, [currentView, automaton, afnWithoutEpsilon, dfa]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* 📌 Layout con 3 columnas */}
        <div className="modal-content-wrapper">
          {/* 📌 Columna 1: Tablas de Transiciones */}
          <div className="tables-column">
            <div className="legend">
              <span className="legend-item">🔵Inicio</span>
              <span className="legend-item">🔴Aceptación</span>
              <span className="legend-item">🟢Normal</span>
              <span className="legend-item">🟠Inicio y Aceptación</span>
            </div>
            <div className="controls">
              <button className="close-modal" onClick={onClose}>
                ✖ Cerrar
              </button>
              <button
                className="btn-control"
                onClick={() => setCurrentView("AFN-ε")}
              >
                AFN-ε
              </button>
              <button
                className="btn-control"
                onClick={() => setCurrentView("AFN")}
              >
                AFN
              </button>
              <button
                className="btn-control"
                onClick={() => setCurrentView("AFD")}
              >
                AFD
              </button>
            </div>
            <h3 className="regex-title">{regex}</h3>
            {automaton && (
              <div className="table-container">
                <h3>AFN-ε</h3>
                <TransitionTable automaton={automaton} />
              </div>
            )}
            {afnWithoutEpsilon && (
              <div className="table-container">
                <h3>AFN</h3>
                <TransitionTable automaton={afnWithoutEpsilon} />
              </div>
            )}
            {dfa && (
              <div className="table-container">
                <h3>AFD</h3>
                <TransitionTable automaton={dfa} />
              </div>
            )}
          </div>
          <div className="automaton-container">
            {/* 📌 Columna 2: Gráficos */}
            {currentAutomaton && (
              <AutomataViewer automaton={currentAutomaton} />
            )}
          </div>
        </div>

        {/* 📌 Renderiza los `children` si existen */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
