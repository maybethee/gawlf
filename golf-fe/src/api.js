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
