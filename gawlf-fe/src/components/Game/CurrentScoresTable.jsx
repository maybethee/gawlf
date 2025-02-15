import { useState } from "react";
import styles from "./CurrentScoresTable.module.css";
import { useGame } from "../../context/useGame";
import { ChevronDown, ChevronUp } from "lucide-react";

function CurrentScoresTable() {
  const { allRoundScores, currentHole, joinedPlayers } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen((prev) => !prev);
  };

  const holeNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div
      className={`${styles.drawer_container} ${
        isOpen ? styles.open : styles.closed
      }`}
    >
      <div className={styles.score_table_drawer}>
        <div>
          <table className={styles.compact_table}>
            <tbody>
              <tr>
                <th className={styles.compact_th}>Player</th>

                {holeNumbers.map((hole) => {
                  return (
                    <th className={styles.compact_th} key={hole}>
                      Hole {hole}
                    </th>
                  );
                })}
              </tr>

              {allRoundScores.length ? (
                <>
                  {allRoundScores.map((player) => {
                    return (
                      <tr key={player.player_id}>
                        <th className={styles.compact_th}>
                          {player.player_name}
                        </th>

                        {holeNumbers.map((hole) => {
                          console.log("hole:", hole);
                          console.log("player:", player);
                          return (
                            <td className={styles.compact_td} key={hole}>
                              {player.round_scores[hole - 1]}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </>
              ) : (
                <>
                  {joinedPlayers.map((player) => {
                    return (
                      <tr key={player.name}>
                        <th className={styles.compact_th}>{player.name}</th>
                        <td className={styles.compact_td}></td>
                        <td className={styles.compact_td}></td>
                        <td className={styles.compact_td}></td>
                        <td className={styles.compact_td}></td>
                        <td className={styles.compact_td}></td>
                        <td className={styles.compact_td}></td>
                        <td className={styles.compact_td}></td>
                        <td className={styles.compact_td}></td>
                        <td className={styles.compact_td}></td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.tab} onClick={toggleDrawer}>
        {isOpen ? (
          <h2>
            <ChevronUp color="#374151" size={24} strokeWidth={2} />
            Hole {currentHole} / 9
          </h2>
        ) : (
          <h2>
            <ChevronDown color="#374151" size={24} strokeWidth={2} />
            Hole {currentHole} / 9
          </h2>
        )}
      </div>
    </div>
  );
}

export default CurrentScoresTable;
