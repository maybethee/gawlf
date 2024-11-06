import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UserBtns from "./UserBtns";
import App from "./App";
import { GameProvider } from "./context/GameProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <UserBtns />
      <GameProvider>
        <App />
      </GameProvider>
    </>
  </StrictMode>
);
