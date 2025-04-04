import { useState, useEffect, useRef } from "react";
import { GameContext } from "./GameContext";
import { useAudio } from "./useAudio";
import cable from "../utils/cable";

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
  const [isLobbyHost, setIsLobbyHost] = useState(false);
  const [initializingGame, setInitializingGame] = useState(true);
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectedDiscardPile, setSelectedDiscardPile] = useState(null);
  const [roundScores, setRoundScores] = useState([]);
  const [allRoundScores, setAllRoundScores] = useState([]);
  const [roundOver, setRoundOver] = useState(false);
  const [viewingRoundResults, setViewingRoundResults] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [recordedTheDayThat, setRecordedTheDayThat] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const subscriptionRef = useRef(null);
  const { globalVolume } = useAudio();
  const globalVolumeRef = useRef(globalVolume);

  useEffect(() => {
    globalVolumeRef.current = globalVolume;
  }, [globalVolume]);

  useEffect(() => {
    console.log("gameId changed to:", gameId);

    if (subscriptionRef.current) {
      console.log(
        "Cleaning up existing subscription before creating a new one"
      );

      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

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
    } else if (data.action === "day_recorded") {
      handleTheDayThat(data);
    } else if (data.action === "audio_played") {
      playAudio(data.audio_clip);
    } else if (data.action === "error") {
      console.log(data.message);
    }
  };

  const playAudio = (audioClip) => {
    const audio = new Audio(audioClip);
    audio.volume = globalVolumeRef.current;
    audio.play().catch((error) => console.error("Error playing audio", error));
  };

  const handlePlayerJoined = (data) => {
    console.log(data.player);

    setJoinedPlayers((prevPlayers) => [...prevPlayers, data.player]);
  };
  const handleCardDrawn = (data) => {
    console.log("handle card drawn called, data received:", data);

    setDrawnCard(data.game_state.drawn_card);
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
    setRecordedTheDayThat("");
    setIsEditing(true);

    if (isLobbyHost) {
      console.log("Host setting up the first hole...");
      performAction("setup_hole");
    }
  };

  const handleHoleSetup = (data) => {
    console.log("received action in Game.jsx");

    const hands = [];
    const allCards = [];

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
    setCurrentPlayerId(data.game_state.turn_order[0]);
    setCurrentPlayerName(data.current_player_name);
    setGameState(data.game_state);
    setRoundOver(false);
    setViewingRoundResults(false);
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

    setPlayerHands((prevHands) =>
      prevHands.map((hand) =>
        hand.id === playerId
          ? {
              ...hand,
              hand: updatedHand,
            }
          : hand
      )
    );

    setDrawnCard(null);
    setSelectedDiscardPile(null);
    setDiscardPile(data.game_state.discard_pile);

    console.log("what is summary update:", data.summary_update);
    if (data.summary_update) {
      console.log("All holes finished, game over!");
      console.log("all round scores:", data.all_round_scores);
      setRoundScores(data.curr_round_scores);
      setAllRoundScores(data.all_round_scores);
      setGameOver(true);
    } else if (data.curr_round_scores) {
      console.log("Player has revealed all cards, round over!");
      console.log("round scores", data.curr_round_scores);
      setRoundScores(data.curr_round_scores);
      setAllRoundScores(data.all_round_scores);
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
    setRoundScores([]);
    setAllRoundScores([]);
    setDiscardPile([]);
    setCurrentPlayerId(null);
    setCurrentPlayerName(null);
    setGameState(null);
    setIsLobbyHost(false);
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
        initializingGame,
        setInitializingGame,
        selectedCards,
        setSelectedCards,
        selectedDiscardPile,
        setSelectedDiscardPile,
        roundOver,
        viewingRoundResults,
        setViewingRoundResults,
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
