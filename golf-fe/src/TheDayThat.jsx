import { useGame } from "./context/useGame";
import TheDayThatForm from "./TheDayThatForm";
import styles from "./TheDayThat.module.css";
import { Pencil } from "lucide-react";

function TheDayThat() {
  const { recordedTheDayThat, isEditing, setIsEditing } = useGame();

  const handleEditTheDayThat = () => {
    setIsEditing(true);
  };

  return (
    <div>
      <div>
        {isEditing && <TheDayThatForm initialText={recordedTheDayThat} />}
        <div>
          {!isEditing && (
            <div className={styles.the_day_that_display}>
              <h2 className={styles.the_day_that}>
                The day that {recordedTheDayThat}
              </h2>
              <button onClick={handleEditTheDayThat}>
                <Pencil color="#f8e9d6" size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TheDayThat;
