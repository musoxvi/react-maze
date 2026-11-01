import { FC, useEffect, useState } from "react";
import Modal from "../../components/Modal/Modal";
import { LEVELS, LevelId } from "../../constants/levels";
import { formatTime, getScores, Score } from "../../service/utils";
import { Tabs, Tab, Table, Empty } from "./styles";

type Props = {
  initialLevel: LevelId;
  onClose: () => void;
};

const HighScores: FC<Props> = ({ initialLevel, onClose }) => {
  const [scores, setScores] = useState<Score[] | null>(null);
  const [levelId, setLevelId] = useState<LevelId>(initialLevel);

  useEffect(() => {
    getScores().then(setScores);
  }, []);

  const top = (scores ?? [])
    .filter((score) => (score.level ?? "easy") === levelId)
    .sort((a, b) => a.steps - b.steps || (a.timeMs ?? Infinity) - (b.timeMs ?? Infinity))
    .slice(0, 10);

  return (
    <Modal title="Top 10 scores" onClose={onClose}>
      <Tabs role="tablist">
        {LEVELS.map((level) => (
          <Tab
            key={level.id}
            type="button"
            role="tab"
            aria-selected={level.id === levelId}
            $active={level.id === levelId}
            onClick={() => setLevelId(level.id)}
          >
            {level.name}
          </Tab>
        ))}
      </Tabs>

      {scores === null ? (
        <Empty>Loading…</Empty>
      ) : top.length === 0 ? (
        <Empty>No scores yet. Be the first!</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Moves</th>
              <th>Time</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {top.map((score, index) => (
              <tr key={`${score.id}-${index}`}>
                <td>{index + 1}</td>
                <td>{score.playerName}</td>
                <td>{score.steps}</td>
                <td>{score.timeMs != null ? formatTime(score.timeMs) : "—"}</td>
                <td>{score.date}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Modal>
  );
};

export default HighScores;
