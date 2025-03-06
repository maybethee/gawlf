import { useGame } from "../../context/useGame";
import Card from "./Card";
import styles from "./PlayerHands.module.css";
import { Eye } from "lucide-react";
import { debounce } from "lodash";
import Droppable from "./Droppable";

function PlayerHands({ playerId }) {
  const {
    gameState,
    playerHands,
    initializingGame,
    setInitializingGame,
    selectedCards,
    setSelectedCards,
    currentPlayerId,
    drawnCard,
    selectedDiscardPile,
    roundOver,
    viewingRoundResults,
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

        performAction("play_audio", { audio_clip: "/assets/place.mp3" });

        setTimeout(() => {
          performAction("swap_card", {
            player_id: playerId,
            card_to_swap: card,
            swap_origin: "discard",
          });
        }, 250);

        setTimeout(() => {
          performAction("play_audio", { audio_clip: "/assets/flip.mp3" });
        }, 200);
      } else {
        console.log("swapping card with drawn card");

        performAction("play_audio", { audio_clip: "/assets/place.mp3" });

        setTimeout(() => {
          performAction("swap_card", {
            player_id: playerId,
            card_to_swap: card,
            swap_origin: "deck",
          });
        }, 250);

        setTimeout(() => {
          performAction("play_audio", { audio_clip: "/assets/flip.mp3" });
        }, 200);
      }
    }
  };

  const debouncedHandleCardClick = debounce(
    (card, handId) => {
      handleCardClick(card, handId);
    },
    300,
    { leading: true, trailing: false }
  );

  const selectCard = (card) => {
    console.log(card);
    setSelectedCards((prevCards) => {
      if (
        prevCards.some(
          (selectedCard) =>
            selectedCard.rank === card.rank &&
            selectedCard.suit === card.suit &&
            selectedCard.id === card.id
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

      performAction("play_audio", { audio_clip: "/assets/flip.mp3" });

      setTimeout(() => {
        performAction("reveal_cards", {
          player_id: playerId,
          cards: selectedCards,
        });
      }, 150);

      setSelectedCards([]);
      setInitializingGame(false);
    }
  };

  const turnOrder = gameState.turn_order || [];
  const sortedHands = [...playerHands].sort(
    (a, b) => turnOrder.indexOf(a.id) - turnOrder.indexOf(b.id)
  );

  const setClassName = (playerHand) => {
    let classes = `${styles.child}`;

    if (sortedHands.length === 2) {
      classes += ` ${styles.two_p_child}`;
    } else if (sortedHands.length === 3) {
      classes += ` ${styles.three_p_child}`;
    } else if (sortedHands.length === 4) {
      classes += ` ${styles.four_p_child}`;
    } else if (sortedHands.length === 5) {
      classes += ` ${styles.five_p_child}`;
    }

    if (
      !initializingGame &&
      !roundOver &&
      !gameOver &&
      playerHand.id === turnOrder[turnOrder.indexOf(currentPlayerId)]
    ) {
      classes += ` ${styles.current_player_hand}`;
    } else {
      classes += ` ${styles.waiting_player_hand}`;
    }

    return classes;
  };

  if (viewingRoundResults || gameOver) {
    return (
      <div className={styles.results_player_hands_container}>
        {playerHands && (
          <div className={styles.results_player_hands}>
            {sortedHands.map((playerHand) => (
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
    <div className={styles.player_hands_container}>
      {playerHands && (
        <div className={styles.player_hand_area}>
          <div className={styles.parent}>
            {sortedHands.map((playerHand, index) => (
              <div key={playerHand.id} className={setClassName(playerHand)}>
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
                      <div>
                        <Eye color="#fbe9d2" />
                      </div>
                    </button>
                  )}
                </div>
                <div className={styles.hand}>
                  {playerHand.hand.map((card) => (
                    // <Droppable>
                    <Card
                      card={card}
                      playerId={playerId}
                      playerHand={playerHand}
                      key={`card-${card.id}`}
                      onClick={
                        // () => handleCardClick(card, playerHand.id)
                        () => debouncedHandleCardClick(card, playerHand.id)
                      }
                    />
                    // </Droppable>
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
