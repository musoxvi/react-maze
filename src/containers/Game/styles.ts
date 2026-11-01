import styled from "styled-components";
import { Card } from "../../components/ui/styles";

const TOUCH = "(pointer: coarse), (max-width: 640px)";

export const Screen = styled.main`
  --chrome: 150px;
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
  width: min(94vw, calc(100dvh - var(--chrome)), 780px);
  min-width: min(100%, 340px);
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

export const Results = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
