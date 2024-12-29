import { useState, useEffect } from "react";
import { createLobby, joinLobby, fetchJoinedPlayers } from "../../utils/api";
import { useGame } from "../../context/useGame";
import Profile from "../Profile/Profile";
import styles from "./App.module.css";
import Lobby from "./Lobby";

function App({ userId, guest }) {
  const {
    gameId,
    setGameId,
    setJoinedPlayers,
    lobbyStatus,
    setLobbyStatus,
    isLobbyHost,
    setIsLobbyHost,
  } = useGame();

  const [lobbyCode, setLobbyCode] = useState("");
  const [lobbyCodeInput, setLobbyCodeInput] = useState("");
  const [viewingProfile, setViewingProfile] = useState(false);
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

    if (lobbyCodeInput.trim() === "") {
      setError("Lobby code cannot be empty.");
      return;
    }

    setError("");

    const data = await joinLobby(lobbyCodeInput.toLowerCase());
    console.log("lobby data:", data);
    setGameId(data.game_id);
    setLobbyCode(lobbyCodeInput);
    setLobbyStatus("waiting");
  };

  if (viewingProfile) {
    return (
      <Profile
        userId={userId}
        setViewingProfile={() => setViewingProfile(!viewingProfile)}
      />
    );
  }

  if (!lobbyStatus)
    return (
      <div className={styles.home_page_container}>
        <div>
          <h1 className={styles.title}>Golf</h1>
          <div className={styles.home_btns_container}>
            <div className={styles.home_row_1}>
              <button
                onClick={() => {
                  setViewingProfile(true);
                }}
                disabled={guest}
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
                  <div className={styles.join_lobby_form_input_container}>
                    <label className="visually-hidden" htmlFor="">
                      Lobby Code:{" "}
                    </label>
                    <div className={styles.input_container}>
                      <input
                        type="text"
                        value={lobbyCodeInput}
                        onChange={(e) => {
                          setLobbyCodeInput(e.target.value);
                        }}
                      />
                    </div>
                    {error && <p className="error">{error}</p>}
                  </div>
                  <button>Join Lobby</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className={styles.lobby_page_container}>
      <Lobby lobbyCode={lobbyCode} isLobbyHost={isLobbyHost} userId={userId} />
    </div>
  );
}

export default App;
