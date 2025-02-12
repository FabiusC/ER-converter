/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { NFA } from "../utils/types";

interface AutomataViewerProps {
  automaton: NFA;
}

const AutomataViewer: React.FC<AutomataViewerProps> = ({ automaton }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [zoom, setZoom] = useState(6);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const transitionPairs = new Set<string>();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    if (renderer) {
      renderer.dispose();
      mount.innerHTML = "";
    }

    const newScene = new THREE.Scene();
    setScene(newScene);

    newScene.background = new THREE.Color(0x222222);
    const light = new THREE.AmbientLight(0xffffff, 1);
    newScene.add(light);

    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);

    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    setTimeout(() => {
      newRenderer.setSize(mount.clientWidth, mount.clientHeight);
    }, 100);
    newRenderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(newRenderer.domElement);

    const resizeRendererToDisplaySize = (renderer: THREE.WebGLRenderer) => {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
        return true;
      }
      return false;
    };

    const stateGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const colors = {
      normal: 0x008d00,
      initial: 0x00008d,
      accepting: 0x8d0000,
      initialAccepting: 0xff8c00,
    };
    const positions = new Map<number, THREE.Vector3>();
    const angleOffset = Math.PI / 8; // Pequeña variación en el ángulo para evitar superposiciones
    const loader = new FontLoader();
    const transitionColors = [0xffff00, 0xff00ff, 0x00ffff, 0xff8000];
    let colorIndex = 0;

    let i = 0;
    automaton.states.forEach((state) => {
      const x =
        Math.cos((i / automaton.states.size) * Math.PI * 2 + angleOffset * i) *
        3;
      const y =
        Math.sin((i / automaton.states.size) * Math.PI * 2 + angleOffset * i) *
        3;
      const position = new THREE.Vector3(x, y, 0);
      positions.set(state, position);
      let materialColor = colors.normal;
      if (
        state === automaton.initialState &&
        automaton.acceptingStates.has(state)
      )
        materialColor = colors.initialAccepting;
      else if (state === automaton.initialState) materialColor = colors.initial;
      else if (automaton.acceptingStates.has(state))
        materialColor = colors.accepting;

      const sphere = new THREE.Mesh(
        stateGeometry,
        new THREE.MeshBasicMaterial({ color: materialColor })
      );
      sphere.position.copy(position);
      newScene.add(sphere);

      loader.load(
        "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
        (font) => {
          const textGeometry = new TextGeometry(state.toString(), {
            font,
            size: 0.2,
            depth: 0.02,
          });
          const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          textMesh.position.copy(position).add(new THREE.Vector3(-0.1, 0.3, 0));
          newScene.add(textMesh);
        }
      );
      i++;
    });

    Object.entries(automaton.transitionTable).forEach(([from, transitions]) => {
      Object.entries(transitions).forEach(
        ([symbol, toStates], transitionIndex) => {
          toStates.forEach((to) => {
            const fromPos = positions.get(parseInt(from))!;
            const toPos = positions.get(to)!;
            const transitionColor =
              transitionColors[colorIndex % transitionColors.length];
            colorIndex++;

            const pairKey = `${from}-${to}`;
            const reversePairKey = `${to}-${from}`;
            const isReverse = transitionPairs.has(reversePairKey);
            transitionPairs.add(pairKey);

            if (parseInt(from) === to) {
              // 📌 Transición recursiva: Dibujar un lazo encima del nodo
              const loopRadius = 0.4;
              const loopCurve = new THREE.EllipseCurve(
                fromPos.x,
                fromPos.y + loopRadius,
                loopRadius,
                loopRadius,
                0,
                2 * Math.PI,
                false,
                0
              );
              const loopPoints = loopCurve
                .getPoints(50)
                .map((p) => new THREE.Vector3(p.x, p.y, 0));
              const loopGeometry = new THREE.BufferGeometry().setFromPoints(
                loopPoints
              );
              const loopLine = new THREE.Line(
                loopGeometry,
                new THREE.LineBasicMaterial({ color: transitionColor })
              );
              newScene.add(loopLine);
            } else {
              // 📌 Transición normal
              // 📌 Alternar entre curva convexa y cóncava si hay transiciones en ambos sentidos
              const midPoint = new THREE.Vector3(
                (fromPos.x + toPos.x) / 2,
                (fromPos.y + toPos.y) / 2,
                0
              );
              const offset = 0.5 + transitionIndex * 0.2;
              const controlPoint = new THREE.Vector3(
                midPoint.x,
                midPoint.y + (isReverse ? -offset : offset),
                0
              );

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
              newScene.add(curveLine);
            }
            // 📌 Alternar entre curva convexa y cóncava si hay transiciones en ambos sentidos
            const midPoint = new THREE.Vector3(
              (fromPos.x + toPos.x) / 2,
              (fromPos.y + toPos.y) / 2,
              0
            );
            const offset = 0.5 + transitionIndex * 0.2;
            const controlPoint = new THREE.Vector3(
              midPoint.x,
              midPoint.y + (isReverse ? -offset : offset),
              0
            );

            const arrowHelper = new THREE.ArrowHelper(
              new THREE.Vector3().subVectors(toPos, midPoint).normalize(), // Dirección de la flecha
              toPos, // Posición de la flecha
              -0.2, // 📌 Aumentamos la longitud de la flecha
              transitionColor,
              0.2, // 📌 Aumentamos el tamaño de la cabeza de la flecha
              0.1 // 📌 Aumentamos el tamaño del ancho de la cabeza
            );

            newScene.add(arrowHelper);

            loader.load(
              "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
              (font) => {
                const textGeometry = new TextGeometry(symbol, {
                  font,
                  size: 0.15,
                  depth: 0.02,
                });
                const textMaterial = new THREE.MeshBasicMaterial({
                  color: transitionColor,
                });
                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                textMesh.position.set(midPoint.x, midPoint.y, 0);
                newScene.add(textMesh);
              }
            );
          });
        }
      );
    });

    const animate = () => {
      requestAnimationFrame(animate);
      if (resizeRendererToDisplaySize(newRenderer)) {
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
      }
      newRenderer.render(newScene, camera);
    };
    animate();
  }, [automaton, zoom, position]);

  return (
    <div className="automaton-viewer">
      <div ref={mountRef} className="automata-container"></div>;
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
