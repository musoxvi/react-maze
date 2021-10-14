import styled from "styled-components";

export const Button = styled.button`
  background-color: #3f51b5;
  color: white;
  padding: 16px 24px;
  border-radius: 5px;
  outline: 0;
  text-transform: uppercase;
  margin: 10px 0px;
  cursor: pointer;
  box-shadow: 0px 2px 2px lightgray;
  transition: ease background-color 250ms;
  &:hover {
    background-color: #283593;
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

export const ModalStyles = styled.div`
  display: flex;
  justify-content: center;
  min-height: 100vh;
  align-items: center;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 990;
  .modal {
    display: flex;
    width: 50%;
    min-height: 200px;
    height: auto;
    background: white;
    border-radius: 8px;
    padding: 24px;
    position: relative;
    flex-direction: column;
    justify-content: space-between;
    &__wrapper-button {
      display: flex;
      justify-content: end;
    }
  }
  .close-button {
    cursor: pointer;
    width: 32px;
    height: 32px;
    position: absolute;
    right: 32px;
    top: 42px;
  }
  #up {
    border: 2px solid black;
    transform: rotate(-45deg);
    position: relative;
    top: 14px;
    right: 6px;
    width: 20px;
    background-color: black;
    border-radius: 25px;
  }
  #down {
    border: 2px solid black;
    transform: rotate(45deg);
    position: relative;
    top: 10px;
    right: 6px;
    width: 20px;
    background-color: black;
    border-radius: 25px;
  }
`;
