import styled from "styled-components";

export const StageWrap = styled.div`
  position: relative;
`;

export const MinimapCanvas = styled.canvas`
  position: absolute;
  top: 12px;
  right: 12px;
  border-radius: 4px;
  background: rgba(5, 4, 15, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
  pointer-events: none;

  @media (max-width: 640px) {
    width: 112px !important;
    height: 112px !important;
  }
`;

export const Stage = styled.div`
  position: relative;
  width: min(94vw, 1100px);
  height: calc(100dvh - var(--chrome, 180px));
  min-height: 280px;
  border-radius: 4px;
  overflow: hidden;
  background: radial-gradient(ellipse at center, rgba(20, 16, 56, 0.35), rgba(5, 4, 15, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15);

  canvas {
    display: block;
  }
`;
