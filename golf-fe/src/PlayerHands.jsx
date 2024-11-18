import { useGame } from "./context/useGame";
import { useEffect, useState } from "react";

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

  // useEffect(() => {
  //   console.log("current selected cards:", selectedCards);
  // }, [selectedCards]);

  // useEffect(() => {
  //   console.log("playerHands updated:", playerHands);
  // }, [playerHands]);

  const setClassName = (playerHand) => {
    if (initializingGame) {
      if (playerHand.id === playerId) {
        return "card hidden clickable";
      } else {
        return "card hidden";
      }
    } else {
      if (
        playerHand.id === playerId &&
        playerHand.id === currentPlayerId &&
        (drawnCard || selectedDiscardPile)
      ) {
        return "card hidden clickable";
      } else {
        return "card hidden";
      }
    }
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
                    <div
                      className="card revealed"
                      key={`${card.rank}${card.suit}`}
                    >
                      {`${card.rank}${card.suit}`}
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
