import { StrictMode, useState } from "react";
import UserBtns from "./UserBtns";
import App from "./App";
import { GameProvider } from "./context/GameProvider";
import styles from "./Root.module.css";

function Root() {
  const [user, setUser] = useState(null);

  return (
    <StrictMode>
      {/* <> */}

      <div className={styles.main_container}>
        {!user ? (
          <div className={styles.user_btns_container}>
            <UserBtns setUser={setUser} />
          </div>
        ) : (
          <div>
            <div className={styles.user_btns_container}>
              <UserBtns setUser={setUser} />
            </div>
            <div className={styles.app_container}>
              <GameProvider>
                <App userId={user?.id} />
              </GameProvider>
            </div>
          </div>
        )}
      </div>
      {/* </> */}
    </StrictMode>
  );
}

export default Root;
