import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { cellKey, findCell, isInSight, Position } from "../../constants/levels";
import { ItemType } from "../../utils/items";
import { createItemMeshes, ItemMeshes } from "./items";
import { createWalker, Walker } from "./walker";
import Minimap from "./Minimap";
import { Stage, StageWrap } from "./styles";

type Props = {
  grid: string[];
  position: Position;
  fogRadius?: number;
  revealed: Set<string>;
  items: Record<string, ItemType>;
  isWinning: boolean;
  /** Camera at eye level, looking where the player faces */
  firstPerson?: boolean;
  /** 0 north, 1 east, 2 south, 3 west (first person only) */
  facing?: number;
  /** Cells the compass is pointing along */
  hint?: Set<string>;
};

type Visibility = "visible" | "seen" | "hidden";

const WALL_HEIGHT = 0.9;
// Taller walls inside the maze feel like corridors, not a model
const WALL_HEIGHT_FP = 1.25;
const EYE_HEIGHT = 0.52;
const VISIBLE_TINT = new THREE.Color(0xffffff);
const SEEN_TINT = new THREE.Color(0x2a2650);
const PATH_TINT = new THREE.Color(0x15122e);
const PATH_SEEN_TINT = new THREE.Color(0x0a0918);
const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);

/** Scene objects that change after the maze is built */
type MazeScene = {
  size: number;
  wallHeight: number;
  walls: THREE.InstancedMesh;
  wallCaps: THREE.InstancedMesh;
  tiles: THREE.InstancedMesh;
  wallCells: Position[];
  tileCells: Position[];
  exit: THREE.Group;
  exitCell: Position;
  dispose: () => void;
};

const toWorld = (size: number, { row, col }: Position) =>
  new THREE.Vector3(col - size / 2 + 0.5, 0, row - size / 2 + 0.5);

const buildMaze = (scene: THREE.Scene, grid: string[], firstPerson: boolean): MazeScene => {
  const size = grid.length;
  const wallHeight = firstPerson ? WALL_HEIGHT_FP : WALL_HEIGHT;
  const wallCells: Position[] = [];
  const tileCells: Position[] = [];
  grid.forEach((line, row) =>
    [...line].forEach((char, col) =>
      (char === "#" ? wallCells : tileCells).push({ row, col })
    )
  );

  // Glass blocks: translucent, glossy, reflecting the environment map
  const wallGeometry = new THREE.BoxGeometry(firstPerson ? 1 : 0.94, wallHeight, firstPerson ? 1 : 0.94);
  const wallMaterial = new THREE.MeshPhysicalMaterial({
    color: firstPerson ? 0x4b3fb8 : 0x8c80ff,
    roughness: firstPerson ? 0.12 : 0.05,
    metalness: 0.1,
    clearcoat: firstPerson ? 0.35 : 1,
    clearcoatRoughness: firstPerson ? 0.3 : 0.05,
    // Inside the maze walls are solid: see-through walls would give the route away
    transparent: !firstPerson,
    opacity: firstPerson ? 1 : 0.32,
    envMapIntensity: firstPerson ? 0.35 : 0.7,
    depthWrite: firstPerson,
  });
  const walls = new THREE.InstancedMesh(wallGeometry, wallMaterial, wallCells.length);

  // Bright rim on top of each block sells the glass-panel look
  const capGeometry = new THREE.BoxGeometry(firstPerson ? 1 : 0.94, 0.02, firstPerson ? 1 : 0.94);
  const capMaterial = new THREE.MeshBasicMaterial({
    color: 0xc9c2ff,
    transparent: true,
    opacity: 0.4,
  });
  const wallCaps = new THREE.InstancedMesh(capGeometry, capMaterial, wallCells.length);

  const tileGeometry = new THREE.PlaneGeometry(0.98, 0.98).rotateX(-Math.PI / 2);
  const tileMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: firstPerson ? 0.7 : 0.4,
    metalness: firstPerson ? 0 : 0.2,
    envMapIntensity: firstPerson ? 0.15 : 1,
    transparent: true,
    opacity: 0.8,
  });
  const tiles = new THREE.InstancedMesh(tileGeometry, tileMaterial, tileCells.length);

  scene.add(walls, wallCaps, tiles);

  // Exit: glowing pad, door slab and a green light
  const exitCell = findCell(grid, "E");
  const exit = new THREE.Group();
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.04, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x7ad7a7, emissive: 0x2f9e6a, emissiveIntensity: 1.5 })
  );
  pad.position.y = 0.02;
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.7, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xd9fbe9, emissive: 0x7ad7a7, emissiveIntensity: 0.8 })
  );
  door.position.y = 0.39;
  const exitLight = new THREE.PointLight(0x7ad7a7, 3, 4, 1.5);
  exitLight.position.y = 0.8;
  exit.add(pad, door, exitLight);
  exit.position.copy(toWorld(size, exitCell));
  scene.add(exit);

  return {
    size,
    wallHeight,
    walls,
    wallCaps,
    tiles,
    wallCells,
    tileCells,
    exit,
    exitCell,
    dispose: () => {
      scene.remove(walls, wallCaps, tiles, exit);
      [wallGeometry, capGeometry, tileGeometry, pad.geometry, door.geometry].forEach((g) =>
        g.dispose()
      );
      [wallMaterial, capMaterial, tileMaterial, pad.material, door.material].forEach((m) =>
        (m as THREE.Material).dispose()
      );
      walls.dispose();
      wallCaps.dispose();
      tiles.dispose();
    },
  };
};

const updateVisibility = (maze: MazeScene, visibility: (cell: Position) => Visibility) => {
  const matrix = new THREE.Matrix4();

  maze.wallCells.forEach((cell, i) => {
    const state = visibility(cell);
    const p = toWorld(maze.size, cell);
    if (state === "hidden") {
      maze.walls.setMatrixAt(i, HIDDEN);
      maze.wallCaps.setMatrixAt(i, HIDDEN);
      return;
    }
    maze.walls.setMatrixAt(i, matrix.makeTranslation(p.x, maze.wallHeight / 2, p.z));
    maze.walls.setColorAt(i, state === "seen" ? SEEN_TINT : VISIBLE_TINT);
    maze.wallCaps.setMatrixAt(i, matrix.makeTranslation(p.x, maze.wallHeight + 0.01, p.z));
    maze.wallCaps.setColorAt(i, state === "seen" ? SEEN_TINT : VISIBLE_TINT);
  });

  maze.tileCells.forEach((cell, i) => {
    const state = visibility(cell);
    const p = toWorld(maze.size, cell);
    if (state === "hidden") {
      maze.tiles.setMatrixAt(i, HIDDEN);
      return;
    }
    maze.tiles.setMatrixAt(i, matrix.makeTranslation(p.x, 0, p.z));
    maze.tiles.setColorAt(i, state === "seen" ? PATH_SEEN_TINT : PATH_TINT);
  });

  for (const mesh of [maze.walls, maze.wallCaps, maze.tiles]) {
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }

  maze.exit.visible = visibility(maze.exitCell) !== "hidden";
};

const Maze3D: FC<Props> = ({
  grid,
  position,
  fogRadius,
  revealed,
  items,
  isWinning,
  firstPerson = false,
  facing = 2,
  hint,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const mazeRef = useRef<MazeScene>();
  const walkerRef = useRef<Walker>();
  const itemsRef = useRef<ItemMeshes>();
  const lightsRef = useRef<{ hemi: THREE.HemisphereLight; sun: THREE.DirectionalLight }>();
  const hintRef = useRef<THREE.InstancedMesh>();
  // Latest props for the animation loop, which lives outside React renders
  const liveProps = { position, isWinning, size: grid.length, foggy: fogRadius !== undefined, firstPerson, facing };
  const live = useRef(liveProps);
  live.current = liveProps;

  // Renderer, camera, lights and the render loop: created once
  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    const hemi = new THREE.HemisphereLight(0xc9c2ff, 0x1a1446, 1.1);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(-4, 10, 6);
    scene.add(sun);
    lightsRef.current = { hemi, sun };
    // Soft cyan light that travels with the player (nice inside fog)
    const playerLight = new THREE.PointLight(0x9ff5e6, 1.4, 3.5, 1.5);
    scene.add(playerLight);

    const walker = createWalker();
    walkerRef.current = walker;
    scene.add(walker.root);

    // Compass markers: small golden orbs floating over the route
    const hintMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.07, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0xfcd34d }),
      64
    );
    hintMesh.count = 0;
    hintRef.current = hintMesh;
    scene.add(hintMesh);

    const itemMeshes = createItemMeshes();
    itemsRef.current = itemMeshes;
    scene.add(itemMeshes.group);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const clock = new THREE.Clock();
    const cameraTarget = new THREE.Vector3();
    let first = true;
    let frame = 0;
    let yaw = Math.PI; // first-person heading, eased toward the facing
    let bobPhase = 0;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const { position, isWinning, size, foggy, firstPerson, facing } = live.current;

      const target = toWorld(size, position);
      const before = walker.root.position.clone();
      walker.update(dt, target, isWinning, first);
      itemMeshes.animate(clock.elapsedTime);
      walker.root.visible = !firstPerson;
      const at = walker.root.position;

      if (firstPerson) {
        // Eye-level camera. Facing 0..3 maps to yaw; ease along the shortest turn
        const targetYaw = facing * (Math.PI / 2);
        const turn = ((targetYaw - yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        yaw = first ? targetYaw : yaw + turn * (1 - Math.exp(-dt * 12));

        // Gentle head bob while walking
        const speed = before.distanceTo(at) / Math.max(dt, 1e-3);
        bobPhase += speed > 0.5 ? dt * 14 : 0;
        const bob = speed > 0.5 ? Math.sin(bobPhase) * 0.025 : 0;

        if (camera.fov !== 72) {
          camera.fov = 72;
          camera.updateProjectionMatrix();
        }
        camera.position.set(at.x, EYE_HEIGHT + bob, at.z);
        cameraTarget.set(at.x + Math.sin(yaw), EYE_HEIGHT + bob, at.z - Math.cos(yaw));
        camera.lookAt(cameraTarget);
        // A faint glow around the player, mostly to light the floor
        playerLight.intensity = 0.35;
        playerLight.distance = 2.2;
        playerLight.position.set(at.x + Math.sin(yaw) * 0.3, EYE_HEIGHT + 0.2, at.z - Math.cos(yaw) * 0.3);
      } else {
        if (camera.fov !== 50) {
          camera.fov = 50;
          camera.updateProjectionMatrix();
        }
        playerLight.intensity = 1.4;
        playerLight.distance = 3.5;
        playerLight.position.set(at.x, 1.8, at.z + 0.6);
        // Third-person camera: above and behind (south of) the player, north stays up
        // Steep angle so walls in front never hide the player
        const height = foggy ? 4.6 : 6;
        const back = foggy ? 2.4 : 3.2;
        const desired = new THREE.Vector3(at.x, height, at.z + back);
        cameraTarget.set(at.x, 0.3, at.z - 0.3);
        if (first) camera.position.copy(desired);
        camera.position.lerp(desired, 1 - Math.exp(-dt * 6));
        camera.lookAt(cameraTarget);
      }
      first = false;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mazeRef.current?.dispose();
      mazeRef.current = undefined;
      walker.dispose();
      itemMeshes.dispose();
      hintMesh.geometry.dispose();
      (hintMesh.material as THREE.Material).dispose();
      hintMesh.dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  // Rebuild the maze geometry when the level changes
  useEffect(() => {
    const scene = sceneRef.current!;
    mazeRef.current?.dispose();
    mazeRef.current = buildMaze(scene, grid, firstPerson);
    // Dark levels inside the maze need dim lights, or the fog looks washed out
    const dark = firstPerson && fogRadius !== undefined;
    const pitchBlack = dark && fogRadius! <= 1;
    lightsRef.current!.hemi.intensity = pitchBlack ? 0.25 : dark ? 0.5 : 1.1;
    lightsRef.current!.sun.intensity = pitchBlack ? 0.15 : dark ? 0.4 : 1.4;

    if (firstPerson) {
      // Inside the maze darkness comes from real fog, not hidden blocks
      scene.fog =
        fogRadius !== undefined
          ? new THREE.Fog(0x05040f, fogRadius * 0.5, fogRadius + 1.6)
          : new THREE.Fog(0x05040f, 3, 14);
    } else {
      scene.fog = fogRadius !== undefined ? new THREE.Fog(0x05040f, fogRadius + 1, fogRadius + 6) : null;
    }
  }, [grid, fogRadius, firstPerson]);

  // Bonus items: rebuilt when one is picked up or the maze changes
  useEffect(() => {
    itemsRef.current?.set(items, (cell) => toWorld(grid.length, cell));
  }, [items, grid]);

  // Compass route
  useEffect(() => {
    const mesh = hintRef.current;
    if (!mesh) return;
    const cells = [...(hint ?? [])].slice(0, 64);
    const matrix = new THREE.Matrix4();
    cells.forEach((key, i) => {
      const [row, col] = key.split(",").map(Number);
      const p = toWorld(grid.length, { row, col });
      mesh.setMatrixAt(i, matrix.makeTranslation(p.x, 0.25, p.z));
    });
    mesh.count = cells.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [hint, grid]);

  // Fog of war / explored cells
  useEffect(() => {
    const maze = mazeRef.current;
    if (!maze) return;
    const visibility = (cell: Position): Visibility => {
      if (
        firstPerson ||
        fogRadius === undefined ||
        isWinning ||
        isInSight(position, cell.row, cell.col, fogRadius)
      ) {
        return "visible";
      }
      return revealed.has(cellKey(cell.row, cell.col)) ? "seen" : "hidden";
    };
    updateVisibility(maze, visibility);
    itemsRef.current?.setVisible((cell) => visibility(cell) !== "hidden");
  }, [grid, items, position, fogRadius, revealed, isWinning, firstPerson]);

  return (
    <StageWrap>
      <Stage ref={mountRef} aria-label={firstPerson ? "First-person maze" : "3D maze"} />
      {firstPerson && (
        <Minimap
          grid={grid}
          position={position}
          facing={facing}
          revealed={revealed}
          items={items}
          hint={hint}
        />
      )}
    </StageWrap>
  );
};

export default Maze3D;
