import { useState, useEffect } from "react";
import { getCurrentUser, createGuest } from "./api";
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
    <div className={styles.container}>
      {isAuthenticated ? (
        <p>Logged in!</p>
      ) : (
        <div className={styles.btns_container}>
          <button disabled onClick={redirectToRegister}>
            Register
          </button>
          <button disabled onClick={redirectToLogin}>
            Login
          </button>
          <button onClick={handleGuestLogin}>Play as Guest</button>
        </div>
      )}
    </div>
  );
}

export default UserBtns;
