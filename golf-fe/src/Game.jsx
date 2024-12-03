import { useGame } from "./context/useGame";
import PlayerHands from "./PlayerHands";
import TheDayThat from "./TheDayThat";
import styles from "./Game.module.css";

function Game({ gameId, playerId, isLobbyHost }) {
  const {
    setLobbyStatus,
    currentHole,
    drawnCard,
    discardPile,
    currentPlayerId,
    currentPlayerName,
    prevFirstPlayer,
    initializingGame,
    setSelectedDiscardPile,
    roundScores,
    allRoundScores,
    roundOver,
    gameOver,
    performAction,
    displayCardContent,
  } = useGame();

  const handleDrawCard = () => {
    console.log("Drawing card for player:", playerId);

    performAction("draw_card", { player_id: playerId });
  };

  const handleDiscardPileClick = (card = null) => {
    if (!isPlayerTurn) {
      console.log("wait your turn");
      return;
    }
    if (drawnCard) {
      console.log("discarding drawn card");
      performAction("discard_card", { player_id: playerId });
    } else {
      setSelectedDiscardPile(card);
    }
  };

  const isPlayerTurn = currentPlayerId === playerId;

  const sortedRoundScores =
    roundScores.length > 0
      ? [...roundScores].sort((a, b) => a.round_score - b.round_score)
      : [];

  const roundWinner =
    sortedRoundScores.length > 0 ? sortedRoundScores[0].player_name : null;

  const sortedTotalScores =
    allRoundScores.length > 0
      ? [...allRoundScores].sort((a, b) => a.total_score - b.total_score)
      : [];

  const gameWinner =
    sortedTotalScores.length > 0 ? sortedTotalScores[0].player_name : null;

  const setDrawnCardClass = () => {
    let classes = "card";
    if (isPlayerTurn) classes += " clickable";

    if (drawnCard) {
      classes += " revealed";
      drawnCard.suit === "♥︎" || drawnCard.suit === "♦︎"
        ? (classes += " red")
        : (classes += " black");
    } else {
      classes += " hidden";
    }
    return classes;
  };

  const setDiscardPileCardClass = (card, index) => {
    let classes = " card";
    if (index === discardPile.length - 1 && isPlayerTurn && !initializingGame)
      classes += " clickable";
    card.suit === "♥︎" || card.suit === "♦︎"
      ? (classes += " red")
      : (classes += " black");
    return classes;
  };

  if (!gameId) {
    return null;
  }

  if (initializingGame) {
    return (
      <div className={styles.game_container}>
        <TheDayThat />

        <h2>Hole: {currentHole} / 9</h2>
        <div className={styles.draw_and_discard_piles_container}>
          <div className={styles.draw_and_discard_piles}>
            <div>
              <div className="card hidden"></div>
            </div>
            <div>
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
    );
  }

  if (roundOver && roundScores.length > 0) {
    console.log("round scores:", roundScores);

    return (
      <div>
        <TheDayThat />

        <h2>Hole {currentHole} Completed</h2>

        {isLobbyHost ? (
          <button
            onClick={() =>
              performAction("setup_hole", {
                prev_first_player_id: prevFirstPlayer,
              })
            }
          >
            Next Hole
          </button>
        ) : (
          <p>Waiting for host to start next round...</p>
        )}

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

        <h3>Round winner: {roundWinner}</h3>

        <PlayerHands playerId={playerId} />
      </div>
    );
  }

  if (gameOver && allRoundScores.length > 0) {
    console.log("all round scores:", allRoundScores);
    return (
      <div>
        <div>
          <TheDayThat />

          <h2>Game Over</h2>

          <table>
            <tbody>
              <tr>
                <th>Player</th>
                {allRoundScores[0].round_scores.map((_, index) => {
                  return <th key={index}>Hole #{index + 1}</th>;
                })}
                <th>Total Score</th>
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

          <h3>Placements:</h3>
          {sortedTotalScores.map((player, index) => {
            return (
              <p key={index}>
                {index + 1}: {player.player_name}
              </p>
            );
          })}

          <h3>Winner: {gameWinner}</h3>

          <button
            onClick={() => {
              setLobbyStatus("");
            }}
          >
            Lobby Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.game_container}>
      <TheDayThat />

      <h2>Hole: {currentHole} / 9</h2>

      <div className={styles.draw_and_discard_piles_container}>
        <div>
          {!isPlayerTurn && (
            <h3 className={styles.turn_message}>
              Waiting for {currentPlayerName}'s turn...
            </h3>
          )}
        </div>
        <div className={styles.draw_and_discard_piles}>
          <div>
            <div
              className={setDrawnCardClass()}
              onClick={isPlayerTurn && !drawnCard ? handleDrawCard : null}
            >
              {drawnCard && (
                <div className="card-content-container">
                  <p>{displayCardContent(drawnCard)}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: "flex" }}>
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
                    <div className="card-content-container">
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
      </div>

      <PlayerHands playerId={playerId} />
    </div>
  );
}

export default Game;
