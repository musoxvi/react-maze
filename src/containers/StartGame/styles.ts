import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  outline: none;
`;

export const Content = styled.div`
  background-color: rgba(200, 200, 250, 0.7);
  width: 100%;
  justify-content: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 38px;
  padding-bottom: 38px;
}
`;

export const Image = styled.img`Info
  height: 300px;
  width: auto;
  margin-bottom: 24px;
`;

export const Video = styled.video`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
`;

export const Main = styled.div`
  position: relative;
`;

export const InputField = styled.input`
  outline: none;
  padding: 16px 22px;
  border: 1px solid #dadce0;
  font-size: 18px;
  border-radius: 5px;
  width: 388px;
  &:focus {
    border: 2px solid royalblue;
  }
  &:focus + label {
    top: -1px;
    padding: 0 3px;
    font-size: 14px;
    color: royalblue;
    transition: 300ms;
  }
`;

export const Label = styled.label`
  display: block;
  color: #363636;
  background: #ffffff;
  position: absolute;
  left: 60px;
  top: -1px;
  pointer-events: none;
  transition: 300ms;
  transform: translate(-50%, -50%);
  padding: 8px;
  border-radius: 4px;
`;

export const Button = styled.input`
  font-weight: 600;
  font-size: 16px;
  width: 100%;
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

export const RecordButton = styled(Button)`
  background-color: rgba(200, 200, 250, 0.8);
  color: #3f51b5;
  box-shadow: 0px 2px 4px #676767;
  &:hover {
    background-color: #283593;
    color: #fff;
    opacity: 0.7;
  }
`;

export const List = styled.ul`
  list-style: none;
  margin: 0px;
  padding: 8px 0px;
  position: relative;
`;

export const ListItem = styled.li`
  display: flex;
  align-items: center;
  position: relative;
  text-decoration: none;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
  padding: 8px 16px;
  & > div {
    width: calc(100% / 4);
  }
`;

export const ListItemHeader = styled(ListItem)`
  font-size: 18px;
  font-weight: 700;
`;
