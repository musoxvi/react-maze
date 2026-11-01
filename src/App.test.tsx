import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the start screen", () => {
  render(<App />);
  expect(screen.getByText(/player name/i)).toBeInTheDocument();
});
