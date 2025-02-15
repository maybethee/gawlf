const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getCurrentUser = async () => {
  const response = await fetch(`${apiUrl}/current_user`, {
    credentials: "include",
  });

  if (response.ok) {
    const data = await response.json();
    return data.user;
  } else {
    return null;
  }
};

export const getUserDataFromBackend = async (userId) => {
  const response = await fetch(`${apiUrl}/users/${userId}`, {
    credentials: "include",
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return null;
  }
};

export const createPlayer = async (playerName, gameId, userId) => {
  const response = await fetch(`${apiUrl}/games/${gameId}/players`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      player: {
        name: playerName,
        game_id: gameId,
        user_id: userId,
        hand: [],
      },
    }),
  });
  const data = await response.json();
  console.log("created player:", data);

  return data;
};

export const createGuest = async () => {
  const response = await fetch(`${apiUrl}/guest_users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  console.log("created guest user:", data);

  return data;
};

export const fetchJoinedPlayers = async (gameId) => {
  const response = await fetch(`${apiUrl}/games/${gameId}/players`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const createLobby = async (userId) => {
  const response = await fetch(`${apiUrl}/create_lobby`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId }),
  });
  const data = await response.json();

  console.log(data.message);
  console.log("fetched data.game_id:", data.game_id);
  return data;
};

export const joinLobby = async (lobbyCode) => {
  // console.log("passed lobby code:", typeof lobby_code);
  const response = await fetch(`${apiUrl}/join_lobby`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ lobby_code: lobbyCode }),
  });
  const data = await response.json();
  console.log("join lobby response:", data);

  return data;
};

export const lobbyStatus = async (lobbyCode) => {
  const status = await fetch(`${apiUrl}/lobby_status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lobby_code: lobbyCode }),
  });

  console.log("fetch status:", status);
  return status;
};

export const updateUserConfig = async (userId, updatedConfig) => {
  console.log("passed user id when calling to update user config:", userId);
  const response = await fetch(`${apiUrl}/update_user_config`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, user_config: updatedConfig }),
  });
  const data = await response.json();

  console.log(data);
  return data;
};
