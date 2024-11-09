import { useGame } from "./context/useGame";
import PlayerHands from "./PlayerHands";

function Game({ gameId, playerId }) {
  const {
    gameState,
    drawnCard,
    discardPile,
    currentPlayerId,
    currentPlayerName,
    initializingGame,
    setInitializingGame,
    selectedCards,
    performAction,
  } = useGame();

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

  const revealSelectedCards = () => {
    if (selectedCards.length < 2) {
      console.log("you must select 2 cards to reveal!");
      return;
    } else {
      console.log("selected cards:", selectedCards);
      console.log("revealing cards...");
      performAction("reveal_cards", {
        player_id: playerId,
        cards: selectedCards,
      });
      setInitializingGame(false);
    }
  };

  const isPlayerTurn = currentPlayerId === playerId;

  if (!gameId) {
    return null;
  }

  return (
    <div>
      <div>Game State: {JSON.stringify(gameState)}</div>

      {initializingGame && (
        <div>
          <h3>
            click on two cards to select them and then click Reveal to flip them
            over
          </h3>
          <button onClick={revealSelectedCards}>Reveal</button>
        </div>
      )}
      {isPlayerTurn ? (
        <div>
          <button onClick={handleDrawCard}>Draw from Deck</button>
          <button onClick={handleDiscardCard}>Discard</button>
          <button onClick={handleSwapCard}>
            Swap Card (next player's turn)
          </button>
        </div>
      ) : (
        <h3 style={{ color: "orange" }}>
          Waiting for {currentPlayerName}'s turn
        </h3>
      )}

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

      <PlayerHands playerId={playerId} />
    </div>
  );
}

export default Game;
