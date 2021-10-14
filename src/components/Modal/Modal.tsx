import { ModalStyles, Button } from "./styles";

type Props = {
  title?: string;
  content?: string;
  customContent?: JSX.Element;
  buttonText: string;
  setShowModal: (callBack: (prev: boolean) => boolean) => void;
  onClick: () => void;
};

const Modal: React.FC<Props> = ({
  setShowModal,
  title = "title",
  content = "content",
  buttonText = "buttonText",
  customContent,
  onClick,
}) => {
  const CloseButton = () => (
    <div
      onClick={() => setShowModal((prev: boolean) => !prev)}
      className="close-button"
    >
      <div id="up" />
      <div id="down" />
    </div>
  );

  return (
    <ModalStyles>
      <div className="modal">
        <div>
          <CloseButton />
          <h2>{title}</h2>
          {customContent ? customContent : <p>{content}</p>}
        </div>
        <div className="modal__wrapper-button">
          <Button type="button" onClick={onClick}>
            {buttonText}
          </Button>
        </div>
      </div>
    </ModalStyles>
  );
};

export default Modal;
