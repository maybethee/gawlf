import { useEffect, useState, useRef } from "react";
import cable from "./cable";

function Game({ gameId, playerId }) {
  const [gameState, setGameState] = useState(null);
  const [drawnCard, setDrawnCard] = useState(null);
  const [discardPile, setDiscardPile] = useState([]);
  const [playerHands, setPlayerHands] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
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
          if (data.action === "card_drawn") {
            setDrawnCard(data.card);

            setGameState(data.game_state);
          } else if (data.action === "card_discarded") {
            setDiscardPile(data.game_state.discard_pile);
            setGameState(data.game_state);
          } else if (data.action === "hole_setup") {
            const hands = [];
            data.players.forEach((player) => {
              hands.push({ id: player.id, hand: player.hand });
            });
            setPlayerHands(hands);
            setGameState(data.gameState);
          } else if (data.action === "card_swapped") {
            console.log(data.current_player_id);
            setCurrentPlayerId(data.current_player_id);
            setGameState(data.gameState);
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

  const handleDiscardCard = () => {
    console.log("Discarding card for player:", playerId);

    subscriptionRef.current.perform("discard_card", { player_id: playerId });
  };

  const handleSetupHole = () => {
    subscriptionRef.current.perform("setup_hole");
  };

  const handleSwapCard = () => {
    subscriptionRef.current.perform("swap_card");
  };

  const isPlayerTurn = currentPlayerId === playerId;

  return (
    <div style={{ marginLeft: "3rem" }}>
      <div>Game State: {JSON.stringify(gameState)}</div>
      <button onClick={handleDrawCard}>Draw from Deck</button>
      <button onClick={handleDiscardCard}>Discard</button>
      <button onClick={handleSetupHole}>Hole Start</button>
      <button onClick={handleSwapCard}>Swap Card (next player's turn)</button>

      <h2 className={isPlayerTurn ? "your_turn" : "not_your_turn"}>
        Green if your turn!
      </h2>

      {drawnCard && (
        <div>
          <div>
            <p>Drawn card:</p>
            <p>{`${drawnCard.rank}${drawnCard.suit}`}</p>
          </div>
        </div>
      )}
      <div>
        <p>Discard Pile:</p>
        <p>
          {discardPile.map((card) => {
            return `${card.rank}${card.suit}, `;
          })}
        </p>
      </div>

      {playerHands && (
        <div>
          <p>Player Hands:</p>
          {playerHands.map((playerHand) => (
            <div key={playerHand.id}>
              <p className="playerName">Player {playerHand.id}</p>
              <div className="hand">
                {playerHand.hand.map((card) => (
                  <div
                    className="card"
                    key={`${card.rank}${card.suit}`}
                  >{`${card.rank}${card.suit}`}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Game;
