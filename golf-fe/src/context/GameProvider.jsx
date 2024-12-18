import { useState, useEffect, useRef } from "react";
import { GameContext } from "./GameContext";
import cable from "../cable";

export const GameProvider = ({ children }) => {
  const [gameId, setGameId] = useState(null);
  const [joinedPlayers, setJoinedPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [currentHole, setCurrentHole] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [prevFirstPlayer, setPrevFirstPlayer] = useState(null);
  const [currentPlayerName, setCurrentPlayerName] = useState("");
  const [drawnCard, setDrawnCard] = useState(null);
  const [discardPile, setDiscardPile] = useState([]);
  const [playerHands, setPlayerHands] = useState([]);
  const [lobbyStatus, setLobbyStatus] = useState("");
  const [isLobbyHost, setIsLobbyHost] = useState(false);
  const [initializingGame, setInitializingGame] = useState(true);
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectedDiscardPile, setSelectedDiscardPile] = useState(null);
  const [roundScores, setRoundScores] = useState([]);
  const [allRoundScores, setAllRoundScores] = useState([]);
  const [roundOver, setRoundOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [recordedTheDayThat, setRecordedTheDayThat] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    console.log("gameId changed to:", gameId);

    if (gameId) {
      if (subscriptionRef.current) {
        console.log(
          "Cleaning up existing subscription before creating a new one"
        );
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    }

    if (gameId && !subscriptionRef.current) {
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
    } else if (data.action === "day_recorded") {
      handleTheDayThat(data);
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
    setSelectedDiscardPile(null);
    setDrawnCard(null);
    setCurrentPlayerId(data.current_player_id);
    setCurrentPlayerName(data.current_player_name);
    setGameState(data.game_state);
  };

  const handleGameSetup = (data) => {
    console.log(data);
    setGameOver(false);
    setLobbyStatus("active");

    if (isLobbyHost) {
      console.log("Host setting up the first hole...");
      performAction("setup_hole");
    }
  };

  const handleHoleSetup = (data) => {
    console.log("received action in Game.jsx");

    const hands = [];
    const allCards = [];

    // console.log("data players:", data.players);
    // const sortedPlayers = data.players.sort((a, b) => a.id - b.id);

    // console.log("sorted?", sortedPlayers);

    data.players.forEach((player) => {
      hands.push({ id: player.id, name: player.name, hand: player.hand });

      player.hand.forEach((card) => {
        allCards.push(card);
      });
    });

    if (data.game_state && data.game_state.deck) {
      data.game_state.deck.forEach((card) => {
        allCards.push(card);
      });
    }

    const checkForDuplicates = (cards) => {
      const cardIds = new Set();
      const duplicates = [];

      cards.forEach((card) => {
        if (cardIds.has(card.id)) {
          duplicates.push(card);
        } else {
          cardIds.add(card.id);
        }
      });

      return duplicates;
    };

    const duplicates = checkForDuplicates(allCards);

    if (duplicates.length > 0) {
      console.warn("Duplicate cards found:", duplicates);
    } else {
      console.log("No duplicate cards found.");
    }

    setPlayerHands(hands);
    setCurrentHole(data.current_hole);
    setDiscardPile(data.game_state.discard_pile);
    setCurrentPlayerId(data.current_player_id);
    setPrevFirstPlayer(data.current_player_id);
    setCurrentPlayerName(data.current_player_name);
    setGameState(data.gameState);
    setRoundOver(false);
    // setGameOver(false);
    setInitializingGame(true);
  };

  const handleCardRevealed = (data) => {
    console.log("Revealed card data:", data.revealed_card);
    console.log("Players data:", data.players);

    const updatedPlayer = data.player;

    const { id: playerId, hand: updatedHand } = updatedPlayer;

    setPlayerHands((prevHands) =>
      prevHands.map((hand) =>
        hand.id === playerId ? { ...hand, hand: updatedHand } : hand
      )
    );

    setGameState(data.game_state);
  };

  const handleCardSwapped = (data) => {
    const updatedPlayer = data.player;

    const { id: playerId, hand: updatedHand } = updatedPlayer;

    console.log("Updated Hand from Backend:", updatedHand);

    const deduplicateHand = (hand) => {
      const uniqueIds = new Set(hand.map((card) => card.id));
      return Array.from(uniqueIds).map((id) =>
        hand.find((card) => card.id === id)
      );
    };

    console.log("Deduplicated Hand:", deduplicateHand(updatedHand));

    setPlayerHands((prevHands) =>
      prevHands.map((hand) =>
        hand.id === playerId
          ? {
              ...hand,
              hand: deduplicateHand(updatedHand),
            }
          : hand
      )
    );

    setDrawnCard(null);
    setSelectedDiscardPile(null);
    setDiscardPile(data.game_state.discard_pile);

    if (data.all_round_scores) {
      setRoundScores(data.curr_round_scores);
      console.log("All holes finished, game over!");
      console.log("all round scores:", data.all_round_scores);
      setAllRoundScores(data.all_round_scores);
      setGameOver(true);
    } else if (data.curr_round_scores) {
      console.log("Player has revealed all cards, round over!");
      console.log("round scores", data.curr_round_scores);
      setRoundScores(data.curr_round_scores);
      setRoundOver(true);
    }

    setCurrentPlayerId(data.current_player_id);
    setCurrentPlayerName(data.current_player_name);
    setGameState(data.game_state);
  };

  const handleTheDayThat = (data) => {
    console.log("the day that:", data.the_day_that);
    setRecordedTheDayThat(data.the_day_that);
    setIsEditing(false);
  };

  const displayCardContent = (card) => {
    if (roundOver || gameOver) {
      return `${card.rank}${card.suit}`;
    } else {
      // console.log("visible?", card.visibility);
      if (card.visibility === "hidden") {
        return null;
      } else {
        return `${card.rank}${card.suit}`;
      }
    }
  };

  const performAction = (action, payload = {}) => {
    subscriptionRef.current?.perform(action, payload);
  };

  const handleCleanup = () => {
    setCurrentHole(null);
    setDiscardPile([]);
    setCurrentPlayerId(null);
    setPrevFirstPlayer(null);
    setCurrentPlayerName(null);
    setGameState(null);

    setLobbyStatus("");
    setPlayerHands([]);
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
        isLobbyHost,
        setIsLobbyHost,
        gameState,
        currentHole,
        drawnCard,
        discardPile,
        playerHands,
        currentPlayerId,
        currentPlayerName,
        prevFirstPlayer,
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
        recordedTheDayThat,
        setRecordedTheDayThat,
        isEditing,
        setIsEditing,
        performAction,
        displayCardContent,
        handleCleanup,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
