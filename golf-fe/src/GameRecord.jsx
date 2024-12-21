import styles from "./GameRecord.module.css";

function GameRecord({ zIndex, gameData }) {
  console.log(gameData);
  return (
    <div style={{ zIndex: `${zIndex}` }} className={styles.card}>
      The day that{" "}
      {gameData.the_day_that || `we played on ${gameData.created_at}`}
    </div>
  );
}

export default GameRecord;
