import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  *:focus {
    outline: none;
  }
`;

export const Header = styled.div`
  display: flex;
  width: 750px;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  background: white;
  & > p,
  h2 {
    margin: 0 8px;
    font-size: 18px;
    font-weight: 600;
  }
`;

export const Video = styled.video`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
`;

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
  font-weight: 700;
  font-size: 18px;
  &:hover {
    background-color: #283593;
  }
  &:disabled {
    cursor: default;
    opacity: 0.8;
  }
`;
