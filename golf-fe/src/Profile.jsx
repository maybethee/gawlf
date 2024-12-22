import { useEffect, useState } from "react";
import { getUserDataFromBackend } from "./api";
import GameRecord from "./GameRecord";
import RecordSlider from "./RecordSlider";
import styles from "./Profile.module.css";
import { getOpacity } from "@mui/material/styles/createColorScheme";

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

  // useEffect(() => {
  //   console.log("sliderval:", sliderValue);
  // });

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

      <ul>
        {userData.games.map((game, index) => {
          console.log("game id:", game.id);
          console.log("slider val:", sliderValue);
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

      <button onClick={setViewingProfile}>Main Menu</button>
    </div>
  );
}

export default Profile;
