export const getCurrentUser = async () => {
  const response = await fetch("http://localhost:3000/current_user", {
    credentials: "include",
  });

  if (response.ok) {
    const data = await response.json();
    return data.user;
  } else {
    return null;
  }
};

export const createPlayer = async (playerName, gameId) => {
  const response = await fetch(
    `http://localhost:3000/games/${gameId}/players`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player: { name: playerName, game_id: gameId, hand: [] },
      }),
    }
  );
  const data = await response.json();
  console.log("created player:", data);

  return data;
};

export const fetchJoinedPlayers = async (gameId) => {
  const response = await fetch(
    `http://localhost:3000/games/${gameId}/players`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const createLobby = async () => {
  const response = await fetch("http://localhost:3000/create_lobby");
  const data = await response.json();

  console.log(data.message);
  console.log("fetched data.game_id:", data.game_id);
  return data;
};

export const joinLobby = async (lobbyCode) => {
  // console.log("passed lobby code:", typeof lobby_code);
  const response = await fetch("http://localhost:3000/join_lobby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lobby_code: lobbyCode }),
  });
  const data = await response.json();
  console.log("join lobby response:", data);

  return data;
};

export const lobbyStatus = async (lobbyCode) => {
  const status = await fetch("http://localhost:3000/lobby_status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lobby_code: lobbyCode }),
  });

  console.log("fetch status:", status);
  return status;
};
