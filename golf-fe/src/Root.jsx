import { StrictMode, useState } from "react";
import UserBtns from "./UserBtns";
import App from "./App";
import { GameProvider } from "./context/GameProvider";

function Root() {
  const [user, setUser] = useState(null);

  return (
    // <StrictMode>
    <>
      <UserBtns setUser={setUser} />
      <GameProvider>
        <App userId={user?.id} />
      </GameProvider>
    </>
    // </StrictMode>
  );
}

export default Root;
