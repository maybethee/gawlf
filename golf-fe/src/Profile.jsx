import { useEffect, useState } from "react";
import { getUserDataFromBackend } from "./api";
import GameRecord from "./GameRecord";
import RecordSlider from "./RecordSlider";
import styles from "./Profile.module.css";
import { getDialogActionsUtilityClass } from "@mui/material";

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

    return {
      transform: `translateX(${distanceFromCenter * 30}px)`,
      zIndex: 100 - Math.abs(distanceFromCenter),
    };
  };

  if (!userData) return null;

  return (
    <div className={styles.profile_container}>
      <h2>{userData.user.username}'s profile</h2>

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
              <GameRecord
                zIndex={game.id === sliderValue ? "999" : ""}
                key={game.id}
                gameData={game}
              />
            </li>
          );
        })}
      </ul>

      <div>
        <RecordSlider
          value={sliderValue}
          onValueChange={handleSliderChange}
          maxGames={userData.games.length}
        />
      </div>

      <button onClick={setViewingProfile}>Main Menu</button>
    </div>
  );
}

export default Profile;
