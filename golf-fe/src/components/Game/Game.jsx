import { useGame } from "../../context/useGame";
import { useAudio } from "../../context/useAudio";
import PlayerHands from "./PlayerHands";
import TheDayThat from "./TheDayThat/TheDayThat";
import styles from "./Game.module.css";
import { useState, useEffect, useRef } from "react";
import UIOptions from "./UIOptions";
import { Eye, Play } from "lucide-react";
import turnSound from "/assets/your-turn.mp3";
import { debounce } from "lodash";
import CurrentScoresTable from "./CurrentScoresTable";

function notifyTurnUntilVisible(globalVolume) {
  const originalTitle = document.title;
  const originalFavicon = document.querySelector("link[rel='icon']").href;

  const turnFaviconURL = "/assets/diamond.png";

  const setFavicon = (url) => {
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
      favicon.href = url;
    } else {
      const newFavicon = document.createElement("link");
      newFavicon.rel = "icon";
      newFavicon.href = url;
      document.head.appendChild(newFavicon);
    }
  };

  setFavicon(turnFaviconURL);

  const audio = new Audio(turnSound);
  audio.volume = globalVolume;
  audio.play().catch((error) => console.error("Error playing audio", error));

  let flashInterval = setInterval(() => {
    document.title =
      document.title === "Your Turn!" ? originalTitle : "Your Turn!";
  }, 1000);

  const visibilityChangeHandler = () => {
    if (document.visibilityState === "visible") {
      clearInterval(flashInterval);
      document.title = originalTitle;
      setFavicon(originalFavicon);
    }
  };

  document.addEventListener("visibilitychange", visibilityChangeHandler);

  return () => {
    clearInterval(flashInterval);
    document.title = originalTitle;
    document.removeEventListener("visibilitychange", visibilityChangeHandler);
    setFavicon(originalFavicon);
  };
}

function Game({ gameId, playerId, isLobbyHost }) {
  const {
    currentHole,
    drawnCard,
    discardPile,
    currentPlayerId,
    currentPlayerName,
    prevFirstPlayer,
    initializingGame,
    selectedDiscardPile,
    setSelectedDiscardPile,
    roundScores,
    allRoundScores,
    roundOver,
    viewingRoundResults,
    setViewingRoundResults,
    gameOver,
    performAction,
    displayCardContent,
    handleCleanup,
  } = useGame();

  const { globalVolume } = useAudio();

  const [checkingHistory, setCheckingHistory] = useState(false);
  const [notified, setNotified] = useState(false);

  const tabVisible = useRef(true);
  const cleanupRef = useRef(null);

  const handleDrawCard = () => {
    console.log("Drawing card for player:", playerId);

    performAction("play_audio", { audio_clip: "/assets/flip.mp3" });

    setTimeout(() => {
      performAction("draw_card", { player_id: playerId });
    }, 300);
  };

  const debouncedHandleDrawCard = debounce(handleDrawCard, 300, {
    leading: true,
    trailing: false,
  });

  const handleDiscardPileClick = (card = null) => {
    if (!isPlayerTurn) {
      console.log("wait your turn");
      return;
    }
    if (drawnCard) {
      console.log("discarding drawn card");

      performAction("play_audio", { audio_clip: "/assets/place.mp3" });

      setTimeout(() => {
        performAction("discard_card", { player_id: playerId });
      }, 200);
    } else {
      setSelectedDiscardPile(card);
    }
  };

  const debouncedHandleDiscardPileClick = debounce(
    handleDiscardPileClick,
    300,
    {
      leading: true,
      trailing: false,
    }
  );

  const debouncedSetupHole = debounce(
    () => {
      performAction("setup_hole", { prev_first_player_id: prevFirstPlayer });
    },
    3000,
    { leading: true, trailing: false }
  );

  const isPlayerTurn = currentPlayerId === playerId;

  useEffect(() => {
    const handleVisibilityChange = () => {
      tabVisible.current = !document.hidden;

      if (tabVisible.current && cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;

        if (!isPlayerTurn) {
          setNotified(false);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlayerTurn]);

  useEffect(() => {
    if (
      isPlayerTurn &&
      !tabVisible.current &&
      !notified &&
      !initializingGame &&
      !roundOver &&
      !gameOver
    ) {
      console.log("tab is not visible: starting tab flashing...");
      cleanupRef.current = notifyTurnUntilVisible(globalVolume);

      setNotified(true);
    } else if (!isPlayerTurn) {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      setNotified(false);
    } else {
      console.log("No action taken this render.");
    }
  }, [isPlayerTurn, notified, initializingGame, roundOver, gameOver]);

  useEffect(() => {
    if (roundOver || gameOver) {
      performAction("play_audio", { audio_clip: "/assets/round-end.mp3" });
    }
  }, [roundOver, gameOver]);

  const sortedTotalScores =
    allRoundScores.length > 0
      ? [...allRoundScores]
          .sort((a, b) => a.total_score - b.total_score)
          .reverse()
      : [];

  const placements = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

  const sortedPlacements = placements
    .slice(0, sortedTotalScores.length)
    .reverse();

  const gameWinner =
    sortedTotalScores.length > 0
      ? sortedTotalScores[sortedTotalScores.length - 1].player_name
      : null;

  const setDrawnCardClass = () => {
    let classes = "card";
    if (isPlayerTurn) classes += " clickable";

    if (drawnCard) {
      classes += " revealed selected";

      if (drawnCard.suit === "★") {
        classes += " joker";
      } else {
        drawnCard.suit === "♥︎" || drawnCard.suit === "♦︎"
          ? (classes += " red")
          : (classes += " black");
      }
    } else {
      classes += " hidden";
    }
    return classes;
  };

  const setDiscardPileCardClass = (card, index) => {
    let classes = "card hidden-history";
    if (index === discardPile.length - 1 && isPlayerTurn && !initializingGame)
      classes += " clickable";
    if (selectedDiscardPile && index === discardPile.length - 1) {
      classes += " selected";
    }
    if (checkingHistory || initializingGame) {
      classes = classes.replace(/\bhidden-history\b/, "").trim();
    }
    if (card.suit === "★") {
      classes += " joker";
    } else {
      card.suit === "♥︎" || card.suit === "♦︎"
        ? (classes += " red")
        : (classes += " black");
    }

    return classes;
  };

  const backgrounds = [
    { value: "/assets/bg-2.jpg", label: "wood" },
    { value: "/assets/bg-1.jpg", label: "paint" },
    { value: "/assets/bg-3.jpg", label: "leaves" },
    { value: "/assets/bg-4.jpg", label: "pool" },
    { value: "/assets/bg-5.jpg", label: "cow" },
    { value: "/assets/bg-6.jpg", label: "marble" },
    { value: "/assets/bg-8.jpg", label: "giraffe" },
    { value: "/assets/bg-9.jpg", label: "flower" },
    { value: "/assets/bg-10.jpg", label: "clover" },
    { value: "/assets/bg-11.jpg", label: "sunrise" },
  ];

  const [backgroundUrl, setBackgroundUrl] = useState("/assets/bg-2.jpg");

  const updateBackgroundImage = (newUrl) => {
    console.log("background updated (Game.jsx) to", newUrl);
    setBackgroundUrl(newUrl);
  };

  if (!gameId) {
    return null;
  }

  if (!currentPlayerId) {
    return <div>Loading...</div>;
  }

  if (initializingGame) {
    return (
      <div className={styles.game_page}>
        <UIOptions
          updateBackground={updateBackgroundImage}
          backgrounds={backgrounds}
        />
        <div
          style={{
            backgroundImage: `url(${backgroundUrl})`,
          }}
          className={styles.game_container}
        >
          <TheDayThat />
          <CurrentScoresTable />
          {/* <h2 className={styles.current_hole}>Hole: {currentHole} / 9</h2> */}
          <div
            style={{ left: "50%" }}
            className={styles.draw_and_discard_piles_container}
          >
            <h3 style={{ fontSize: "1rem" }} className={styles.turn_message}>
              Select two cards and reveal them by clicking the eye{" "}
              <button disabled={true}>
                <Eye color="#fbe9d2" size={20} />
              </button>
            </h3>
            <div className={styles.draw_and_discard_piles}>
              <div>
                <div className="card hidden"></div>
              </div>
              <div style={{ display: "flex", paddingBottom: "6px" }}>
                {discardPile.map((card, index) => {
                  return (
                    <div
                      className={setDiscardPileCardClass(card, index)}
                      key={index}
                      onClick={
                        index === discardPile.length - 1
                          ? handleDiscardPileClick
                          : null
                      }
                    >
                      <div className={styles.card_content_container}>
                        <p>
                          {card.rank}
                          {card.suit}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <PlayerHands playerId={playerId} />
        </div>
      </div>
    );
  }

  if (viewingRoundResults && roundScores.length > 0) {
    console.log("round scores:", roundScores);

    return (
      <div className={styles.game_page}>
        <UIOptions
          updateBackground={updateBackgroundImage}
          backgrounds={backgrounds}
        />
        <div className={styles.game_container}>
          <TheDayThat />

          <h2 className={styles.hole_completed}>
            Hole {currentHole} Completed
          </h2>

          <div className={styles.results_container}>
            <div className={styles.left_col}>
              <table>
                <tbody>
                  <tr>
                    <th>Player</th>
                    <th>Score</th>
                  </tr>
                  {roundScores.map((player) => {
                    return (
                      <tr key={player.player_id}>
                        <th>{player.player_name}</th>
                        <td>{player.round_score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                backgroundImage: `url(${backgroundUrl})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100%",
                width: "100%",
              }}
              className={styles.right_col}
            >
              <PlayerHands playerId={playerId} />
            </div>
          </div>

          {isLobbyHost ? (
            <button
              className={styles.next_hole_btn}
              onClick={debouncedSetupHole}
            >
              Next Hole
            </button>
          ) : (
            <p className={styles.information}>
              Waiting for host to start next round...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (gameOver && allRoundScores.length > 0) {
    console.log("all round scores:", allRoundScores);
    return (
      <div className={styles.game_page}>
        <UIOptions
          updateBackground={updateBackgroundImage}
          backgrounds={backgrounds}
        />
        <div className={styles.game_container}>
          <TheDayThat />

          <h2 className={styles.game_over}>Game Over</h2>

          <div className={styles.placements_container}>
            <h3>Results</h3>
            <div className={styles.placements}>
              {sortedTotalScores.map((player, index) => {
                const animationDelay =
                  index === sortedTotalScores.length - 1
                    ? `${1.5 + index}s`
                    : `${0.5 + index}s`;

                return (
                  <p style={{ animationDelay: animationDelay }} key={index}>
                    {sortedPlacements[index]}: {player.player_name} -{" "}
                    {player.round_scores.reduce((a, b) => a + b, 0)} points
                  </p>
                );
              })}
            </div>

            <h3
              style={{ animationDelay: `${sortedTotalScores.length + 1.5}s` }}
              className={styles.winner}
            >
              Winner:
            </h3>
            <h3
              style={{ animationDelay: `${sortedTotalScores.length + 2}s` }}
              className={styles.winner_name}
            >
              {gameWinner}
            </h3>
          </div>

          <div
            className={styles.final_hands_results}
            style={{
              backgroundImage: `url(${backgroundUrl})`,
            }}
          >
            <PlayerHands playerId={playerId} />
          </div>

          <table
            style={{ animationDelay: `${sortedTotalScores.length + 4}s` }}
            className={styles.total_scores_table}
          >
            <tbody>
              <tr>
                <th>Player</th>
                {allRoundScores[0].round_scores.map((_, index) => {
                  return <th key={index}>Hole {index + 1}</th>;
                })}
                <th>Total</th>
              </tr>

              {allRoundScores.map((player) => {
                return (
                  <tr key={player.player_id}>
                    <th>{player.player_name}</th>

                    {player.round_scores.map((score, index) => {
                      return <td key={index}>{score}</td>;
                    })}

                    <td>{player.round_scores.reduce((a, b) => a + b, 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button onClick={handleCleanup}>Main Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.game_page}>
      <UIOptions
        updateBackground={updateBackgroundImage}
        backgrounds={backgrounds}
      />
      <div
        className={styles.game_container}
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          pointerEvents: roundOver ? "none" : "",
          opacity: roundOver ? ".8" : "1",
        }}
      >
        <TheDayThat />

        <CurrentScoresTable />
        {/* <h2 className={styles.current_hole}>Hole: {currentHole} / 9</h2> */}

        <div
          style={{ left: "51%" }}
          className={styles.draw_and_discard_piles_container}
        >
          <div>
            {!roundOver && (
              <div>
                {!isPlayerTurn ? (
                  <h3 className={styles.turn_message}>
                    Waiting for {currentPlayerName}'s turn...
                  </h3>
                ) : (
                  <h3
                    style={{ backgroundColor: "#fef08a" }}
                    className={styles.turn_message}
                  >
                    Your Turn
                  </h3>
                )}
              </div>
            )}
          </div>
          <div className={styles.draw_and_discard_piles}>
            <div className={styles.deck}>
              <div
                className={setDrawnCardClass()}
                onClick={
                  isPlayerTurn && !drawnCard ? debouncedHandleDrawCard : null
                }
              >
                {drawnCard && (
                  <div className="card-content-container">
                    <p>{displayCardContent(drawnCard)}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className={styles.discard_pile_container}>
                {discardPile.map((card, index) => {
                  return (
                    <div
                      className={setDiscardPileCardClass(card, index)}
                      key={index}
                      disabled={performAction}
                      onClick={
                        index === discardPile.length - 1
                          ? debouncedHandleDiscardPileClick
                          : null
                      }
                    >
                      <div className="card-content-container">
                        <p>
                          {card.rank}
                          {card.suit}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <button
                  style={{
                    transform: checkingHistory ? "rotate(-180deg)" : "",
                    transition: "transform .35s",
                  }}
                  className={styles.history_btn}
                  onClick={() => setCheckingHistory(!checkingHistory)}
                >
                  <Play
                    style={{ stroke: "black", fill: "#fbe9d2" }}
                    size={36}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        <PlayerHands playerId={playerId} />
      </div>
      {roundOver && (
        <button
          style={{ pointerEvents: "auto", opacity: roundOver ? "1" : "" }}
          className={styles.view_results_btn}
          onClick={() => setViewingRoundResults(true)}
        >
          See Results
        </button>
      )}
    </div>
  );
}

export default Game;
