import { FC, FormEvent, useMemo, useState } from "react";
import { LEVELS, LevelId, View, VIEW_LABEL } from "../../constants/levels";
import { Button } from "../../components/ui/styles";
import { finalScore, getCompletedLevels, getPersonalBest } from "../../service/records";
import HighScores from "./HighScores";
import Shop from "./Shop";
import useWallet from "../../hooks/useWallet";
import { levelFromXp, xpForLevel } from "../../service/wallet";
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
  LevelGroup,
  GroupTitle,
  LevelGrid,
  LevelOption,
  LevelName,
  LevelDescription,
  LevelMeta,
  Pips,
  Actions,
  Hint,
  WalletBar,
} from "./styles";

type Props = {
  onStart: (playerName: string, levelId: LevelId) => void;
  defaultName?: string;
  defaultLevel?: LevelId;
};

const VIEWS: { view: View; title: string }[] = (["2d", "3d", "fp"] as View[]).map((view) => ({
  view,
  title: VIEW_LABEL[view],
}));

const StartGame: FC<Props> = ({ onStart, defaultName = "", defaultLevel = "easy" }) => {
  const [name, setName] = useState(defaultName);
  const [levelId, setLevelId] = useState<LevelId>(
    LEVELS.some((level) => level.id === defaultLevel) ? defaultLevel : "easy"
  );
  const [showScores, setShowScores] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const wallet = useWallet();
  const playerLevel = levelFromXp(wallet.xp);
  const levelStart = xpForLevel(playerLevel);
  const progress = (wallet.xp - levelStart) / (xpForLevel(playerLevel + 1) - levelStart);

  // Read once per visit to the menu
  const completed = useMemo(getCompletedLevels, []);
  const bests = useMemo(
    () => Object.fromEntries(LEVELS.map((level) => [level.id, getPersonalBest(level.id)])),
    []
  );

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
      {showShop && <Shop onClose={() => setShowShop(false)} />}

      <Panel>
        <Brand>
          <Title>Maze</Title>
          <Subtitle>Find the door in as few moves as you can.</Subtitle>
        </Brand>

        <WalletBar>
          <span className="level" title={`${wallet.xp} XP`}>
            ⭐ Level {playerLevel}
            <span className="xp" aria-hidden="true">
              <span style={{ width: `${Math.round(progress * 100)}%` }} />
            </span>
          </span>
          <span className="coins">{wallet.coins} 🪙</span>
          <button type="button" onClick={() => setShowShop(true)}>
            🛒 Shop
          </button>
        </WalletBar>

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
            <FieldLabel as="legend">Level</FieldLabel>
            {VIEWS.map(({ view, title }) => {
              const levels = LEVELS.filter((level) => level.view === view);
              return (
                <LevelGroup key={view}>
                  <GroupTitle>{title}</GroupTitle>
                  <LevelGrid>
                    {levels.map((level, index) => {
                      const best = bests[level.id];
                      return (
                        <LevelOption key={level.id} $selected={level.id === levelId}>
                          <input
                            type="radio"
                            name="level"
                            value={level.id}
                            aria-label={`${title} ${level.name}`}
                            checked={level.id === levelId}
                            onChange={() => setLevelId(level.id)}
                          />
                          <Pips aria-hidden="true">
                            {levels.map((_, pip) => (
                              <span key={pip} data-on={pip <= index} />
                            ))}
                          </Pips>
                          <LevelName>
                            {level.name}
                            {completed.includes(level.id) && (
                              <span className="done" aria-label="completed"> ✓</span>
                            )}
                          </LevelName>
                          <LevelDescription>{level.description}</LevelDescription>
                          {best && (
                            <LevelMeta>
                              Best: {finalScore(best) ?? "—"} pts
                            </LevelMeta>
                          )}
                        </LevelOption>
                      );
                    })}
                  </LevelGrid>
                </LevelGroup>
              );
            })}
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
