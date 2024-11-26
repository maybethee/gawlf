import { useState, useEffect } from "react";
import Game from "./Game";
import { createPlayer, fetchJoinedPlayers } from "./api";
import { useGame } from "./context/useGame";
import styles from "./Lobby.module.css";

function Lobby({ lobbyCode, isLobbyHost, userId }) {
  const {
    gameId,
    joinedPlayers,
    setJoinedPlayers,
    lobbyStatus,
    performAction,
  } = useGame();

  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    if (!gameId) {
      return;
    }
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

  const handleCreatePlayer = async (e) => {
    e.preventDefault();

    const data = await createPlayer(playerName, gameId, userId);
    console.log("player data", data);
    setPlayerId(data.id);
  };

  const handleSetupGame = () => {
    performAction("setup_game");
  };

  if (lobbyStatus !== "active")
    return (
      <div className={styles.lobby_container}>
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
        <br />
        <br />
        <h3>Players in Game:</h3>
        {joinedPlayers.length ? (
          <ul>
            {joinedPlayers.map((player) => {
              return <li key={player.name}>{player.name}</li>;
            })}
          </ul>
        ) : (
          <p>Waiting for players...</p>
        )}
        <br />
        <br />

        {joinedPlayers.length > 0 ? (
          <div>
            {isLobbyHost ? (
              <button onClick={handleSetupGame}>Play Game</button>
            ) : (
              <p>Waiting for host to start game</p>
            )}
          </div>
        ) : (
          <div>
            <p>minimum of 2 players required to play</p>
          </div>
        )}
      </div>
    );

  return (
    <div style={{ marginLeft: "3rem" }}>
      <Game gameId={gameId} playerId={playerId} isLobbyHost={isLobbyHost} />
    </div>
  );
}

export default Lobby;
