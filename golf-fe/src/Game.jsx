import { useGame } from "./context/useGame";
import PlayerHands from "./PlayerHands";

function Game({ gameId, playerId }) {
  const {
    gameState,
    drawnCard,
    discardPile,
    currentPlayerId,
    currentPlayerName,
    initializingGame,
    setInitializingGame,
    selectedCards,
    setSelectedDiscardPile,
    roundOver,
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
          <h3>
            click on two cards to select them and then click Reveal to flip them
            over
          </h3>
          <button onClick={revealSelectedCards}>Reveal</button>
        </div>

        <div>
          <p>Drawn card:</p>
          <div className="card"></div>
        </div>
        <div>
          <p>Discard Pile:</p>
          <div className="card"></div>
        </div>

        <PlayerHands playerId={playerId} />
      </div>
    );
  }

  if (roundOver) {
    return (
      <div>
        <h2>Round over</h2>
        {/* dummy score table */}
        <table>
          <tbody>
            <tr>
              <th>Player 1</th>
              <th>Player 2</th>
              <th>Player 3</th>
            </tr>
            <tr>
              <td>22</td>
              <td>1</td>
              <td>14</td>
            </tr>
          </tbody>
        </table>

        <button onClick={() => performAction("setup_hole")}>Next Hole</button>

        <PlayerHands playerId={playerId} />
      </div>
    );
  }

  return (
    <div>
      <div>Game State: {JSON.stringify(gameState)}</div>

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
