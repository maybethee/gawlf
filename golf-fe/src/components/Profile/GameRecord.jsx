import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./GameRecord.module.css";

function GameRecord({ gameData, viewList }) {
  const [collapsed, setCollapsed] = useState(true);

  // console.log(gameData);
  return (
    <div className={viewList ? styles.list_record : styles.card}>
      <div className={styles.the_day_container}>
        <div className={styles.the_day}>
          {viewList && (
            <span onClick={() => setCollapsed(!collapsed)}>
              {!collapsed ? <ChevronUp /> : <ChevronDown />}
            </span>
          )}{" "}
          <p>
            The day that {gameData.the_day_that || "we golfed"} (
            {gameData.created_at.split("T", 1)})
          </p>
        </div>
      </div>
      {collapsed && viewList ? null : (
        <div>
          {gameData.summary && gameData.summary.players.length > 0 && (
            <table className={styles.compact_table}>
              <tbody>
                <tr>
                  <th className={styles.compact_th}>Player</th>
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
                        {player.player_name}
                      </th>

                      {player.round_scores.map((score, index) => {
                        return (
                          <td className={styles.compact_td} key={index}>
                            {score}
                          </td>
                        );
                      })}

                      <td className={styles.compact_td}>
                        {player.total_score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default GameRecord;
