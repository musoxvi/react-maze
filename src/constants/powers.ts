export type PowerId = "dash" | "lantern" | "compass" | "boots";

export type Power = {
  id: PowerId;
  icon: string;
  name: string;
  description: string;
  price: number;
  /** Keyboard shortcut during a game */
  key: string;
};

export const DASH_CHARGES = 8;
export const LANTERN_BONUS = 2;
export const LANTERN_MAX_BONUS = 6;
export const COMPASS_MOVES = 12;
export const COMPASS_LENGTH = 10;

export const POWERS: Power[] = [
  {
    id: "dash",
    icon: "⚡",
    name: "Super speed",
    description: `Next ${DASH_CHARGES} moves run to the next junction for the cost of one.`,
    price: 40,
    key: "1",
  },
  {
    id: "lantern",
    icon: "🔦",
    name: "Lantern",
    description: `+${LANTERN_BONUS} vision for the rest of the level (fog, darkness and minimap).`,
    price: 30,
    key: "2",
  },
  {
    id: "compass",
    icon: "🧭",
    name: "Compass",
    description: `Shows the way for the next ${COMPASS_MOVES} moves.`,
    price: 50,
    key: "3",
  },
  {
    id: "boots",
    icon: "👣",
    name: "Ghost boots",
    description: "Your next 30 steps back onto visited cells are free.",
    price: 25,
    key: "4",
  },
];

export const getPower = (id: PowerId) => POWERS.find((power) => power.id === id)!;
