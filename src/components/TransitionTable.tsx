import React from "react";
import { NFA } from "../utils/types";
import "../styles/styles.css";

interface TransitionTableProps {
  automaton: NFA;
}

const TransitionTable: React.FC<TransitionTableProps> = ({ automaton }) => {
  return (
    <div className="transition-table">
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
                  <td className={
                    from === automaton.initialState.toString()
                      ? "initial-state"
                      : automaton.acceptingStates.has(Number(from))
                      ? "final-state"
                      : ""
                  }>
                    {from}
                  </td>
                  <td>{symbol}</td>
                  <td className={
                    automaton.acceptingStates.has(to)
                      ? "final-state"
                      : ""
                  }>
                    {to}
                  </td>
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
