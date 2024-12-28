import { useState, useEffect } from "react";
import { getCurrentUser, createGuest } from "../../utils/api";
import styles from "./UserBtns.module.css";

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

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const redirectToRegister = () => {
    window.location.href = `${apiUrl}/users/sign_up`;
  };

  const redirectToLogin = () => {
    window.location.href = `${apiUrl}/users/sign_in`;
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
    <div className={styles.container}>
      {isAuthenticated ? (
        <p>Logged in!</p>
      ) : (
        <div className={styles.btns_container}>
          <button onClick={redirectToRegister}>Register</button>
          <button onClick={redirectToLogin}>Login</button>
          <button onClick={handleGuestLogin}>Play as Guest</button>
        </div>
      )}
    </div>
  );
}

export default UserBtns;
