import { useEffect, useState } from "react";
import { getUserDataFromBackend } from "./api";

function Profile({ userId }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      const data = await getUserDataFromBackend(userId);
      setUserData(data);
      console.log(data);
    };

    getUserData();
  }, [userId]);

  if (!userData) return <div>Loading...</div>;

  return (
    <div>
      <h2>{userData.user.username}'s profile</h2>

      <ul>
        {userData.games.map((game) => {
          return (
            <li key={game.id}>
              The day that{" "}
              {game.the_day_that || `we played on ${game.created_at}`}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Profile;
