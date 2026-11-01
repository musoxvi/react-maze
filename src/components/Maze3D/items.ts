import * as THREE from "three";
import { Position } from "../../constants/levels";
import { ItemType } from "../../utils/items";

export type ItemMeshes = {
  group: THREE.Group;
  set: (items: Record<string, ItemType>, toWorld: (cell: Position) => THREE.Vector3) => void;
  setVisible: (isVisible: (cell: Position) => boolean) => void;
  animate: (time: number) => void;
  dispose: () => void;
};

/** Floating, spinning pickups. Geometry and materials are shared between items. */
export const createItemMeshes = (): ItemMeshes => {
  const group = new THREE.Group();

  const gemGeometry = new THREE.OctahedronGeometry(0.18);
  const coneGeometry = new THREE.ConeGeometry(0.13, 0.17, 16);
  const bootGeometry = new THREE.BoxGeometry(0.12, 0.2, 0.22);
  const glowGeometry = new THREE.CircleGeometry(0.3, 24).rotateX(-Math.PI / 2);

  const gemMaterial = new THREE.MeshStandardMaterial({
    color: 0x7df9ff,
    emissive: 0x22d3ee,
    emissiveIntensity: 1.2,
    metalness: 0.3,
    roughness: 0.15,
  });
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xfcd34d,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.9,
    metalness: 0.6,
    roughness: 0.3,
  });
  const bootMaterial = new THREE.MeshStandardMaterial({
    color: 0xc4b5fd,
    emissive: 0x8b5cf6,
    emissiveIntensity: 1,
    transparent: true,
    opacity: 0.85,
  });
  const glowMaterials: Record<ItemType, THREE.MeshBasicMaterial> = {
    gem: new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.35 }),
    hourglass: new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35 }),
    boots: new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.35 }),
  };

  const build = (type: ItemType) => {
    const item = new THREE.Group();
    const spinner = new THREE.Group();
    spinner.name = "spinner";
    if (type === "gem") {
      spinner.add(new THREE.Mesh(gemGeometry, gemMaterial));
    } else if (type === "hourglass") {
      const top = new THREE.Mesh(coneGeometry, goldMaterial);
      top.rotation.x = Math.PI;
      top.position.y = 0.085;
      const bottom = new THREE.Mesh(coneGeometry, goldMaterial);
      bottom.position.y = -0.085;
      spinner.add(top, bottom);
    } else {
      const left = new THREE.Mesh(bootGeometry, bootMaterial);
      left.position.x = -0.08;
      const right = new THREE.Mesh(bootGeometry, bootMaterial);
      right.position.set(0.08, 0, 0.04);
      spinner.add(left, right);
    }
    spinner.position.y = 0.45;
    const glow = new THREE.Mesh(glowGeometry, glowMaterials[type]);
    glow.position.y = 0.01;
    item.add(spinner, glow);
    return item;
  };

  return {
    group,
    set: (items, toWorld) => {
      group.clear();
      Object.entries(items).forEach(([key, type]) => {
        const [row, col] = key.split(",").map(Number);
        const item = build(type);
        item.position.copy(toWorld({ row, col }));
        item.userData.cell = { row, col };
        group.add(item);
      });
    },
    setVisible: (isVisible) => {
      group.children.forEach((item) => {
        item.visible = isVisible(item.userData.cell);
      });
    },
    animate: (time) => {
      group.children.forEach((item, i) => {
        const spinner = item.getObjectByName("spinner")!;
        spinner.rotation.y = time * 1.8 + i;
        spinner.position.y = 0.45 + Math.sin(time * 2.5 + i) * 0.06;
      });
    },
    dispose: () => {
      group.clear();
      group.removeFromParent();
      [gemGeometry, coneGeometry, bootGeometry, glowGeometry].forEach((g) => g.dispose());
      [gemMaterial, goldMaterial, bootMaterial, ...Object.values(glowMaterials)].forEach((m) => m.dispose());
    },
  };
};
