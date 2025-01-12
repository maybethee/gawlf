import { StrictMode, useState } from "react";
import UserBtns from "./components/App/UserBtns";
import App from "./components/App/App";
import { GameProvider } from "./context/GameProvider";
import styles from "./Root.module.css";

function Root() {
  const [user, setUser] = useState(null);

  return (
    // <StrictMode>
    <div className={styles.main_container}>
      {!user && (
        <div className={styles.user_btns_container}>
          <UserBtns setUser={setUser} />
        </div>
      )}

      <div
        style={{ opacity: !user ? ".3" : "1", transition: "opacity .7s" }}
        className={styles.app_container}
      >
        <GameProvider>
          <App userId={user?.id} guest={user?.guest} />
        </GameProvider>
      </div>
    </div>
    // {/* </StrictMode> */}
  );
}

export default Root;
