import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { NFA } from "../utils/types";

interface AutomataViewerProps {
  automaton: NFA;
  onClose: () => void;
}

const AutomataViewer: React.FC<AutomataViewerProps> = ({ automaton }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(6);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    mount.innerHTML = ""; // 🔥 Limpiar antes de renderizar

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(position.x, position.y, zoom);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    /** 📌 Materiales de nodos */
    const stateGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const normalMaterial = new THREE.MeshBasicMaterial({ color: 0x008d00 }); // 🟢 Nodo Normal
    const startMaterial = new THREE.MeshBasicMaterial({ color: 0x00008d }); // 🔵 Nodo Inicial
    const acceptMaterial = new THREE.MeshBasicMaterial({ color: 0x8d0000 }); // 🔴 Nodo Final
    const startAcceptMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8c00,
    }); // 🟠 Nodo Inicial y Final

    /** 📌 Posicionar nodos */
    const positions = new Map<number, THREE.Vector3>();
    let i = 0;

    automaton.states.forEach((state) => {
      const x = Math.cos((i / automaton.states.size) * Math.PI * 2) * 3;
      const y = Math.sin((i / automaton.states.size) * Math.PI * 2) * 3;
      const position = new THREE.Vector3(x, y, 0);
      positions.set(state, position);

      let material = normalMaterial;
      if (
        state === automaton.initialState &&
        automaton.acceptingStates.has(state)
      ) {
        material = startAcceptMaterial;
      } else if (state === automaton.initialState) {
        material = startMaterial;
      } else if (automaton.acceptingStates.has(state)) {
        material = acceptMaterial;
      }

      const sphere = new THREE.Mesh(stateGeometry, material);
      sphere.position.copy(position);
      scene.add(sphere);

      /** 📌 Etiqueta del nodo */
      const loader = new FontLoader();
      loader.load(
        "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
        (font) => {
          const textGeometry = new TextGeometry(state.toString(), {
            font: font,
            size: 0.25,
            depth: 0.02,
          });
          const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          textMesh.position.copy(position);
          textMesh.position.z += 0.21;
          scene.add(textMesh);
        }
      );

      i++;
    });

    /** 📌 Dibujar transiciones */
    const colors = [0xffff00, 0xff00ff, 0x00ffff, 0xff8000];
    let colorIndex = 0;

    Object.entries(automaton.transitionTable).forEach(([from, transitions]) => {
      Object.entries(transitions).forEach(([symbol, toStates]) => {
        toStates.forEach((to) => {
          const fromState = parseInt(from);
          const fromPos = positions.get(fromState)!;
          const toPos = positions.get(to)!;
          const transitionColor = colors[colorIndex % colors.length]; // 📌 Color único por transición
          colorIndex++;

          const loader = new FontLoader();
          loader.load(
            "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
            (font) => {
              /** 📌 Determinar punto de control para la curvatura **/
              const midPoint = new THREE.Vector3(
                (fromPos.x + toPos.x) / 2,
                (fromPos.y + toPos.y) / 2,
                0
              );

              const controlPoint = new THREE.Vector3(
                midPoint.x + (fromPos.y > toPos.y ? 0.5 : -0.5), // 📌 Curvatura en dirección opuesta
                midPoint.y + (fromPos.x > toPos.x ? -0.5 : 0.5),
                0
              );

              if (fromState === to) {
                /** 📌 Transición Recursiva → Dibujar Curva con Flecha */
                const curve = new THREE.QuadraticBezierCurve3(
                  fromPos.clone().add(new THREE.Vector3(0.3, 0, 0)), // Punto inicial
                  fromPos.clone().add(new THREE.Vector3(0.6, 0.6, 0)), // Punto de control
                  fromPos.clone().add(new THREE.Vector3(0, 0.3, 0)) // Punto final (regresa al mismo estado)
                );

                const curvePoints = curve.getPoints(20);
                const curveGeometry = new THREE.BufferGeometry().setFromPoints(
                  curvePoints
                );
                const curveLine = new THREE.Line(
                  curveGeometry,
                  new THREE.LineBasicMaterial({ color: transitionColor })
                );
                scene.add(curveLine);

                // 📌 Flecha en la curva
                const arrowStart = curve.getPoint(0.75);
                const arrowEnd = curve.getPoint(0.95);
                const arrowDir = new THREE.Vector3()
                  .subVectors(arrowEnd, arrowStart)
                  .normalize();
                const arrowHelper = new THREE.ArrowHelper(
                  arrowDir,
                  arrowStart,
                  0.3,
                  transitionColor,
                  0.2,
                  0.15
                );
                scene.add(arrowHelper);

                // 📌 Etiqueta de transición en la curva (mismo color)
                const textGeometry = new TextGeometry(symbol, {
                  font: font,
                  size: 0.15,
                  depth: 0.02,
                });
                const textMaterial = new THREE.MeshBasicMaterial({
                  color: transitionColor,
                });
                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                textMesh.position.set(midPoint.x, midPoint.y + 0.1, 0);
                scene.add(textMesh);
              } else {
                /** 📌 Transición Normal → Dibujar Curva con Flecha */
                const curve = new THREE.QuadraticBezierCurve3(
                  fromPos,
                  controlPoint,
                  toPos
                );

                const curvePoints = curve.getPoints(20);
                const curveGeometry = new THREE.BufferGeometry().setFromPoints(
                  curvePoints
                );
                const curveLine = new THREE.Line(
                  curveGeometry,
                  new THREE.LineBasicMaterial({ color: transitionColor })
                );
                scene.add(curveLine);

                // 📌 Flecha al final de la curva
                const arrowStart = curve.getPoint(0.9);
                const arrowEnd = curve.getPoint(1.0);
                const arrowDir = new THREE.Vector3()
                  .subVectors(arrowEnd, arrowStart)
                  .normalize();
                const arrowHelper = new THREE.ArrowHelper(
                  arrowDir,
                  arrowStart,
                  0.3,
                  transitionColor,
                  0.2,
                  0.15
                );
                scene.add(arrowHelper);

                // 📌 Etiqueta en el punto medio de la curva (mismo color)
                const textGeometry = new TextGeometry(symbol, {
                  font: font,
                  size: 0.15,
                  depth: 0.02,
                });
                const textMaterial = new THREE.MeshBasicMaterial({
                  color: transitionColor,
                });
                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                textMesh.position.set(controlPoint.x, controlPoint.y, 0);
                scene.add(textMesh);
              }
            }
          );
        });
      });
    });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, [automaton, zoom, position]);

  return (
    <div className="graph-container">
      {/* 📌 Viewer y Convenciones */}
      <div className="viewer-wrapper">
        <div ref={mountRef} className="automata-container"></div>

        {/* 📌 Convenciones debajo del gráfico */}
        <div className="legend">
          <div className="legend-item">🔵Nodo Inicial</div>
          <div className="legend-item">🔴Nodo Final</div>
          <div className="legend-item">🟠Nodo Inicial y Final</div>
          <div className="legend-item">🟢Nodo Normal</div>
        </div>
        <div>
          <button className="btn btn-next">Convertir a AFN</button>
        </div>
      </div>

      {/* 📌 Controles de Zoom y Navegación */}
      <div className="controls-wrapper">
        <div className="controls">
          <button
            className="btn"
            onClick={() => setZoom((z) => Math.max(z - 1, 3))}
          >
            🔍 Zoom In
          </button>
          <button className="btn" onClick={() => setZoom((z) => z + 1)}>
            🔍 Zoom Out
          </button>
          <button
            className="btn"
            onClick={() => setPosition({ x: position.x - 1, y: position.y })}
          >
            ⬅ Izquierda
          </button>
          <button
            className="btn"
            onClick={() => setPosition({ x: position.x + 1, y: position.y })}
          >
            ➡ Derecha
          </button>
          <button
            className="btn"
            onClick={() => setPosition({ x: position.x, y: position.y + 1 })}
          >
            ⬆ Arriba
          </button>
          <button
            className="btn"
            onClick={() => setPosition({ x: position.x, y: position.y - 1 })}
          >
            ⬇ Abajo
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutomataViewer;
