import styled, { keyframes } from "styled-components";

const exitGlow = keyframes`
  0%, 100% { box-shadow: inset 0 0 0 1px rgba(122, 215, 167, 0.6), 0 0 10px rgba(122, 215, 167, 0.35); }
  50% { box-shadow: inset 0 0 0 1px rgba(122, 215, 167, 0.9), 0 0 20px rgba(122, 215, 167, 0.6); }
`;

const swingA = keyframes`
  0%, 100% { transform: rotate(16deg); }
  50% { transform: rotate(-16deg); }
`;

const swingB = keyframes`
  0%, 100% { transform: rotate(-16deg); }
  50% { transform: rotate(16deg); }
`;

const bob = keyframes`
  0%, 50%, 100% { transform: translateY(0); }
  25%, 75% { transform: translateY(-4%); }
`;

const breathe = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2%); }
`;

const cheer = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  40% { transform: translateY(-18%) scale(1.05); }
`;

export const Board = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--size), 1fr);
  grid-template-rows: repeat(var(--size), 1fr);
  /* Fill the space left by the HUD (and the d-pad on touch screens) */
  width: min(94vw, calc(100dvh - var(--chrome, 180px)), 780px);
  aspect-ratio: 1;
  padding: 6px;
  border-radius: 4px;
  /* One blur for the whole board keeps the glass look cheap */
  background: rgba(10, 8, 30, 0.35);
  backdrop-filter: blur(10px) saturate(1.3);
  -webkit-backdrop-filter: blur(10px) saturate(1.3);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  overflow: hidden;

  .cell {
    position: relative;
    transition: background-color 220ms ease, box-shadow 220ms ease,
      opacity 220ms ease;
  }

  /* Glass blocks: translucent fill, light top-left edge, soft shadow */
  .wall {
    margin: 1px;
    border-radius: 2px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.28) 0%,
      rgba(200, 190, 255, 0.12) 45%,
      rgba(140, 120, 255, 0.08) 100%
    );
    box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.45),
      inset -1px -1px 0 rgba(255, 255, 255, 0.08),
      0 2px 6px rgba(0, 0, 0, 0.25);
  }
  .path {
    background: transparent;
  }
  .exit {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1px;
    background: rgba(122, 215, 167, 0.4);
    border-radius: 2px;
    animation: ${exitGlow} 2s ease-in-out infinite;

    svg {
      width: 62%;
      height: 62%;
      fill: #d9fbe9;
    }
  }
  /* Explored but out of sight: keep the layout, dim it */
  .seen {
    opacity: 0.35;
    animation: none;
  }
  .fog {
    background: rgba(3, 2, 8, 0.96);
    box-shadow: none;
    animation: none;
    margin: 0;
    border-radius: 0;

    svg {
      visibility: hidden;
    }
  }
`;

export const Player = styled.div`
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 1;
  /* One cell: (board - padding) / size */
  width: calc((100% - 12px) / var(--size));
  height: calc((100% - 12px) / var(--size));
  transition: transform 140ms ease-out;
  pointer-events: none;
  filter: drop-shadow(0 0 4px rgba(94, 234, 212, 0.8));

  svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    animation: ${breathe} 1.8s ease-in-out infinite;
  }
  &.left svg {
    scale: -1 1;
  }

  /* Limbs pivot at the shoulders and hips (SVG user units) */
  .leg {
    transform-origin: 940px 620px;
  }
  .arm {
    transform-origin: 945px 410px;
  }

  &.walking svg {
    animation: ${bob} 320ms linear infinite;
  }
  &.walking .leg-front,
  &.walking .arm-back {
    animation: ${swingA} 320ms ease-in-out infinite;
  }
  &.walking .leg-back,
  &.walking .arm-front {
    animation: ${swingB} 320ms ease-in-out infinite;
  }

  &.won svg {
    animation: ${cheer} 700ms ease-in-out infinite;
  }
`;
