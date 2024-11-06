import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UserBtns from "./UserBtns";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <UserBtns />
      <App />
    </>
  </StrictMode>
);
