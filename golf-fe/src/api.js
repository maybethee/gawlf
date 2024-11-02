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

export const createLobby = async () => {
  const response = await fetch("http://localhost:3000/create_lobby");
  const data = await response.json();

  console.log(data.message);
  console.log("fetched data.game_id:", data.game_id);
  return data.game_id;
};
