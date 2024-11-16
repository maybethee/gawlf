import { useGame } from "./context/useGame";
import PlayerHands from "./PlayerHands";
import { useEffect } from "react";

function Game({ gameId, playerId }) {
  const {
    setLobbyStatus,
    gameState,
    currentHole,
    drawnCard,
    discardPile,
    currentPlayerId,
    currentPlayerName,
    initializingGame,
    setInitializingGame,
    selectedCards,
    setSelectedDiscardPile,
    roundScores,
    allRoundScores,
    roundOver,
    gameOver,
    performAction,
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

  const isPlayerTurn = currentPlayerId === playerId;

  if (!gameId) {
    return null;
  }

  if (initializingGame) {
    return (
      <div>
        <div>
          <p>Drawn card:</p>
          <div className="card"></div>
        </div>
        <div>
          <p>Discard Pile:</p>
          <div className="card"></div>
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

  if (roundOver) {
    return (
      <div>
        <h2>Round over</h2>
        <table>
          <tbody>
            <tr>
              <th>Player</th>
              {roundScores.map((player) => {
                return <th key={player.id}>{player.player_name}</th>;
              })}
            </tr>
            <tr>
              <td>Score</td>
              {roundScores.map((player) => {
                return <td key={player.id}>{player.round_score}</td>;
              })}
            </tr>
          </tbody>
        </table>

        {/* still need to calcualate this programmatically */}
        <h3>Winner: Player 2</h3>

        <button onClick={() => performAction("setup_hole")}>Next Hole</button>

        <PlayerHands playerId={playerId} />
      </div>
    );
  }

  if (gameOver) {
    console.log("all round scores:", allRoundScores);
    return (
      <div>
        {allRoundScores.length > 0 ? (
          <div>
            <h2>Game Over</h2>

            <table>
              <tbody>
                <tr>
                  <th>Player</th>
                  {/* map over all_round_scores[0] using index as hole number */}
                  {allRoundScores[0].round_scores.map((score, index) => {
                    return <th key={index}>Hole #{index + 1}</th>;
                  })}
                  <th>Total Score</th>
                </tr>

                {allRoundScores.map((player) => {
                  return (
                    <tr key={player.player_id}>
                      <td>{player.player_name}</td>

                      {player.round_scores.map((score, index) => {
                        return <td key={index}>{score}</td>;
                      })}

                      <td>{player.round_scores.reduce((a, b) => a + b, 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* still need to calcualate this programmatically */}
            <h3>Winner: Player 2</h3>

            <button
              onClick={() => {
                setLobbyStatus("waiting");
              }}
            >
              Lobby Menu
            </button>
          </div>
        ) : (
          <div>no data available</div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div>Game State: {JSON.stringify(gameState)}</div>

      <h3>Hole: {currentHole} / 9</h3>

      <div>
        <p>Drawn card:</p>
        <div
          className={isPlayerTurn && !drawnCard ? "card clickable" : "card"}
          onClick={isPlayerTurn && !drawnCard ? handleDrawCard : null}
        >
          {drawnCard && <p>{`${drawnCard.rank}${drawnCard.suit}`}</p>}
        </div>
      </div>

      <div>
        <p>Discard Pile:</p>
        <div>
          <div
            className={
              discardPile.length < 1 && isPlayerTurn && drawnCard
                ? "card clickable"
                : "card"
            }
            onClick={
              discardPile.length < 1 && isPlayerTurn && drawnCard
                ? handleDiscardPileClick
                : null
            }
          ></div>
          {discardPile.map((card, index) => {
            return (
              <div
                className={
                  index === discardPile.length - 1 && isPlayerTurn
                    ? "card clickable"
                    : "card"
                }
                key={index}
                onClick={
                  index === discardPile.length - 1
                    ? handleDiscardPileClick
                    : null
                }
              >
                {card.rank}
                {card.suit}
              </div>
            );
          })}
        </div>
      </div>

      {!isPlayerTurn && (
        <h3 style={{ color: "orange" }}>
          Waiting for {currentPlayerName}'s turn
        </h3>
      )}

      <PlayerHands playerId={playerId} />
    </div>
  );
}

export default Game;
