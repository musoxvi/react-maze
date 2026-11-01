import styled from "styled-components";
import { Card } from "../../components/ui/styles";

const TOUCH = "(pointer: coarse), (max-width: 640px)";

export const Screen = styled.main`
  --chrome: 230px;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 16px;

  @media ${TOUCH} {
    --chrome: 330px;
  }
`;

export const Hud = styled(Card)`
  width: min(94vw, 780px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px 10px 18px;
  flex-wrap: wrap;
`;

export const HudGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
`;

export const PlayerName = styled.span`
  font-weight: 700;
  font-size: 18px;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LevelBadge = styled.span`
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  background: rgba(94, 234, 212, 0.12);
  border: 1px solid rgba(94, 234, 212, 0.35);
  margin-left: -8px;
`;

export const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.1;
`;

export const StatLabel = styled.span`
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
`;

export const StatValue = styled.span`
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

export const HudButtons = styled.div`
  display: flex;
  gap: 8px;

  button {
    padding: 8px 14px;
    font-size: 14px;
  }
`;

export const OfflineBadge = styled.div`
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 700;
  color: #fde68a;
  background: rgba(120, 80, 0, 0.55);
  border: 1px solid rgba(253, 230, 138, 0.4);
  backdrop-filter: blur(8px);
`;

export const RecordNote = styled.p`
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 4px;
  font-weight: 700;
  color: var(--accent);
  background: rgba(94, 234, 212, 0.1);
  border: 1px solid rgba(94, 234, 212, 0.35);
`;

export const Loading = styled.div`
  width: min(94vw, 1100px);
  height: calc(100dvh - var(--chrome, 180px));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
`;

export const DPad = styled.div`
  display: none;

  @media ${TOUCH} {
    display: grid;
    grid-template-columns: repeat(3, 60px);
    grid-template-rows: repeat(2, 60px);
    gap: 8px;
    grid-template-areas:
      ". up ."
      "left down right";
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    border: 1px solid var(--border);
    background: var(--surface);
    backdrop-filter: blur(10px);
    color: var(--text);
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;

    &:active {
      background: rgba(94, 234, 212, 0.2);
      border-color: var(--accent);
    }
  }
  svg {
    width: 26px;
    height: 26px;
    fill: currentColor;
  }
  .up { grid-area: up; }
  .down { grid-area: down; }
  .down svg { transform: rotate(180deg); }
  .left { grid-area: left; }
  .left svg { transform: rotate(-90deg); }
  .right { grid-area: right; }
  .right svg { transform: rotate(90deg); }
`;

export const Toast = styled.div`
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 700;
  color: var(--text);
  background: var(--surface-strong);
  border: 1px solid var(--accent);
  box-shadow: 0 0 24px rgba(94, 234, 212, 0.35);
  white-space: nowrap;
  pointer-events: none;
`;

export const Legend = styled.p`
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 14px;
  font-size: 13px;
  color: var(--text-muted);

  kbd {
    display: inline-block;
    min-width: 20px;
    padding: 0 5px;
    border-radius: 4px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.06);
    font-family: inherit;
    color: var(--text);
    text-align: center;
  }
`;

export const PowerBar = styled.div`
  display: flex;
  gap: 8px;

  button {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 4px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: border-color 160ms ease, background-color 160ms ease;
  }
  button:hover:not(:disabled) {
    border-color: var(--accent);
  }
  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  button[aria-pressed="true"] {
    border-color: #fcd34d;
    box-shadow: 0 0 12px rgba(252, 211, 77, 0.4);
  }
  .icon {
    font-size: 18px;
  }
  .count {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  kbd {
    font-family: inherit;
    font-size: 11px;
    color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0 4px;
  }
  .live {
    position: absolute;
    top: -8px;
    right: -6px;
    min-width: 18px;
    padding: 0 4px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    color: #3b2a00;
    background: #fcd34d;
  }
`;

export const RewardBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 4px;
  background: rgba(252, 211, 77, 0.08);
  border: 1px solid rgba(252, 211, 77, 0.4);

  strong {
    color: #fcd34d;
    font-size: 18px;
  }
  span {
    font-size: 13px;
  }
  em {
    font-style: normal;
    font-weight: 700;
    color: var(--accent);
  }
`;

export const Results = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);

  @media (max-width: 520px) {
    grid-template-columns: repeat(3, 1fr);
  }

  .highlight {
    border-color: var(--accent);
    background: rgba(94, 234, 212, 0.1);
  }
  .highlight strong {
    color: var(--accent);
  }
  gap: 10px;
  margin-bottom: 8px;

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border);
  }
  span {
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  strong {
    font-size: 26px;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }
`;
