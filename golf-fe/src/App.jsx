import { useState, useEffect, useRef } from "react";
// import UserBtns from "./UserBtns";
import Game from "./Game";
import {
  createLobby,
  joinLobby,
  lobbyStatus,
  createPlayer,
  fetchJoinedPlayers,
} from "./api";
import cable from "./cable";

function App() {
  const [gameId, setGameId] = useState(null);

  const [joinedPlayers, setJoinedPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState(null);
  const [lobbyCode, setLobbyCode] = useState("");
  const [lobbyStatus, setLobbyStatus] = useState("");
  const [lobbyCodeInput, setLobbyCodeInput] = useState("");

  const subscriptionRef = useRef(null);

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

    subscriptionRef.current = cable.subscriptions.create(
      { channel: "GameChannel", game_id: gameId },
      {
        connected() {
          console.log("Connected to GameChannel for game ID:", gameId);
        },
        received(data) {
          console.log("Received data:", data);
          if (data.action === "player_joined") {
            console.log(data.player);
            setJoinedPlayers((prevPlayers) => [...prevPlayers, data.player]);
          } else if (data.action === "hole_setup") {
            setLobbyStatus("active");
          }
        },
        disconnected() {
          console.log("Disconnected from GameChannel for game ID:", gameId);
        },
        rejected() {
          console.log("Subscription rejected for game ID:", gameId);
        },
      }
    );
    console.log("Subscription created in Lobby:", subscriptionRef.current);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        console.log("Unsubscribed from GameChannel for game ID:", gameId);
      }
    };
  }, [gameId]);

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
    setLobbyStatus("waiting");
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();

    const data = await createPlayer(playerName, gameId);
    console.log("player data", data);
    setPlayerId(data.id);
  };

  const handleSetupHole = () => {
    subscriptionRef.current.perform("setup_hole");
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

        <button onClick={handleSetupHole}>Hole Start</button>
      </div>
    );

  return (
    <div style={{ marginLeft: "3rem" }}>
      {/* <UserBtns /> */}

      <Game gameId={gameId} playerId={playerId} />
    </div>
  );
}

export default App;
