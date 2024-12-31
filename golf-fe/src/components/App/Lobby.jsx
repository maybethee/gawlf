import { useState, useEffect } from "react";
import Game from "../Game/Game";
import { createPlayer, fetchJoinedPlayers } from "../../utils/api";
import { useGame } from "../../context/useGame";
import styles from "./Lobby.module.css";
import { ChevronLeft } from "lucide-react";

function Lobby({ lobbyCode, isLobbyHost, userId }) {
  const {
    gameId,
    joinedPlayers,
    setJoinedPlayers,
    lobbyStatus,
    setLobbyStatus,
    performAction,
  } = useGame();

  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState(null);
  const [error, setError] = useState("");

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

    if (playerName.trim().length < 1 || playerName.trim().length > 10) {
      setError("Name must be between 1 and 10 characters.");
      return;
    }

    setError("");

    const data = await createPlayer(playerName, gameId, userId);
    console.log("player data", data);
    setPlayerId(data.id);
  };

  const isJoined = joinedPlayers?.find((player) => player.user_id === userId);

  const handleSetupGame = () => {
    performAction("setup_game");
  };

  if (lobbyStatus !== "active")
    return (
      <div className={styles.lobby_content_container}>
        <div
          onClick={() => setLobbyStatus(!lobbyStatus)}
          className={styles.back_btn}
        >
          <ChevronLeft />
        </div>
        <div className={styles.top_row}>
          <div className={styles.room_code_container}>
            <h2>Room Code: </h2>
            <h2>{lobbyCode.toUpperCase()}</h2>
          </div>
          <p className={styles.faded_p}>
            Share this code to let others join this game
          </p>

          {!playerId && !isJoined && (
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
                {error && <p className="error">{error}</p>}
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

          {joinedPlayers.length > 1 ? (
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
    <div className={styles.game_page_container}>
      <Game gameId={gameId} playerId={playerId} isLobbyHost={isLobbyHost} />
    </div>
  );
}

export default Lobby;
