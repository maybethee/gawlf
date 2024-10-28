import { useEffect, useState, useRef } from "react";
import cable from "./cable";

function Game({ gameId, playerId }) {
  const [gameState, setGameState] = useState(null);
  const [drawnCard, setDrawnCard] = useState(null);
  const subscriptionRef = useRef(null);

  // console.log("Game ID:", gameId);
  useEffect(() => {
    subscriptionRef.current = cable.subscriptions.create(
      { channel: "GameChannel", game_id: gameId },
      {
        connected() {
          console.log("Connected to GameChannel for game ID:", gameId);
        },
        received(data) {
          console.log("Received data:", data);
          if (data.action === "card_drawn" && data.player_id === playerId) {
            setDrawnCard(data.card);
            setGameState(data.game_state);
          } else {
            setGameState(data.game_state);
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
    console.log("Subscription created:", subscriptionRef.current);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        console.log("Unsubscribed from GameChannel for game ID:", gameId);
      }
    };
  }, [gameId, playerId]);

  const handleDrawCard = () => {
    console.log("Drawing card for player:", playerId);

    subscriptionRef.current.perform("draw_card", { player_id: playerId });
  };

  return (
    <div style={{ marginLeft: "3rem" }}>
      <div>Game State: {JSON.stringify(gameState)}</div>
      <button onClick={handleDrawCard}>Draw from Deck</button>
      {drawnCard && (
        <div>
          <p>Drawn card:</p>
          <p>{`${drawnCard.rank} of ${drawnCard.suit}`}</p>
        </div>
      )}
    </div>
  );
}

export default Game;
