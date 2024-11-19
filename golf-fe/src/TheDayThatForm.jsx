import { useState, useEffect } from "react";
import { useGame } from "./context/useGame";

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
    <div>
      <form onSubmit={handleRecordDay} action="">
        <label htmlFor="">
          The day that
          <input
            type="text"
            value={theDayThat}
            onChange={(e) => {
              setTheDayThat(e.target.value);
            }}
          />
        </label>
        <button>Submit</button>
      </form>
    </div>
  );
}

export default TheDayThatForm;
