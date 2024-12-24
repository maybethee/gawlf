import { useEffect, useState, useMemo } from "react";
import { getUserDataFromBackend } from "./api";
import GameRecord from "./GameRecord";
import RecordSlider from "./RecordSlider";
import styles from "./Profile.module.css";

function Profile({ userId, setViewingProfile }) {
  const [userData, setUserData] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    const getUserData = async () => {
      const data = await getUserDataFromBackend(userId);
      setUserData(data);
      console.log(data);
    };

    getUserData();
  }, [userId]);

  const handleSliderChange = (newVal) => {
    setSliderValue(newVal);
  };

  const numberOfWins = useMemo(() => {
    if (!userData) return 0;

    return userData.games.filter((game) => {
      return userData.user.id === game.summary.winner_id;
    }).length;
  }, [userData]);

  const bestScoreGame = useMemo(() => {
    if (!userData) return null;

    const usersTotalScores = userData.games.map((game) => {
      const gameTotal = game.summary.players.find(
        (player) => player.user_id === userData.user.id
      );

      return {
        score: gameTotal.total_score,
        date: game.created_at.split("T", 1)[0],
      };
    });

    if (usersTotalScores.length === 0) {
      return null;
    }

    return usersTotalScores.reduce((lowestObj, currObj) =>
      currObj.score < lowestObj.score ? currObj : lowestObj
    );
  }, [userData]);

  const worstScoreGame = useMemo(() => {
    if (!userData) return null;

    const usersTotalScores = userData.games.map((game) => {
      const gameTotal = game.summary.players.find(
        (player) => player.user_id === userData.user.id
      );

      return {
        score: gameTotal.total_score,
        date: game.created_at.split("T", 1)[0],
      };
    });

    if (usersTotalScores.length === 0) {
      return null;
    }

    return usersTotalScores.reduce((highestObj, currObj) =>
      currObj.score > highestObj.score ? currObj : highestObj
    );
  }, [userData]);

  const setRecordClass = (index) => {
    if (index === sliderValue) {
      return "current-record";
    } else if (index < sliderValue) {
      return "left-of-current-record";
    } else {
      return "right-of-current-record";
    }
  };

  const getDynamicStyle = (index) => {
    const distanceFromCenter = index - sliderValue;
    const absDistance = Math.abs(distanceFromCenter);

    return {
      filter: `blur(${absDistance * 1}px)`,
      transform: `translateX(${distanceFromCenter * 65}px) rotate(${
        distanceFromCenter * 1
      }deg)`,
      zIndex: 999 - absDistance,
    };
  };

  if (!userData) return null;

  return (
    <div className={styles.profile_container}>
      <h2>{userData.user.username}</h2>

      <ul className={styles.game_records_ul}>
        {userData.games.map((game, index) => {
          // console.log("game id:", game.id);
          // console.log("slider val:", sliderValue);
          return (
            <li
              style={getDynamicStyle(index)}
              className={setRecordClass(index)}
              key={game.id}
            >
              <GameRecord key={game.id} gameData={game} />
            </li>
          );
        })}
      </ul>
      <div className={styles.slider_container}>
        <RecordSlider
          value={sliderValue}
          onValueChange={handleSliderChange}
          maxGames={userData.games.length - 1}
        />
      </div>

      <div className={styles.stats_section_container}>
        <div className={styles.stats_section}>
          <h3>Stats</h3>
          <ul>
            <li>{userData.games.length} games played</li>
            <li>{numberOfWins} games won</li>
            <li>
              best total score: {bestScoreGame.score} on {bestScoreGame.date}
            </li>
            <li>
              worst total score: {worstScoreGame.score} on {worstScoreGame.date}
            </li>
          </ul>
        </div>
      </div>

      <button onClick={setViewingProfile}>Main Menu</button>
    </div>
  );
}

export default Profile;
