import { useState, useEffect } from "react";
import UserBtns from "./UserBtns";
import Game from "./Game";
import { createLobby, joinLobby, lobbyStatus, createPlayer } from "./api";

function App() {
  const [gameId, setGameId] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState(null);
  const [lobbyCode, setLobbyCode] = useState("");
  const [lobbyStatus, setLobbyStatus] = useState("");
  const [lobbyCodeInput, setLobbyCodeInput] = useState("");

  const handleCreateLobby = async () => {
    const data = await createLobby();
    const generatedGameId = data.game_id;
    const createdLobbyCode = data.lobby_code;
    console.log("create lobby game id:", generatedGameId);
    setGameId(generatedGameId);
    setLobbyCode(createdLobbyCode);
    setLobbyStatus("waiting");
  };

  const handleJoinLobby = async (e) => {
    e.preventDefault();

    const data = await joinLobby(lobbyCodeInput);
    console.log("lobby data:", data);
    setGameId(data.game_id);
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();

    const data = await createPlayer(playerName, gameId);
    console.log("player data", data);
    setPlayerId(data.id);
  };

  return (
    <div style={{ marginLeft: "3rem" }}>
      <UserBtns />

      <button onClick={handleCreateLobby}>Create Lobby</button>
      <form onSubmit={handleJoinLobby} action="">
        <label htmlFor="">
          Room Code:
          <input
            type="text"
            value={lobbyCodeInput}
            onChange={(e) => {
              setLobbyCodeInput(e.target.value);
            }}
          />
        </label>
        <button>Join Lobby</button>
      </form>
      <br />
      <br />

      <form onSubmit={handleCreatePlayer} action="">
        <label htmlFor="">
          Enter Name:
          <input
            type="text"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
            }}
          />
        </label>
        <button>Join Game</button>
      </form>

      {lobbyCode && (
        <div>
          <h2>{lobbyCode}</h2>
          <p>Share this code to let others join this game</p>
        </div>
      )}

      {gameId && <Game gameId={gameId} playerId={playerId} />}
    </div>
  );
}

export default App;
