import { useState, useEffect } from "react";
import UserBtns from "./UserBtns";
import Game from "./Game";
import { createLobby } from "./api";

function App() {
  const [generatedGameId, setGeneratedGameId] = useState(null);

  const handleCreateLobby = async () => {
    const gameId = await createLobby();
    console.log("create lobby game id:", gameId);
    setGeneratedGameId(gameId);
  };

  return (
    <div style={{ marginLeft: "3rem" }}>
      <UserBtns />

      <button onClick={handleCreateLobby}>Create Lobby</button>
      <br />
      <br />

      {generatedGameId && <Game gameId={generatedGameId} playerId={1} />}
    </div>
  );
}

export default App;
