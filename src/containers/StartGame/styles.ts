import styled from "styled-components";
import { Card } from "../../components/ui/styles";

export const Wrapper = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
`;

export const Panel = styled(Card)`
  width: min(760px, 100%);
  padding: 36px 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 28px;

  @media (max-width: 480px) {
    padding: 28px 20px 20px;
  }
`;

export const Brand = styled.header`
  text-align: center;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(48px, 12vw, 72px);
  line-height: 1;
  letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--accent) 0%, var(--violet) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

export const Subtitle = styled.p`
  margin: 10px 0 0;
  color: var(--text-muted);
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
`;

export const FieldLabel = styled.label`
  padding: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
`;

export const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  font-size: 17px;
  transition: border-color 160ms ease, background-color 160ms ease;

  &::placeholder {
    color: rgba(169, 164, 212, 0.6);
  }
  &:focus {
    outline: none;
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.09);
  }
`;

export const LevelGroup = styled.div`
  /* legends ignore the fieldset's flex gap */
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  & + & {
    margin-top: 14px;
  }
`;

export const GroupTitle = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent);
`;

export const LevelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 460px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const LevelOption = styled.label<{ $selected: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid
    ${({ $selected }) => ($selected ? "var(--accent)" : "var(--border)")};
  background: ${({ $selected }) =>
    $selected ? "rgba(94, 234, 212, 0.1)" : "rgba(255, 255, 255, 0.03)"};
  transition: border-color 160ms ease, background-color 160ms ease;

  &:hover {
    border-color: ${({ $selected }) =>
      $selected ? "var(--accent)" : "rgba(255, 255, 255, 0.28)"};
  }

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  &:focus-within {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const Pips = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 6px;

  span {
    width: 14px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.15);
  }
  span[data-on="true"] {
    background: var(--accent);
  }
`;

export const LevelName = styled.span`
  font-weight: 700;

  .done {
    color: var(--accent);
  }
`;

export const LevelMeta = styled.span`
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
`;

export const LevelDescription = styled.span`
  font-size: 13px;
  color: var(--text-muted);
`;

export const Actions = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 10px;

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

export const Hint = styled.p`
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);

  kbd {
    display: inline-block;
    min-width: 22px;
    padding: 1px 5px;
    border-radius: 4px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.06);
    font-family: inherit;
    font-size: 12px;
    color: var(--text);
  }
`;

export const WalletBar = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  margin-top: -12px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.04);
  font-weight: 700;

  .level {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
  }
  .xp {
    flex: 1;
    max-width: 160px;
    height: 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }
  .xp span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--violet));
  }
  .coins {
    color: #fcd34d;
    font-variant-numeric: tabular-nums;
  }
  button {
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid rgba(252, 211, 77, 0.5);
    background: rgba(252, 211, 77, 0.1);
    color: #fcd34d;
    font-weight: 700;
    cursor: pointer;
  }
  button:hover {
    background: rgba(252, 211, 77, 0.2);
  }
`;

export const ShopList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ShopItem = styled.li`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.04);

  .icon {
    font-size: 28px;
  }
  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 13px;
  }
  .info strong {
    font-size: 16px;
    color: var(--text);
  }
  kbd {
    font-family: inherit;
    font-size: 11px;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0 4px;
    color: var(--text-muted);
  }
  .owned {
    color: var(--accent);
    font-weight: 700;
  }
  button {
    flex-shrink: 0;
    min-width: 88px;
  }
  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export const Tabs = styled.div`
  display: flex;
  gap: 6px;
  padding: 4px;
  margin-bottom: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
`;

export const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  color: ${({ $active }) => ($active ? "var(--accent-ink)" : "var(--text-muted)")};
  background: ${({ $active }) => ($active ? "var(--accent)" : "transparent")};
  transition: background-color 160ms ease, color 160ms ease;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  color: var(--text);

  th {
    text-align: left;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 8px 8px;
  }
  td {
    padding: 10px 8px;
    border-top: 1px solid var(--border);
  }
  td:first-child {
    font-weight: 700;
    color: var(--accent);
  }
  td:nth-child(2) {
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  td:last-child {
    color: var(--text-muted);
    font-size: 13px;
  }
`;

export const Empty = styled.p`
  margin: 24px 0;
  text-align: center;
`;
