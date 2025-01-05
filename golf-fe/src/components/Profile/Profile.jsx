import { useEffect, useState, useMemo } from "react";
import { getUserDataFromBackend } from "../../utils/api";
import GameRecord from "./GameRecord";
import RecordSlider from "./RecordSlider";
import styles from "./Profile.module.css";
import { GalleryHorizontal, List } from "lucide-react";

function Profile({ userId, setViewingProfile }) {
  const [userData, setUserData] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [viewList, setViewList] = useState(false);
  const [playerCountsArr, setPlayerCountsArr] = useState([]);
  const [statsFilter, setStatsFilter] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      const data = await getUserDataFromBackend(userId);
      setUserData(data);
      console.log(data);
    };

    getUserData();
  }, [userId]);

  useEffect(() => {
    if (userData?.games?.length) {
      let playerCountsArr = [];

      userData.games.forEach((game) => {
        const playerCount = game.summary.players.length;

        if (playerCount) {
          playerCountsArr.push(playerCount);
        }
      });

      let playerCountsUniqueArr = playerCountsArr
        .filter(function (value, id, self) {
          return id == self.indexOf(value) && value != null;
        })
        .sort((a, b) => a - b);

      setPlayerCountsArr(playerCountsUniqueArr);
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.games?.length) {
      setStats(calculateStats());
    }
  }, [userData, statsFilter]);

  const calculateStats = () => {
    return {
      gamesPlayed: `${gamesPlayed()} games played`,
      numberOfWins: `${numberOfWins()} games won`,
      bestScoreGame: `best total score: ${bestScoreGame().score} on ${
        bestScoreGame().date
      }`,
      worstScoreGame: `worst total score: ${worstScoreGame().score} on ${
        worstScoreGame().date
      }`,
      bestScoreRound: `best round score: ${bestScoreRound().best_round} on ${
        bestScoreRound().date
      }`,
      worstScoreRound: `worst round score: ${
        worstScoreRound().worst_round
      } on ${worstScoreRound().date}`,
    };
  };

  const handleSliderChange = (newVal) => {
    setSliderValue(newVal);
  };

  const filterDataByPlayerCount = () => {
    if (!userData) return null;

    let gamesWithCount = userData.games;

    if (statsFilter) {
      gamesWithCount = userData.games.filter((game) => {
        return game.summary.players.length === statsFilter;
      });
    }

    return { ...userData, games: gamesWithCount };
  };

  const gamesPlayed = () => {
    if (!userData) return 0;

    const filteredData = filterDataByPlayerCount();

    return filteredData.games.length;
  };

  const numberOfWins = () => {
    if (!userData) return 0;

    const filteredData = filterDataByPlayerCount();

    return filteredData.games.filter((game) => {
      return userData.user.id === game.summary.winner_id;
    }).length;
  };

  const bestScoreGame = () => {
    if (!userData) return null;

    const filteredData = filterDataByPlayerCount();

    const usersTotalScores = filteredData.games.map((game) => {
      const gameTotal = game.summary.players.find(
        (player) => player.user_id === filteredData.user.id
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
  };

  // const worstScoreGame = useMemo(() => {

  const worstScoreGame = () => {
    if (!userData) return null;

    const filteredData = filterDataByPlayerCount();

    const usersTotalScores = filteredData.games.map((game) => {
      const gameTotal = game.summary.players.find(
        (player) => player.user_id === filteredData.user.id
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
  };

  const bestScoreRound = () => {
    if (!userData) return null;

    const filteredData = filterDataByPlayerCount();

    const usersRoundScores = filteredData.games.map((game) => {
      const gameRoundScores = game.summary.players.find(
        (player) => player.user_id === filteredData.user.id
      );

      const bestRoundScore = Math.min(...gameRoundScores.round_scores);

      // console.log("worst round score:", worstRoundScore);
      return {
        best_round: bestRoundScore,
        date: game.created_at.split("T", 1)[0],
      };
    });

    if (usersRoundScores.length === 0) {
      return null;
    }

    return usersRoundScores.reduce((lowestObj, currObj) =>
      currObj.best_round < lowestObj.best_round ? currObj : lowestObj
    );
  };

  const worstScoreRound = () => {
    if (!userData) return null;

    const filteredData = filterDataByPlayerCount();

    const usersRoundScores = filteredData.games.map((game) => {
      const gameRoundScores = game.summary.players.find(
        (player) => player.user_id === filteredData.user.id
      );

      const worstRoundScore = Math.max(...gameRoundScores.round_scores);

      // console.log("worst round score:", worstRoundScore);
      return {
        worst_round: worstRoundScore,
        date: game.created_at.split("T", 1)[0],
      };
    });

    if (usersRoundScores.length === 0) {
      return null;
    }

    return usersRoundScores.reduce((highestObj, currObj) =>
      currObj.worst_round > highestObj.worst_round ? currObj : highestObj
    );
  };

  const playerAliases = () => {
    if (!userData) return null;

    let aliases = [];

    userData.games.map((game) => {
      const player = game.summary.players.find(
        (player) => player.user_id === userData.user.id
      );

      aliases.push(player.player_name);
    });

    const uniqueAliasArr = uniqueStrings(aliases);

    return uniqueAliasArr;
  };

  const uniqueStrings = (arr) => {
    const seen = new Set();

    return arr.filter((string) => {
      const lowercaseString = string.toLowerCase();

      if (!seen.has(lowercaseString)) {
        seen.add(lowercaseString);
        return true;
      }

      return false;
    });
  };

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

  if (userData.games.length < 1)
    return (
      <div className={styles.profile_container}>
        <h2>{userData.user.username}</h2>

        <p>
          Play at least 1 game to see game records and some interesting stats
        </p>

        <button onClick={setViewingProfile}>Main Menu</button>
      </div>
    );

  return (
    <div className={styles.profile_container}>
      <h2>{userData.user.username}</h2>

      <div className={styles.game_history_container}>
        <div className={styles.game_history_header}>
          <h3>Game History</h3>
          <div className={styles.display_btns}>
            <button
              className={!viewList ? styles.selected : ""}
              onClick={() => setViewList(false)}
            >
              <GalleryHorizontal size={20} strokeWidth={2} />
            </button>
            <button
              className={viewList ? styles.selected : ""}
              onClick={() => setViewList(true)}
            >
              <List size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {viewList ? (
          <div className={styles.list_container}>
            <ul className={styles.game_records_ul_list}>
              {userData.games.map((game, index) => {
                // console.log("game id:", game.id);
                // console.log("slider val:", sliderValue);
                return (
                  <li key={game.id}>
                    <GameRecord
                      key={game.id}
                      gameData={game}
                      viewList={viewList}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className={styles.showcase_container}>
            <ul className={styles.game_records_ul_showcase}>
              {userData.games.map((game, index) => {
                // console.log("game id:", game.id);
                // console.log("slider val:", sliderValue);
                return (
                  <li
                    style={getDynamicStyle(index)}
                    className={setRecordClass(index)}
                    key={game.id}
                  >
                    <GameRecord
                      key={game.id}
                      gameData={game}
                      viewList={viewList}
                    />
                  </li>
                );
              })}
            </ul>
            {userData.games.length > 1 && (
              <div className={styles.slider_container}>
                <RecordSlider
                  value={sliderValue}
                  onValueChange={handleSliderChange}
                  maxGames={userData.games.length - 1}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className={styles.stats_section_container}>
        <div className={styles.stats_section}>
          <div className={styles.stats_section_header}>
            <h3>Stats</h3>
            {playerCountsArr.length <= 1 ? null : (
              <div className={styles.filter_container}>
                <p>Filter by game's player count</p>
                <div className={styles.filter_btns}>
                  <button onClick={() => setStatsFilter(null)}>
                    All Games
                  </button>
                  {playerCountsArr.map((count) => {
                    return (
                      <button onClick={() => setStatsFilter(count)} key={count}>
                        {count} players
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {stats && (
            <ul>
              {Object.keys(stats).map((key) => {
                return <li key={key}>{stats[key]}</li>;
              })}
              <li>Aliases: {playerAliases()}</li>
            </ul>
          )}
        </div>
      </div>

      <button onClick={setViewingProfile}>Main Menu</button>
    </div>
  );
}

export default Profile;
