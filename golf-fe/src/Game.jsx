import { useGame } from "./context/useGame";
import { useState, useEffect } from "react";

function Game({ gameId, playerId }) {
  const {
    gameState,
    drawnCard,
    discardPile,
    playerHands,
    currentPlayerId,
    currentPlayerName,
    performAction,
  } = useGame();

  const [initializingGame, setInitializingGame] = useState(true);
  const [selectedCards, setSelectedCards] = useState([]);

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

  const handleCardClick = (card) => {
    if (initializingGame) {
      selectCard(card);
    } else {
      // rework swap card action to get necessary card data
      console.log("swapping cards would happen now");
      // performAction("swap_card");
    }
  };

  const selectCard = (card) => {
    setSelectedCards((prevCards) => {
      if (
        prevCards.some(
          (selectedCard) =>
            selectedCard.rank === card.rank && selectedCard.suit === card.suit
        )
      ) {
        return prevCards;
      }

      if (prevCards.length === 2) {
        const updatedCards = prevCards.slice(1);
        updatedCards.push(card);
        return updatedCards;
      }

      return [...prevCards, card];
    });
  };

  useEffect(() => {
    console.log("current selected cards:", selectedCards);
  }, [selectedCards]);

  const revealSelectedCards = () => {
    if (selectedCards.length < 2) {
      console.log("you must select 2 cards to reveal!");
      return;
    } else {
      console.log("selected cards:", selectedCards);
      console.log("revealing cards...");
      selectedCards.forEach((card) => {
        performAction("reveal_card", {
          player_id: playerId,
          card_rank: card.rank,
          card_suit: card.suit,
        });
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
        // change to name
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

      {playerHands && (
        <div>
          <h3>Player Hands:</h3>
          {playerHands.map((playerHand) => (
            <div key={playerHand.id}>
              <p className="playerName">{playerHand.name}</p>
              <div className="hand">
                {playerHand.hand.map((card) => (
                  <div
                    className="card"
                    key={`${card.rank}${card.suit}`}
                    onClick={() => handleCardClick(card)}
                  >
                    {card.visibility === "hidden"
                      ? "??"
                      : `${card.rank}${card.suit}`}
                  </div>
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
