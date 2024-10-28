import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Game from "./Game.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Game gameId={2} playerId={1} />
  </StrictMode>
);
