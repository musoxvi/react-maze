import { FC, useState, useEffect } from "react";
import {
  Button,
  RecordButton,
  InputField,
  Label,
  Main,
  Container,
  Image,
  Video,
  Content,
  List,
  ListItem,
  ListItemHeader,
} from "./styles";
import mazeImg from "../../assets/images/maze.jpeg";
import myVideo from "../../assets/videos/space.mov";
import Modal from "../../components/Modal/Modal";
import { db } from "../../service/Firebase";

type Props = {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};
type ListType = {
  id: number;
  playerName: string;
  steps: number;
  date: number;
};

const StartGame: FC<Props> = ({ handleSubmit }) => {
  const [showModal, setShowModal] = useState(false);
  const [scoreList, setScoreList] = useState<ListType[] | []>([]);

  useEffect(() => {
    getScoreList();
  }, []);

  const getScoreList = async () => {
    const docRef = db.collection("scores");
    const collections = await docRef.get();
    const items: any = collections.docs.map((item) => item.data());
    setScoreList(items);
  };

  /**
   * compareSteps
   * @param {ListType} a
   * @param {ListType} b
   * @returns {1 | -1 | 0}
   */
  const compareSteps = (a: ListType, b: ListType) => {
    if (a.steps < b.steps) {
      return -1;
    }
    if (a.steps > b.steps) {
      return 1;
    }
    return 0;
  };

  const BestScoresList = () => (
    <List>
      {!!scoreList?.length && (
        <ListItemHeader>
          <div>Pos</div>
          <div>Name</div>
          <div>Steps</div>
          <div>Date</div>
        </ListItemHeader>
      )}

      {scoreList?.length ? (
        scoreList
          .sort(compareSteps)
          .slice(0, 10)
          .map((item, key) => (
            <ListItem key={key}>
              <div>{key + 1}</div>
              <div>{item.playerName}</div>
              <div>{item.steps}</div>
              <div>{item.date}</div>
            </ListItem>
          ))
      ) : (
        <ListItem>No scores yet 🥺</ListItem>
      )}
    </List>
  );

  return (
    <>
      {showModal && (
        <Modal
          title="Top 10 scores"
          customContent={<BestScoresList />}
          buttonText="Cancel"
          setShowModal={setShowModal}
          onClick={() => setShowModal(false)}
        />
      )}
      <Container>
        <Video autoPlay loop muted className="video">
          <source src={myVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </Video>
        <Content>
          <Image src={mazeImg} alt="maze img" />
          <form onSubmit={handleSubmit}>
            <Main>
              <InputField
                name="playerName"
                type="text"
                autoComplete="off"
                required
              />
              <Label htmlFor="name">Player name</Label>
            </Main>

            <Button value="Start game" type="submit" />
            <RecordButton
              value="View 10 high scores"
              type="button"
              onClick={() => setShowModal(true)}
            />
          </form>
        </Content>
      </Container>
    </>
  );
};

export default StartGame;
