import { useState, useEffect } from "react";
import { getCurrentUser, createGuest } from "./api";

function UserBtns({ setUser }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestCreated, setGuestCreated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
      setUser(user);
    };

    checkAuth();
  }, [setUser, guestCreated]);

  const redirectToRegister = () => {
    window.location.href = "http://localhost:3000/users/sign_up";
  };

  const redirectToLogin = () => {
    window.location.href = "http://localhost:3000/users/sign_in";
  };

  const handleGuestLogin = async () => {
    try {
      await createGuest();
      setGuestCreated(true);
    } catch (error) {
      console.error("Error creating geust:", error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Logged in!</p>
      ) : (
        <div>
          <button onClick={redirectToRegister}>Register</button>
          <button onClick={redirectToLogin}>Login</button>
          <button onClick={handleGuestLogin}>Play as Guest</button>
        </div>
      )}
    </div>
  );
}

export default UserBtns;
