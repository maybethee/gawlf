import { useGame } from "./context/useGame";

function Card({ playerHand, card, playerId, onClick }) {
  const {
    initializingGame,
    roundOver,
    displayCardContent,
    currentPlayerId,
    drawnCard,
    selectedCards,
    selectedDiscardPile,
  } = useGame();

  const setClassName = (playerHand, card) => {
    let classes = "card";

    card.visibility === "hidden"
      ? (classes += " hidden")
      : (classes += " revealed");

    if (initializingGame && playerHand.id === playerId) {
      classes += " clickable";
    }

    if (
      !initializingGame &&
      playerHand.id === playerId &&
      playerHand.id === currentPlayerId &&
      (drawnCard || selectedDiscardPile)
    ) {
      classes += " clickable";
    }

    if (selectedCards.includes(card)) {
      classes += " selected";
    }

    if (card.suit === "☆") {
      classes += " joker";
    } else {
      card.suit === "♥︎" || card.suit === "♦︎"
        ? (classes += " red")
        : (classes += " black");
    }

    return classes;
  };

  if (roundOver) {
    return (
      <div>
        <div
          className={`card revealed ${
            card.suit === "♥︎" || card.suit === "♦︎" ? "red" : "black"
          }`}
        >
          <div>
            <p className="card-content">
              {card.rank}
              {card.suit}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={setClassName(playerHand, card)} onClick={onClick}>
      <div className="card-content-container">
        <p>{displayCardContent(card)}</p>
      </div>
    </div>
  );
}

export default Card;
