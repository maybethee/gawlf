import { useState, useEffect } from "react";
import Game from "../Game/Game";
import { createPlayer, fetchJoinedPlayers } from "../../utils/api";
import { useGame } from "../../context/useGame";
import styles from "./Lobby.module.css";
import { ChevronLeft } from "lucide-react";
import { debounce } from "lodash";

function Lobby({
  lobbyCode,
  isLobbyHost,
  userId,
  playerId,
  setPlayerId,
  userConfig,
}) {
  const {
    gameId,
    joinedPlayers,
    setJoinedPlayers,
    lobbyStatus,
    setLobbyStatus,
    performAction,
  } = useGame();

  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    console.log("Lobby component, user id:", userId);
  }, []);

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

    if (playerName.trim().length < 1 || playerName.trim().length > 15) {
      setError("Name must be between 1 and 15 characters.");
      return;
    }

    setError("");

    const data = await createPlayer(playerName, gameId, userId);
    console.log("player data", data);
    setPlayerId(data.id);
  };

  let isJoined = joinedPlayers?.find((player) => player.user_id === userId);

  const handleSetupGame = () => {
    performAction("play_audio", { audio_clip: "/assets/shuffle.mp3" });

    setTimeout(() => {
      performAction("setup_game");
    }, 300);
  };

  const debouncedHandleSetupGame = debounce(handleSetupGame, 3000, {
    leading: true,
    trailing: false,
  });

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  if (lobbyStatus !== "active")
    return (
      <div className={styles.lobby_content_container}>
        <div
          onClick={() => {
            setLobbyStatus(!lobbyStatus);
            isJoined = false;
          }}
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

          {console.log()}

          {!isJoined && (
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
                <button
                  className={styles.play_btn}
                  onClick={debouncedHandleSetupGame}
                >
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
      <Game
        gameId={gameId}
        playerId={playerId}
        isLobbyHost={isLobbyHost}
        userId={userId}
        userConfig={userConfig}
      />
    </div>
  );
}

export default Lobby;
