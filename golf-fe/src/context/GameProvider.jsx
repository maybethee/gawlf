import { useState, useEffect, useRef } from "react";
import { GameContext } from "./GameContext";
import cable from "../cable";

export const GameProvider = ({ children }) => {
  const [gameId, setGameId] = useState(null);
  const [joinedPlayers, setJoinedPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [currentPlayerName, setCurrentPlayerName] = useState("");
  const [drawnCard, setDrawnCard] = useState(null);
  const [discardPile, setDiscardPile] = useState([]);
  const [playerHands, setPlayerHands] = useState([]);
  const [lobbyStatus, setLobbyStatus] = useState("");
  const [initializingGame, setInitializingGame] = useState(true);
  const [selectedCards, setSelectedCards] = useState([]);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // Only subscribe if gameId is not null
    if (gameId) {
      subscriptionRef.current = cable.subscriptions.create(
        { channel: "GameChannel", game_id: gameId },
        {
          connected() {
            console.log("Connected to GameChannel with game ID:", gameId);
          },
          received(data) {
            console.log("Data received:", data);
            handleReceivedData(data);
          },
          disconnected() {
            console.log("Disconnected from GameChannel for game ID:", gameId);
          },
          rejected() {
            console.log("Subscription was rejected for game ID:", gameId);
          },
        }
      );

      return () => {
        if (subscriptionRef.current) {
          console.log("Unsubscribed from GameChannel for game ID:", gameId);
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
      };
    }
  }, [gameId]);

  const handleReceivedData = (data) => {
    console.log("Received data:", data);

    if (data.action === "player_joined") {
      console.log(data.player);

      setJoinedPlayers((prevPlayers) => [...prevPlayers, data.player]);
      //
    } else if (data.action === "card_drawn") {
      setDrawnCard(data.card);
      setGameState(data.game_state);
      //
    } else if (data.action === "card_discarded") {
      setDiscardPile(data.game_state.discard_pile);
      setCurrentPlayerId(data.current_player_id);
      setCurrentPlayerName(data.current_player_name);
      setGameState(data.game_state);
      //
    } else if (data.action === "hole_setup") {
      console.log("received action in Game.jsx");
      const hands = [];

      data.players.forEach((player) => {
        hands.push({ id: player.id, name: player.name, hand: player.hand });
      });

      setPlayerHands(hands);
      setCurrentPlayerId(data.current_player_id);
      setCurrentPlayerName(data.current_player_name);
      setGameState(data.gameState);
      setLobbyStatus("active");
      //
    } else if (data.action === "card_swapped") {
      console.log(data.current_player_id);

      setCurrentPlayerId(data.current_player_id);
      setCurrentPlayerName(data.current_player_name);
      setGameState(data.game_state);
      //
    } else if (data.action === "card_revealed") {
      console.log("Revealed card data:", data.revealed_card);
      console.log("Players data:", data.players);

      const hands = data.players.map((player) => ({
        id: player.id,
        name: player.name,
        hand: player.hand,
      }));

      console.log("Updated hands:", hands);
      setPlayerHands(hands);
      setGameState(data.game_state);
    }
  };

  const performAction = (action, payload = {}) => {
    subscriptionRef.current?.perform(action, payload);
  };

  return (
    <GameContext.Provider
      value={{
        gameId,
        setGameId,
        joinedPlayers,
        setJoinedPlayers,
        lobbyStatus,
        setLobbyStatus,
        gameState,
        drawnCard,
        discardPile,
        playerHands,
        currentPlayerId,
        currentPlayerName,
        initializingGame,
        setInitializingGame,
        selectedCards,
        setSelectedCards,
        performAction,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
