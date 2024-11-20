import { useGame } from "./context/useGame";
import Card from "./Card";

function PlayerHands({ playerId }) {
  const {
    playerHands,
    initializingGame,
    setSelectedCards,
    currentPlayerId,
    drawnCard,
    selectedDiscardPile,
    roundOver,
    performAction,
  } = useGame();

  const handleCardClick = (card, handId) => {
    if (handId !== playerId) {
      console.log("you can only click cards in your own hand");
      return;
    }
    if (initializingGame) {
      selectCard(card);
    } else {
      if (currentPlayerId !== playerId) {
        // console.log("it's not your turn!");
        return;
      }

      if (!drawnCard && !selectedDiscardPile) {
        console.log("you must select a card to swap with");
        return;
      } else if (!drawnCard) {
        console.log("swapping card with discard pile card");
        performAction("swap_card", {
          player_id: playerId,
          card_to_swap: card,
          swap_origin: "discard",
        });
      } else {
        console.log("swapping card with drawn card");
        performAction("swap_card", {
          player_id: playerId,
          card_to_swap: card,
          swap_origin: "deck",
        });
      }
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

  if (roundOver) {
    return (
      <div>
        {playerHands && (
          <div>
            <h3>Player Hands:</h3>
            {playerHands.map((playerHand) => (
              <div key={playerHand.id}>
                <p className="playerName">{playerHand.name}</p>
                <div className="hand">
                  {playerHand.hand.map((card) => (
                    <Card
                      card={card}
                      playerHand={playerHand}
                      key={`${card.rank}${card.suit}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {playerHands && (
        <div>
          {/* <h3>Player Hands:</h3> */}
          <div style={{ display: "flex", columnGap: "2rem" }}>
            {playerHands.map((playerHand) => (
              <div key={playerHand.id}>
                <p className="playerName">{playerHand.name}</p>
                <div className="hand">
                  {playerHand.hand.map((card) => (
                    <Card
                      card={card}
                      playerId={playerId}
                      playerHand={playerHand}
                      key={`${card.rank}${card.suit}`}
                      onClick={() => handleCardClick(card, playerHand.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerHands;
