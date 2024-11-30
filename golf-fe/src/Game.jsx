import { useGame } from "./context/useGame";
import PlayerHands from "./PlayerHands";
import TheDayThatForm from "./TheDayThatForm";

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
    setInitializingGame,
    selectedCards,
    setSelectedDiscardPile,
    roundScores,
    allRoundScores,
    roundOver,
    gameOver,
    recordedTheDayThat,
    isEditing,
    setIsEditing,
    performAction,
    displayCardContent,
  } = useGame();

  const handleDrawCard = () => {
    console.log("Drawing card for player:", playerId);

    performAction("draw_card", { player_id: playerId });
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
      setInitializingGame(false);
    }
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

  const handleEditTheDayThat = () => {
    setIsEditing(true);
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

  // const setDiscardPileBaseClass = () => {
  //   let classes = "discard-pile";
  //   if (discardPile.length < 1 && isPlayerTurn && drawnCard)
  //     classes += " clickable";

  //   return classes;
  // };

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
      <div>
        {isEditing && <TheDayThatForm initialText={recordedTheDayThat} />}
        <div>
          {!isEditing && (
            <div
              style={{ display: "flex", alignItems: "center", gap: ".6rem" }}
            >
              <button onClick={handleEditTheDayThat}>Edit</button>
              <h2 className="the-day-that">
                The day that {recordedTheDayThat}
              </h2>
            </div>
          )}
        </div>

        <h3>Hole: {currentHole} / 9</h3>
        <div>
          <p>Drawn card:</p>
          <div className="card hidden"></div>
        </div>
        <div>
          <p>Discard Pile:</p>

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

        <div>
          <h3>
            click on two cards to select them and then click Reveal to flip them
            over
          </h3>
          <button onClick={revealSelectedCards}>Reveal</button>
        </div>

        <PlayerHands playerId={playerId} />
      </div>
    );
  }

  if (roundOver && roundScores.length > 0) {
    console.log("round scores:", roundScores);

    return (
      <div>
        {isEditing && <TheDayThatForm initialText={recordedTheDayThat} />}
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
          {!isEditing && (
            <div>
              <button onClick={handleEditTheDayThat}>Edit</button>
              <h2 className="the-day-that">
                The day that {recordedTheDayThat}
              </h2>
            </div>
          )}
        </div>

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
          {isEditing && <TheDayThatForm initialText={recordedTheDayThat} />}
          <div>
            {!isEditing && (
              <div
                style={{ display: "flex", alignItems: "center", gap: ".6rem" }}
              >
                <button onClick={handleEditTheDayThat}>Edit</button>
                <h2 className="the-day-that">
                  The day that {recordedTheDayThat}
                </h2>
              </div>
            )}
          </div>

          <h2>Game Over</h2>

          <table>
            <tbody>
              <tr>
                <th>Player</th>
                {allRoundScores[0].round_scores.map((score, index) => {
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
    <div>
      {/* <div>Game State: {JSON.stringify(gameState)}</div> */}

      {isEditing && <TheDayThatForm initialText={recordedTheDayThat} />}
      <div>
        {!isEditing && (
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <button onClick={handleEditTheDayThat}>Edit</button>
            <h2 className="the-day-that">The day that {recordedTheDayThat}</h2>
          </div>
        )}
      </div>

      <h3>Hole: {currentHole} / 9</h3>

      <div>
        <p>Drawn card:</p>
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
        <p>Discard Pile:</p>
        <div style={{ display: "flex" }}>
          {/* <div
            className={setDiscardPileBaseClass()}
            onClick={
              discardPile.length < 1 && isPlayerTurn && drawnCard
                ? handleDiscardPileClick
                : null
            }
          ></div> */}
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
                // style={{ marginLeft: "-30px", borderColor: "orange" }}
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

      {!isPlayerTurn && (
        <h3 style={{ color: "orange" }}>
          Waiting for {currentPlayerName}'s turn...
        </h3>
      )}

      <PlayerHands playerId={playerId} />
    </div>
  );
}

export default Game;
