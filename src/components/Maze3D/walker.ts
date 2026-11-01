import * as THREE from "three";

/** Colors taken from the original 2D character */
const COLORS = {
  skin: 0xf8c09d,
  shirt: 0xf69b76,
  pants: 0x4d4d4d,
  pantsDark: 0x333333,
  hair: 0x333333,
  shoes: 0x754c24,
};

export type Walker = {
  root: THREE.Group;
  update: (dt: number, target: THREE.Vector3, celebrating: boolean, snap: boolean) => void;
  dispose: () => void;
};

/** Box-built version of the player character with a simple walk cycle. */
export const createWalker = (): Walker => {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const geometries: THREE.BufferGeometry[] = [];
  const materials = new Map<number, THREE.MeshStandardMaterial>();
  const material = (color: number) => {
    if (!materials.has(color)) {
      materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.7 }));
    }
    return materials.get(color)!;
  };
  const box = (w: number, h: number, d: number, color: number) => {
    const geometry = new THREE.BoxGeometry(w, h, d);
    geometries.push(geometry);
    return new THREE.Mesh(geometry, material(color));
  };

  // Limbs hang from a pivot group so rotating the group swings the limb
  const limb = (x: number, y: number, parts: THREE.Mesh[]) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    parts.forEach((part) => pivot.add(part));
    body.add(pivot);
    return pivot;
  };

  const leg = (x: number, pantsColor: number) => {
    const pants = box(0.13, 0.34, 0.14, pantsColor);
    pants.position.y = -0.17;
    const shoe = box(0.14, 0.07, 0.22, COLORS.shoes);
    shoe.position.set(0, -0.36, 0.04);
    return limb(x, 0.4, [pants, shoe]);
  };
  const arm = (x: number) => {
    const sleeve = box(0.1, 0.14, 0.11, COLORS.shirt);
    sleeve.position.y = -0.07;
    const hand = box(0.085, 0.2, 0.09, COLORS.skin);
    hand.position.y = -0.24;
    return limb(x, 0.72, [sleeve, hand]);
  };

  const legLeft = leg(-0.08, COLORS.pantsDark);
  const legRight = leg(0.08, COLORS.pants);
  const armLeft = arm(-0.22);
  const armRight = arm(0.22);

  const hips = box(0.32, 0.1, 0.18, COLORS.pants);
  hips.position.y = 0.42;
  const torso = box(0.34, 0.32, 0.2, COLORS.shirt);
  torso.position.y = 0.62;
  const head = box(0.28, 0.28, 0.26, COLORS.skin);
  head.position.y = 0.94;
  const hair = box(0.3, 0.09, 0.28, COLORS.hair);
  hair.position.set(0, 1.1, -0.01);
  const fringe = box(0.3, 0.12, 0.07, COLORS.hair);
  fringe.position.set(0, 1.03, -0.12);
  const eyeL = box(0.035, 0.06, 0.02, COLORS.hair);
  eyeL.position.set(-0.06, 0.96, 0.135);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.06;
  body.add(hips, torso, head, hair, fringe, eyeL, eyeR);

  // Soft blob shadow so the character sits on the floor
  const shadowGeometry = new THREE.CircleGeometry(0.22, 24).rotateX(-Math.PI / 2);
  geometries.push(shadowGeometry);
  const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.position.y = 0.005;
  root.add(shadow);

  root.scale.setScalar(0.85);

  let phase = 0;
  let heading = 0;

  const update: Walker["update"] = (dt, target, celebrating, snap) => {
    const offset = new THREE.Vector3().subVectors(target, root.position);
    offset.y = 0;
    const distance = offset.length();

    if (snap) {
      root.position.copy(target);
    } else if (distance > 0.001) {
      // Glide toward the target cell
      const step = Math.min(distance, dt * 7);
      root.position.addScaledVector(offset.normalize(), step);
      heading = Math.atan2(offset.x, offset.z);
    }

    // Turn smoothly toward the direction of travel
    const turn = ((heading - root.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    root.rotation.y += turn * Math.min(1, dt * 14);

    const moving = distance > 0.02;
    phase += dt * (moving ? 16 : 0);
    const swing = moving ? Math.sin(phase) * 0.7 : 0;
    const ease = Math.min(1, dt * 12);
    legLeft.rotation.x += (swing - legLeft.rotation.x) * ease;
    legRight.rotation.x += (-swing - legRight.rotation.x) * ease;
    armLeft.rotation.x += (-swing - armLeft.rotation.x) * ease;
    armRight.rotation.x += (swing - armRight.rotation.x) * ease;

    const time = performance.now() / 1000;
    if (celebrating) {
      body.position.y = Math.abs(Math.sin(time * 6)) * 0.35;
      armLeft.rotation.z = -2.6;
      armRight.rotation.z = 2.6;
    } else {
      body.position.y = moving ? Math.abs(Math.sin(phase)) * 0.05 : Math.sin(time * 2.5) * 0.015;
      armLeft.rotation.z = 0;
      armRight.rotation.z = 0;
    }
  };

  return {
    root,
    update,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      shadowMaterial.dispose();
      root.removeFromParent();
    },
  };
};
