import { useState, useEffect } from "react";
import Game from "./Game";
import {
  createLobby,
  joinLobby,
  createPlayer,
  fetchJoinedPlayers,
} from "./api";
import { useGame } from "./context/useGame";
import Profile from "./Profile";
import styles from "./App.module.css";

function App({ userId }) {
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
  const [viewingProfile, setViewingProfile] = useState(false);

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

    const data = await createPlayer(playerName, gameId, userId);
    console.log("player data", data);
    setPlayerId(data.id);
  };

  const handleSetupGame = () => {
    performAction("setup_game");
  };

  if (!lobbyStatus)
    return (
      <div>
        <h1 className={styles.title}>GOLF</h1>
        {viewingProfile ? (
          <div>
            <Profile userId={userId} />
            <button
              onClick={() => {
                setViewingProfile(false);
              }}
            >
              Back to menu
            </button>
          </div>
        ) : (
          <div className={styles.home_container}>
            <div className={styles.home_row_1}>
              <button
                onClick={() => {
                  setViewingProfile(true);
                }}
              >
                Profile
              </button>
            </div>
            <div className={styles.home_row_2}>
              <div className={styles.lobby_create_row}>
                <button
                  className={styles.create_lobby_btn}
                  onClick={handleCreateLobby}
                >
                  Create Lobby
                </button>
              </div>
              <div className={styles.lobby_form_row}>
                <form
                  onSubmit={handleJoinLobby}
                  action=""
                  className={styles.join_lobby_form}
                >
                  <label htmlFor="">
                    Lobby Code:{" "}
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
              </div>
            </div>
          </div>
        )}
      </div>
    );

  if (lobbyStatus === "waiting")
    return (
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

export default App;
