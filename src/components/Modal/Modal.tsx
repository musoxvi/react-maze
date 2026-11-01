import { FC, ReactNode, useEffect } from "react";
import { Backdrop, Dialog, Header, Title, CloseButton, Body, Actions } from "./styles";

type Props = {
  title: string;
  onClose: () => void;
  actions?: ReactNode;
};

const Modal: FC<Props> = ({ title, onClose, actions, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Backdrop onClick={onClose}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <Title>{title}</Title>
          <CloseButton type="button" aria-label="Close" onClick={onClose}>
            ×
          </CloseButton>
        </Header>
        <Body>{children}</Body>
        {actions && <Actions>{actions}</Actions>}
      </Dialog>
    </Backdrop>
  );
};

export default Modal;
