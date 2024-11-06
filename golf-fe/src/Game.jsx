import { useGame } from "./context/useGame";

function Game({ gameId, playerId }) {
  const {
    gameState,
    drawnCard,
    discardPile,
    playerHands,
    currentPlayerId,
    performAction,
  } = useGame();

  // maybe change playerId to currentPlayerId
  const handleDrawCard = () => {
    console.log("Drawing card for player:", playerId);

    performAction("draw_card", { player_id: playerId });
  };

  const handleDiscardCard = () => {
    console.log("Discarding card for player:", playerId);

    performAction("discard_card", { player_id: playerId });
  };

  const handleSwapCard = () => {
    performAction("swap_card");
  };

  const isPlayerTurn = currentPlayerId === playerId;

  if (!gameId) {
    return null;
  }

  return (
    <div>
      <div>Game State: {JSON.stringify(gameState)}</div>
      <button onClick={handleDrawCard}>Draw from Deck</button>
      <button onClick={handleDiscardCard}>Discard</button>
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
