import { useState, useEffect } from "react";
import Game from "./Game";
import {
  createLobby,
  joinLobby,
  createPlayer,
  fetchJoinedPlayers,
} from "./api";
import { useGame } from "./context/useGame";

function App() {
  const {
    gameId,
    setGameId,
    joinedPlayers,
    setJoinedPlayers,
    lobbyStatus,
    setLobbyStatus,
    performAction,
  } = useGame();

  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState(null);
  const [lobbyCode, setLobbyCode] = useState("");
  const [lobbyCodeInput, setLobbyCodeInput] = useState("");
  const [isLobbyHost, setIsLobbyHost] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await fetchJoinedPlayers(gameId);
        console.log("players list:", data);
        setJoinedPlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
  }, [gameId]);

  const handleCreateLobby = async () => {
    const data = await createLobby();
    console.log("create lobby game id:", data.game_id);

    setGameId(data.game_id);
    setLobbyCode(data.lobby_code);
    setLobbyStatus("waiting");
    setIsLobbyHost(true);
  };

  const handleJoinLobby = async (e) => {
    e.preventDefault();

    const data = await joinLobby(lobbyCodeInput);
    console.log("lobby data:", data);
    setGameId(data.game_id);
    setLobbyCode(lobbyCodeInput);
    setLobbyStatus("waiting");
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();

    const data = await createPlayer(playerName, gameId);
    console.log("player data", data);
    setPlayerId(data.id);
  };

  const handleSetupGame = () => {
    performAction("setup_game");
    performAction("setup_hole");
  };

  if (lobbyStatus !== "active")
    return (
      <div>
        {!gameId ? (
          <div>
            <button onClick={handleCreateLobby}>Create Lobby</button>
            <form onSubmit={handleJoinLobby} action="">
              <label htmlFor="">
                Lobby Code:
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
          </div>
        ) : (
          <div>
            <h2>{lobbyCode}</h2>
            <p>Share this code to let others join this game</p>

            {!playerId && (
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
            )}
          </div>
        )}

        {joinedPlayers.length ? (
          <div>
            <h3>Players in Game:</h3>
            <ul>
              {joinedPlayers.map((player) => {
                return <li key={player.name}>{player.name}</li>;
              })}
            </ul>
          </div>
        ) : null}

        {isLobbyHost ? (
          <button onClick={handleSetupGame}>Play Game</button>
        ) : (
          <p>Waiting for host to start game</p>
        )}
      </div>
    );

  return (
    <div style={{ marginLeft: "3rem" }}>
      <Game gameId={gameId} playerId={playerId} />
    </div>
  );
}

export default App;
