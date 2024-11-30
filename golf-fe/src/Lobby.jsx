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
      <div className={styles.lobby_content_container}>
        <div className={styles.top_row}>
          <h2>Room Code: {lobbyCode.toUpperCase()}</h2>
          <p className={styles.faded_p}>
            Share this code to let others join this game
          </p>

          {!playerId && (
            <form
              className={styles.join_game_form}
              onSubmit={handleCreatePlayer}
              action=""
            >
              <label className="visually-hidden" htmlFor="">
                Enter Name:
              </label>
              <div className={styles.input_container}>
                <input
                  className={styles.join_game_input}
                  type="text"
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value);
                  }}
                />
              </div>
              <button>Join Game</button>
            </form>
          )}
        </div>

        <div className={styles.bottom_row}>
          <h3>Players</h3>
          {joinedPlayers.length ? (
            <ul>
              {joinedPlayers.map((player) => {
                return <li key={player.name}>⛳ {player.name}</li>;
              })}
              <li>⛳</li>
            </ul>
          ) : (
            <p className={`${styles.faded_p} ${styles.no_players_p}`}>
              Waiting for players...
            </p>
          )}

          {joinedPlayers.length > 0 ? (
            <div>
              {isLobbyHost ? (
                <button className={styles.play_btn} onClick={handleSetupGame}>
                  Play Game
                </button>
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
      </div>
    );

  return (
    <div style={{ marginLeft: "3rem", height: "100%" }}>
      <Game gameId={gameId} playerId={playerId} isLobbyHost={isLobbyHost} />
    </div>
  );
}

export default Lobby;
