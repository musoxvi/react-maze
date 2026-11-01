import styled, { keyframes } from "styled-components";
import { Card } from "../ui/styles";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const popIn = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to { opacity: 1; transform: none; }
`;

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 990;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(5, 4, 18, 0.65);
  animation: ${fadeIn} 160ms ease;
`;

export const Dialog = styled(Card)`
  width: min(560px, 100%);
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  background: var(--surface-strong);
  animation: ${popIn} 200ms ease;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px 0;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 22px;
`;

export const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  &:hover {
    color: var(--text);
    background: rgba(255, 255, 255, 0.08);
  }
`;

export const Body = styled.div`
  padding: 16px 24px;
  overflow-y: auto;
  color: var(--text-muted);
  line-height: 1.5;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;
  flex-wrap: wrap;
`;
