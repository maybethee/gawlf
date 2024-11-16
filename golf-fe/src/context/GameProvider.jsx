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

  const handleReceivedData = async (data) => {
    console.log("Received data:", data);

    if (data.action === "player_joined") {
      // console.log(data.player);

      // setJoinedPlayers((prevPlayers) => [...prevPlayers, data.player]);
      handlePlayerJoined(data);
      //
    } else if (data.action === "card_drawn") {
      setDrawnCard(data.card);
      setSelectedDiscardPile(null);
      setGameState(data.game_state);
      //
    } else if (data.action === "card_discarded") {
      console.log("current discard pile:", data.game_state.discard_pile);
      setDiscardPile(data.game_state.discard_pile);
      setDrawnCard(null);
      setCurrentPlayerId(data.current_player_id);
      setCurrentPlayerName(data.current_player_name);
      setGameState(data.game_state);

      //
    } else if (data.action === "game_setup") {
      setGameOver(false);
      //
    } else if (data.action === "hole_setup") {
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
      setInitializingGame(true);
      setLobbyStatus("active");
      //
    } else if (data.action === "card_swapped") {
      // console.log(data);

      // const hands = [];

      // data.players.forEach((player) => {
      //   hands.push({ id: player.id, name: player.name, hand: player.hand });
      // });

      // setPlayerHands(hands);
      // setDrawnCard(null);
      // setSelectedDiscardPile(null);
      // setDiscardPile(data.game_state.discard_pile);

      // if (data.all_revealed === true) {
      //   console.log("player has revealed all cards, round over!!");
      //   performAction("calculate_round_scores")
      //     .then(() => {
      //       console.log("performAction complete, setting roundOver to true");
      //       setRoundOver(true);
      //     })
      //     .catch((error) => {
      //       console.error("Error in calculate_round_scores:", error);
      //     });
      //   if (data.hole === 1) {
      //     console.log("all holes finished, game over!");
      //     performAction("all_round_scores")
      //       .then(() => {
      //         console.log(
      //           "performAction complete, setting roundOver to false and gameOver to true"
      //         );
      //         setRoundOver(false);
      //         setGameOver(true);
      //       })
      //       .catch((error) => {
      //         console.error("Error in all_round_scores:", error);
      //       });
      //   }
      // }

      // setCurrentPlayerId(data.current_player_id);
      // setCurrentPlayerName(data.current_player_name);
      // setGameState(data.game_state);
      handleCardSwapped(data);
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
      setSelectedCards([]);
    } else if (data.action === "round_scores_calculated") {
      // console.log("round scores", data.scores);
      // setRoundScores(data.scores);
      handleRoundScoresCalculated(data);
    } else if (data.action === "get_all_round_scores") {
      // console.log("all round scores:", data.all_scores);
      // setAllRoundScores(data.all_scores);
      handleGetAllRoundScores(data);
    }
  };

  const handlePlayerJoined = (data) => {
    console.log(data.player);
    setJoinedPlayers((prevPlayers) => [...prevPlayers, data.player]);
  };

  // const handleCardSwapped = (data) => {
  //   const hands = [];
  //   data.players.forEach((player) => {
  //     hands.push({ id: player.id, name: player.name, hand: player.hand });
  //   });
  //   setPlayerHands(hands);
  //   setDrawnCard(null);
  //   setSelectedDiscardPile(null);
  //   setDiscardPile(data.game_state.discard_pile);

  //   if (data.all_revealed === true) {
  //     console.log("player has revealed all cards, round over!!");
  //     performAction("calculate_round_scores")
  //       .then(() => {
  //         console.log("performAction complete, setting roundOver to true");
  //         setRoundOver(true);
  //       })
  //       .catch((error) => {
  //         console.error("Error in calculate_round_scores:", error);
  //       });
  //     if (data.hole === 1) {
  //       console.log("all holes finished, game over!");
  //       performAction("all_round_scores")
  //         .then(() => {
  //           console.log(
  //             "performAction complete, setting roundOver to false and gameOver to true"
  //           );
  //           setRoundOver(false);
  //           setGameOver(true);
  //         })
  //         .catch((error) => {
  //           console.error("Error in all_round_scores:", error);
  //         });
  //     }
  //   }

  //   setCurrentPlayerId(data.current_player_id);
  //   setCurrentPlayerName(data.current_player_name);
  //   setGameState(data.game_state);
  // };

  const handleCardSwapped = async (data) => {
    const hands = [];
    data.players.forEach((player) => {
      hands.push({ id: player.id, name: player.name, hand: player.hand });
    });
    setPlayerHands(hands);
    setDrawnCard(null);
    setSelectedDiscardPile(null);
    setDiscardPile(data.game_state.discard_pile);

    if (data.all_revealed === true) {
      console.log("player has revealed all cards, round over!!");

      try {
        // Wait for calculate_round_scores to finish before proceeding
        await performAction("calculate_round_scores");
        console.log("performAction complete, setting roundOver to true");
        setRoundOver(true);

        // Only proceed with the next action if all holes are finished
        if (data.hole === 1) {
          console.log("all holes finished, game over!");

          // Wait for all_round_scores to finish
          await performAction("all_round_scores");
          console.log(
            "performAction complete, setting roundOver to false and gameOver to true"
          );
          setRoundOver(false);
          setGameOver(true);
        }
      } catch (error) {
        console.error("Error in action chain:", error);
      }
    }

    setCurrentPlayerId(data.current_player_id);
    setCurrentPlayerName(data.current_player_name);
    setGameState(data.game_state);
  };

  const handleRoundScoresCalculated = (data) => {
    console.log("round scores", data.scores);
    setRoundScores(data.scores);
  };

  const handleGetAllRoundScores = (data) => {
    console.log("all round scores:", data.all_scores);
    setAllRoundScores(data.all_scores);
  };

  const performAction = (action, payload = {}) => {
    return new Promise((resolve, reject) => {
      if (subscriptionRef.current) {
        subscriptionRef.current.perform(action, payload);
        resolve();
      } else {
        reject(new Error("Subscription is not initialized"));
      }
    });
  };

  // const performAction = (action, payload = {}) => {
  //   return new Promise((resolve, reject) => {
  //     subscriptionRef.current?.perform(action, payload)
  //       ? resolve()
  //       : reject(new Error("Action perform failed"));
  //   });
  // };
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
