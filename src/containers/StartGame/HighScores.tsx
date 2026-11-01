import { FC, useEffect, useState } from "react";
import Modal from "../../components/Modal/Modal";
import { getLevel, LEVELS, LevelId, View, VIEW_LABEL } from "../../constants/levels";
import useOnline from "../../hooks/useOnline";
import { compareScores, finalScore, getLocalScores } from "../../service/records";
import { formatTime, getScores, Score } from "../../service/utils";
import { Tabs, Tab, Table, Empty } from "./styles";

type Props = {
  initialLevel: LevelId;
  onClose: () => void;
};

type Source = "local" | "global";

const HighScores: FC<Props> = ({ initialLevel, onClose }) => {
  const online = useOnline();
  const [source, setSource] = useState<Source>(online ? "global" : "local");
  const [view, setView] = useState<View>(getLevel(initialLevel).view);
  const [levelId, setLevelId] = useState<LevelId>(initialLevel);
  const [globalScores, setGlobalScores] = useState<Score[] | null>(null);

  useEffect(() => {
    if (source === "global" && online) getScores().then(setGlobalScores);
  }, [source, online]);

  const level = getLevel(levelId);
  const scores = source === "local" ? getLocalScores() : globalScores;

  const top = (scores ?? [])
    .filter((score) => (score.level ?? "easy") === levelId)
    // Scores need the maze's shortest path to be comparable
    .filter((score) => finalScore(score) !== null)
    .sort(compareScores)
    .slice(0, 10);

  const switchView = (next: View) => {
    setView(next);
    const sameName = LEVELS.find((l) => l.view === next && l.name === level.name);
    setLevelId((sameName ?? LEVELS.find((l) => l.view === next)!).id);
  };

  return (
    <Modal title="Top 10 scores" onClose={onClose}>
      <Tabs role="tablist" aria-label="Source">
        <Tab type="button" role="tab" aria-selected={source === "local"} $active={source === "local"} onClick={() => setSource("local")}>
          My records
        </Tab>
        <Tab type="button" role="tab" aria-selected={source === "global"} $active={source === "global"} onClick={() => setSource("global")}>
          Global
        </Tab>
      </Tabs>

      <Tabs role="tablist" aria-label="View">
        {(["2d", "3d", "fp"] as View[]).map((option) => (
          <Tab key={option} type="button" role="tab" aria-selected={view === option} $active={view === option} onClick={() => switchView(option)}>
            {VIEW_LABEL[option]}
          </Tab>
        ))}
      </Tabs>

      <Tabs role="tablist" aria-label="Level">
        {LEVELS.filter((l) => l.view === view).map((l) => (
          <Tab key={l.id} type="button" role="tab" aria-selected={l.id === levelId} $active={l.id === levelId} onClick={() => setLevelId(l.id)}>
            {l.name}
          </Tab>
        ))}
      </Tabs>

      {source === "global" && !online ? (
        <Empty>You are offline. Your own records are under “My records”.</Empty>
      ) : scores === null ? (
        <Empty>Loading…</Empty>
      ) : top.length === 0 ? (
        <Empty>No scores yet. Be the first!</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Score</th>
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
                <td>{finalScore(score)}</td>
                <td>{score.steps}</td>
                <td>{score.timeMs != null ? formatTime(score.timeMs) : "—"}</td>
                <td>{score.date}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Empty as="p" style={{ margin: "12px 0 0", fontSize: 13 }}>
        Score = 1000 + bonus points − 10 per move over the shortest path.
      </Empty>
    </Modal>
  );
};

export default HighScores;
