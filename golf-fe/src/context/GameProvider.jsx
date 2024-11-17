import { useState, useEffect, useRef } from "react";
import { GameContext } from "./GameContext";
import cable from "../cable";

export const GameProvider = ({ children }) => {
  const [gameId, setGameId] = useState(null);
  const [joinedPlayers, setJoinedPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [currentHole, setCurrentHole] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [currentPlayerName, setCurrentPlayerName] = useState("");
  const [drawnCard, setDrawnCard] = useState(null);
  const [discardPile, setDiscardPile] = useState([]);
  const [playerHands, setPlayerHands] = useState([]);
  const [lobbyStatus, setLobbyStatus] = useState("");
  const [initializingGame, setInitializingGame] = useState(true);
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectedDiscardPile, setSelectedDiscardPile] = useState(null);
  const [roundScores, setRoundScores] = useState([]);
  const [allRoundScores, setAllRoundScores] = useState([]);
  const [roundOver, setRoundOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const subscriptionRef = useRef(null);

  useEffect(() => {
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
      handlePlayerJoined(data);
    } else if (data.action === "card_drawn") {
      handleCardDrawn(data);
    } else if (data.action === "card_discarded") {
      handleCardDiscarded(data);
    } else if (data.action === "game_setup") {
      handleGameSetup(data);
    } else if (data.action === "hole_setup") {
      handleHoleSetup(data);
    } else if (data.action === "card_swapped") {
      handleCardSwapped(data);
    } else if (data.action === "card_revealed") {
      handleCardRevealed(data);
    } else if (data.action === "round_scores_calculated") {
      handleRoundScoresCalculated(data);
    } else if (data.action === "get_all_round_scores") {
      handleGetAllRoundScores(data);
    }
  };

  const handlePlayerJoined = (data) => {
    console.log(data.player);

    setJoinedPlayers((prevPlayers) => [...prevPlayers, data.player]);
  };
  const handleCardDrawn = (data) => {
    setDrawnCard(data.card);
    setSelectedDiscardPile(null);
    setGameState(data.game_state);
  };

  const handleCardDiscarded = (data) => {
    console.log("current discard pile:", data.game_state.discard_pile);
    setDiscardPile(data.game_state.discard_pile);
    setDrawnCard(null);
    setCurrentPlayerId(data.current_player_id);
    setCurrentPlayerName(data.current_player_name);
    setGameState(data.game_state);
  };

  const handleGameSetup = (data) => {
    console.log(data);
    setGameOver(false);
  };

  const handleHoleSetup = (data) => {
    console.log("received action in Game.jsx");
    const hands = [];

    data.players.forEach((player) => {
      hands.push({ id: player.id, name: player.name, hand: player.hand });
    });

    setPlayerHands(hands);
    setCurrentHole(data.current_hole);
    setDiscardPile(data.game_state.discard_pile);
    setCurrentPlayerId(data.current_player_id);
    setCurrentPlayerName(data.current_player_name);
    setGameState(data.gameState);
    setRoundOver(false);
    // setGameOver(false);
    setInitializingGame(true);
    setLobbyStatus("active");
  };

  const handleCardRevealed = (data) => {
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
    setSelectedCards([]);
  };

  const handleCardSwapped = (data) => {
    console.log(data);

    const hands = [];

    data.players.forEach((player) => {
      hands.push({ id: player.id, name: player.name, hand: player.hand });
    });

    setPlayerHands(hands);
    setDrawnCard(null);
    setSelectedDiscardPile(null);
    setDiscardPile(data.game_state.discard_pile);

    if (data.all_revealed === true) {
      console.log("Player has revealed all cards, round over!");
      performAction("calculate_round_scores");

      setRoundOver(true);

      if (data.hole === 2) {
        console.log("All holes finished, game over!");
        setRoundOver(false);

        // delay 'all_round_scores' until 'round_scores_calculated' is done
        const onRoundScoresCalculated = () => {
          console.log(
            "round_scores_calculated received, performing all_round_scores..."
          );

          performAction("all_round_scores");
          setGameOver(true);
        };

        waitForBroadcast("round_scores_calculated", onRoundScoresCalculated);
      }
    }

    setCurrentPlayerId(data.current_player_id);
    setCurrentPlayerName(data.current_player_name);
    setGameState(data.game_state);
  };

  const handleRoundScoresCalculated = (data) => {
    console.log("round scores", data.scores);
    setRoundScores(data.scores);
    // trigger callback if waiting for 'round_scores_calculated'
    if (pendingBroadcasts["round_scores_calculated"]) {
      pendingBroadcasts["round_scores_calculated"]();
      delete pendingBroadcasts["round_scores_calculated"];
    }
  };

  const handleGetAllRoundScores = (data) => {
    console.log("all round scores:", data.all_scores);
    setAllRoundScores(data.all_scores);
  };

  const pendingBroadcasts = {};

  const waitForBroadcast = (action, callback) => {
    pendingBroadcasts[action] = callback;
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
        currentHole,
        drawnCard,
        discardPile,
        playerHands,
        currentPlayerId,
        currentPlayerName,
        initializingGame,
        setInitializingGame,
        selectedCards,
        setSelectedCards,
        selectedDiscardPile,
        setSelectedDiscardPile,
        roundOver,
        roundScores,
        allRoundScores,
        gameOver,
        performAction,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
