import styles from "./GameRecord.module.css";

function GameRecord({ gameData }) {
  // console.log(gameData);
  return (
    <div className={styles.card}>
      <p className={styles.the_day}>
        The day that {gameData.the_day_that || "we golfed"} (
        {gameData.created_at.split("T", 1)})
      </p>
      {gameData.summary && gameData.summary.players.length > 0 && (
        <table className={styles.compact_table}>
          <tbody>
            <tr>
              <th className={styles.compact_th}>Plyr</th>
              {gameData.summary.players[0].round_scores.map((_, index) => {
                return (
                  <th className={styles.compact_th} key={index}>
                    {index + 1}
                  </th>
                );
              })}
              <th className={styles.compact_th}>Total</th>
            </tr>

            {gameData.summary.players.map((player) => {
              return (
                <tr key={player.player_name}>
                  <th className={styles.compact_th}>
                    {player.player_name.substring(0, 4)}
                  </th>

                  {player.round_scores.map((score, index) => {
                    return (
                      <td className={styles.compact_td} key={index}>
                        {score}
                      </td>
                    );
                  })}

                  <td className={styles.compact_td}>{player.total_score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GameRecord;
