import { useGame } from "./context/useGame";
import { useEffect } from "react";

function PlayerHands({ playerId }) {
  const { playerHands, initializingGame, setSelectedCards, performAction } =
    useGame();

  // const handleSwapCard = () => {
  //   performAction("swap_card");
  // };

  const handleCardClick = (card, handId) => {
    if (handId !== playerId) {
      // console.log("you can only click cards in your own hand");
      return;
    }
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

  // useEffect(() => {
  //   console.log("current selected cards:", selectedCards);
  // }, [selectedCards]);

  // useEffect(() => {
  //   console.log("playerHands updated:", playerHands);
  // }, [playerHands]);

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
                  <div
                    className={
                      playerHand.id === playerId ? "your-card" : "card"
                    }
                    key={`${card.rank}${card.suit}`}
                    onClick={() => handleCardClick(card, playerHand.id)}
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

export default PlayerHands;
