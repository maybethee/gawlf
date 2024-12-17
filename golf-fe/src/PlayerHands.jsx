import { useGame } from "./context/useGame";
import Card from "./Card";
import styles from "./PlayerHands.module.css";
import { Eye } from "lucide-react";

function PlayerHands({ playerId, backgroundUrl }) {
  const {
    playerHands,
    initializingGame,
    setInitializingGame,
    selectedCards,
    setSelectedCards,
    currentPlayerId,
    drawnCard,
    selectedDiscardPile,
    roundOver,
    gameOver,
    performAction,
  } = useGame();

  const handleCardClick = (card, handId) => {
    console.log("hand id:", handId);
    console.log("playerId:", playerId);
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
      // make sure this doesn't interfere with other players
      setSelectedCards([]);
      setInitializingGame(false);
    }
  };

  const parentWidth = 700;
  const parentHeight = 700;
  const radius = (Math.min(parentWidth, parentHeight) / 2) * 0.8;

  const positions = (numChildren) => {
    const isOdd = numChildren % 2 !== 0;
    const rotationOffset = isOdd ? -Math.PI / 2 : Math.PI / numChildren;
    const centerX = parentWidth / 2;
    const centerY = parentHeight / 2;
    return Array.from({ length: numChildren }, (_, index) => {
      const angle = (2 * Math.PI * index) / numChildren + rotationOffset;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      // console.log(`Child ${index}: x=${x}, y=${y}, angle=${angle}`);

      return { left: x, top: y };
    });
  };

  const childPositions = positions(playerHands.length);

  const sortedHands = playerHands.sort((a, b) => a.id - b.id);

  if (roundOver || gameOver) {
    return (
      <div
        key={backgroundUrl}
        style={{
          background: `no-repeat url(${backgroundUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100%",
          width: "100%",
        }}
        className={styles.results_player_hands_container}
      >
        {playerHands && (
          <div className={styles.results_player_hands}>
            {playerHands.map((playerHand) => (
              <div key={playerHand.id}>
                <div className={styles.hand_header}>
                  <p>{playerHand.name}</p>
                </div>
                <div className={styles.hand}>
                  {playerHand.hand.map((card) => (
                    <Card
                      card={card}
                      playerHand={playerHand}
                      key={`card-${card.id}`}
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
    <div
      key={backgroundUrl}
      style={{
        background: `no-repeat url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100%",
        width: "100%",
      }}
      className={styles.player_hands_container}
    >
      {playerHands && (
        <div className={styles.player_hand_area}>
          <div
            className={styles.parent}
            style={{
              width: `${parentWidth}px`,
              height: `${parentHeight}px`,
            }}
          >
            {/* {console.log("player hands:", playerHands)}
            {console.log("sorted hands", sortedHands)} */}
            {playerHands.map((playerHand, index) => (
              <div
                key={playerHand.id}
                className={styles.child}
                style={{
                  position: "absolute",
                  left: `${childPositions[index].left}px`,
                  top: `${childPositions[index].top}px`,
                }}
              >
                <div className={styles.hand_header}>
                  <p
                    style={{
                      color: playerHand.id === playerId ? "#e11d47" : "#374151",
                    }}
                  >
                    {playerHand.name}
                  </p>
                  {initializingGame && playerHand.id === playerId && (
                    <button onClick={revealSelectedCards}>
                      {<Eye color="#fbe9d2" />}
                    </button>
                  )}
                </div>
                <div className={styles.hand}>
                  {playerHand.hand.map((card) => (
                    <Card
                      card={card}
                      playerId={playerId}
                      playerHand={playerHand}
                      key={`card-${card.id}`}
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
