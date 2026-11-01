import styled, { css } from "styled-components";

export const Card = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
`;

type ButtonProps = { variant?: "primary" | "ghost" };

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 22px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 120ms ease, background-color 160ms ease,
    border-color 160ms ease, box-shadow 160ms ease;

  &:active {
    transform: translateY(1px);
  }

  ${({ variant = "primary" }) =>
    variant === "primary"
      ? css`
          background: var(--accent);
          color: var(--accent-ink);
          box-shadow: 0 0 24px rgba(94, 234, 212, 0.35);
          &:hover {
            background: var(--accent-strong);
            box-shadow: 0 0 32px rgba(94, 234, 212, 0.5);
          }
        `
      : css`
          background: rgba(255, 255, 255, 0.04);
          color: var(--text);
          border-color: var(--border);
          &:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.24);
          }
        `}
`;

export const Video = styled.video`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
  filter: saturate(1.1) brightness(0.7);
`;

/** Darkens the video so text on top stays readable */
export const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  background: radial-gradient(
    ellipse at center,
    rgba(11, 9, 32, 0.25) 0%,
    rgba(11, 9, 32, 0.75) 100%
  );
`;
