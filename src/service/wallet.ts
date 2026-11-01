import { PowerId } from "../constants/powers";

/**
 * Coins, experience and bought powers, kept in localStorage (works offline).
 * Every access is guarded: storage can be unavailable (private mode).
 */
const KEY = "maze:wallet";

export type Wallet = {
  coins: number;
  xp: number;
  inventory: Partial<Record<PowerId, number>>;
};

const EMPTY: Wallet = { coins: 0, xp: 0, inventory: {} };

export const getWallet = (): Wallet => {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...EMPTY };
  }
};

const save = (wallet: Wallet) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(wallet));
  } catch {
    // Storage full or disabled: progress is best effort
  }
  window.dispatchEvent(new Event("maze:wallet"));
  return wallet;
};

/** Player level from total experience: 50 XP for level 2, then a growing curve. */
export const levelFromXp = (xp: number) => Math.floor(Math.sqrt(xp / 50)) + 1;
export const xpForLevel = (level: number) => 50 * (level - 1) ** 2;

export const buyPower = (id: PowerId, price: number): Wallet | null => {
  const wallet = getWallet();
  if (wallet.coins < price) return null;
  return save({
    ...wallet,
    coins: wallet.coins - price,
    inventory: { ...wallet.inventory, [id]: (wallet.inventory[id] ?? 0) + 1 },
  });
};

/** Uses one power from the inventory. Returns false if none are left. */
export const consumePower = (id: PowerId): boolean => {
  const wallet = getWallet();
  const owned = wallet.inventory[id] ?? 0;
  if (owned <= 0) return false;
  save({ ...wallet, inventory: { ...wallet.inventory, [id]: owned - 1 } });
  return true;
};

export type Reward = {
  coins: number;
  xp: number;
  breakdown: { label: string; coins: number }[];
  levelBefore: number;
  levelAfter: number;
};

/**
 * Coins for finishing a level: harder tiers pay more, plus bonuses for a high
 * score, a first clear and a perfect run.
 */
export const grantReward = (opts: {
  tier: number;
  score: number;
  firstClear: boolean;
  perfect: boolean;
}): Reward => {
  const breakdown = [
    { label: "Level complete", coins: 10 + opts.tier * 5 },
    { label: "High score", coins: Math.max(0, Math.floor((opts.score - 900) / 20)) },
    { label: "First clear", coins: opts.firstClear ? 25 : 0 },
    { label: "Perfect run", coins: opts.perfect ? 10 : 0 },
  ].filter((line) => line.coins > 0);

  const coins = breakdown.reduce((sum, line) => sum + line.coins, 0);
  const xp = Math.max(10, Math.round(opts.score / 20)) + opts.tier * 5;

  const wallet = getWallet();
  const levelBefore = levelFromXp(wallet.xp);
  const updated = save({ ...wallet, coins: wallet.coins + coins, xp: wallet.xp + xp });

  return { coins, xp, breakdown, levelBefore, levelAfter: levelFromXp(updated.xp) };
};
