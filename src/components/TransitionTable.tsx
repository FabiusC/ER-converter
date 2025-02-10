import React from "react";
import { NFA } from "../utils/types";
import "../styles/styles.css";

interface TransitionTableProps {
  automaton: NFA;
  onClose: () => void;
}

const TransitionTable: React.FC<TransitionTableProps> = ({ automaton }) => {
  return (
    <div className="transition-table">
      <h3>Tabla de Transiciones</h3>
      <table>
        <thead>
          <tr>
            <th>Estado</th>
            <th>Símbolo</th>
            <th>Destino</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(automaton.transitionTable).map(([from, transitions]) =>
            Object.entries(transitions as Record<string, number[]>).map(([symbol, toStates]) =>
              toStates.map((to) => (
                <tr key={`${from}-${symbol}-${to}`}>
                  <td>{from}</td>
                  <td>{symbol}</td>
                  <td>{to}</td>
                </tr>
              ))
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransitionTable;
