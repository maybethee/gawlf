import { useGame } from "./context/useGame";
import { useEffect, useState } from "react";

function PlayerHands({ playerId }) {
  const {
    playerHands,
    initializingGame,
    setSelectedCards,
    currentPlayerId,
    drawnCard,
    performAction,
  } = useGame();

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
      if (currentPlayerId !== playerId) {
        // console.log("it's not your turn!");
        return;
      }
      if (!drawnCard) {
        console.log("you must draw a card first!");
        return;
      } else {
        // rework swap card action to get necessary card data
        console.log("swapping cards");
        performAction("swap_card", { player_id: playerId, card_to_swap: card });
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

  // useEffect(() => {
  //   console.log("current selected cards:", selectedCards);
  // }, [selectedCards]);

  // useEffect(() => {
  //   console.log("playerHands updated:", playerHands);
  // }, [playerHands]);

  const setClassName = (playerHand) => {
    if (initializingGame) {
      if (playerHand.id === playerId) {
        return "your-card";
      } else {
        return "card";
      }
    } else {
      if (playerHand.id === playerId && playerHand.id === currentPlayerId) {
        return "your-card";
      } else {
        return "card";
      }
    }
  };

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
                    className={setClassName(playerHand)}
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
