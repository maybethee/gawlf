import { useState, useEffect } from "react";
import { getCurrentUser } from "./api";

function UserBtns({ setUser }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
      setUser(user);
    };

    checkAuth();
  }, [setUser]);

  const redirectToRegister = () => {
    window.location.href = "http://localhost:3000/users/sign_up";
  };

  const redirectToLogin = () => {
    window.location.href = "http://localhost:3000/users/sign_in";
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Logged in!</p>
      ) : (
        <div>
          <button onClick={redirectToRegister}>Register</button>
          <button onClick={redirectToLogin}>Login</button>
        </div>
      )}
    </div>
  );
}

export default UserBtns;
