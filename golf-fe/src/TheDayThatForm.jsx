import { useState, useEffect } from "react";
import { useGame } from "./context/useGame";
import styles from "./TheDayThatForm.module.css";

function TheDayThatForm({ initialText }) {
  const { performAction } = useGame();
  const [theDayThat, setTheDayThat] = useState("");

  useEffect(() => {
    setTheDayThat(initialText);
  }, [initialText]);

  const handleRecordDay = (e) => {
    e.preventDefault();

    if (!theDayThat) {
      return;
    }

    performAction("record_day", { the_day_that: theDayThat });
  };

  return (
    <div className={styles.form_container}>
      <form className={styles.form} onSubmit={handleRecordDay} action="">
        <label htmlFor="">The day that</label>
        <input
          type="text"
          value={theDayThat}
          onChange={(e) => {
            setTheDayThat(e.target.value);
          }}
        />
        <button>Update</button>
      </form>
    </div>
  );
}

export default TheDayThatForm;
