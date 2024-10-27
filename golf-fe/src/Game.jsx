import { useEffect, useState } from "react";
import cable from "./cable";

function Game({ gameId }) {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const subscription = cable.subscriptions.create(
      { channel: "GameChannel", id: gameId },
      {
        received(data) {
          setGameState(data.game_state);
        },
      }
    );

    return () => subscription.unsubscribe();
  }, [gameId]);

  return (
    <div>
      <div>Game State: {JSON.stringify(gameState)}</div>
    </div>
  );
}

export default Game;
