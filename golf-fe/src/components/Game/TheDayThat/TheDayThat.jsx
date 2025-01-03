import { useState } from "react";
import { useGame } from "../../../context/useGame";
import TheDayThatForm from "./TheDayThatForm";
import styles from "./TheDayThat.module.css";
import { Pencil, NotebookPen, ArrowUpToLine } from "lucide-react";

function TheDayThat() {
  const { recordedTheDayThat, isEditing, setIsEditing } = useGame();

  const handleEditTheDayThat = () => {
    setIsEditing(true);
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className={`${styles.the_day_that_container} ${
        isOpen ? styles.open : styles.closed
      }`}
    >
      <div className={styles.tab} onClick={toggleDrawer}>
        {isOpen ? (
          <ArrowUpToLine size={28} color="#fbe9d2" />
        ) : (
          <NotebookPen size={28} color="#fbe9d2" />
        )}
      </div>
      <div className={styles.the_day_that}>
        {isEditing && <TheDayThatForm initialText={recordedTheDayThat} />}
        <div>
          {!isEditing && (
            <div className={styles.the_day_that_display}>
              <h2 className={styles.the_day_that_text}>
                The day that {recordedTheDayThat}
              </h2>
              <span onClick={handleEditTheDayThat}>
                <Pencil color="#f8e9d6" size={20} />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TheDayThat;
