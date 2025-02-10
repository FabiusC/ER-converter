import React from "react";
import { NFA } from "../utils/types";
import TransitionTable from "./TransitionTable";
import "../styles/styles.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  automaton: NFA | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, automaton }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        
        {/* 📌 Contenedor de dos columnas */}
        <div className="modal-content-wrapper">
          
          {/* 📌 Tabla de Transiciones en una columna */}
          {automaton && <TransitionTable automaton={automaton} />}

          {/* 📌 Contenido principal (Gráfico) */}
          <div className="modal-graph-container">
            {children}
          </div>

        </div>

        {/* 📌 Botón de Cerrar */}
        <button className="close-button" onClick={onClose}>✖</button>

      </div>
    </div>
  );
};

export default Modal;
