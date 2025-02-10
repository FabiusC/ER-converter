import React from "react";
import TransitionTable from "./TransitionTable";
import { NFA } from "../utils/types";
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
          {/* 📌 Tabla de Transiciones en la izquierda */}
          {automaton && <TransitionTable automaton={automaton} />}

          {/* 📌 Contenido principal (Gráfico) */}
          <div className="graph-wrapper">{children}</div>
        </div>

        {/* 📌 Botón de Cerrar */}
        <button className="close-modal" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
};

export default Modal;
