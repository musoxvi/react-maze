import { FC, FormEvent, useState } from "react";
import { LEVELS, LevelId } from "../../constants/levels";
import { Button } from "../../components/ui/styles";
import HighScores from "./HighScores";
import {
  Wrapper,
  Panel,
  Brand,
  Title,
  Subtitle,
  Form,
  Field,
  FieldLabel,
  Input,
  LevelGrid,
  LevelOption,
  LevelName,
  LevelDescription,
  Pips,
  Actions,
  Hint,
} from "./styles";

type Props = {
  onStart: (playerName: string, levelId: LevelId) => void;
  defaultName?: string;
  defaultLevel?: LevelId;
};

const StartGame: FC<Props> = ({ onStart, defaultName = "", defaultLevel = "easy" }) => {
  const [name, setName] = useState(defaultName);
  const [levelId, setLevelId] = useState<LevelId>(defaultLevel);
  const [showScores, setShowScores] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const playerName = name.trim();
    if (playerName) onStart(playerName, levelId);
  };

  return (
    <Wrapper>
      {showScores && (
        <HighScores initialLevel={levelId} onClose={() => setShowScores(false)} />
      )}

      <Panel>
        <Brand>
          <Title>Maze</Title>
          <Subtitle>Find the door in as few moves as you can.</Subtitle>
        </Brand>

        <Form onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="playerName">Player name</FieldLabel>
            <Input
              id="playerName"
              name="playerName"
              type="text"
              autoComplete="nickname"
              maxLength={20}
              placeholder="e.g. Ada"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </Field>

          <Field as="fieldset">
            <FieldLabel as="legend">Difficulty</FieldLabel>
            <LevelGrid>
              {LEVELS.map((level, index) => (
                <LevelOption key={level.id} $selected={level.id === levelId}>
                  <input
                    type="radio"
                    name="level"
                    value={level.id}
                    checked={level.id === levelId}
                    onChange={() => setLevelId(level.id)}
                  />
                  <Pips aria-hidden="true">
                    {LEVELS.map((_, pip) => (
                      <span key={pip} data-on={pip <= index} />
                    ))}
                  </Pips>
                  <LevelName>{level.name}</LevelName>
                  <LevelDescription>{level.description}</LevelDescription>
                </LevelOption>
              ))}
            </LevelGrid>
          </Field>

          <Actions>
            <Button type="submit" disabled={!name.trim()}>
              Start game
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowScores(true)}>
              High scores
            </Button>
          </Actions>
        </Form>

        <Hint>
          Move with <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> or{" "}
          <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>
        </Hint>
      </Panel>
    </Wrapper>
  );
};

export default StartGame;
