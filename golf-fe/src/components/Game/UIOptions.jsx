import { useEffect, useState } from "react";
import { ArrowRightToLine, ArrowLeftFromLine } from "lucide-react";
import styles from "./UIOptions.module.css";
import AudioSlider from "./AudioSlider";
import { useAudio } from "../../context/useAudio";

function UIOptions({ updateBackground, backgrounds }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectionToggle, setSelectionToggle] = useState(true);
  const [cardBackUrl, setCardBackUrl] = useState("/assets/card-back-9.jpg");
  const { globalVolume, setGlobalVolume } = useAudio();

  const toggleDrawer = () => {
    setIsOpen((prev) => !prev);
  };

  const handleBackgroundChange = (name) => {
    updateBackground(backgrounds[name]);
  };

  useEffect(() => {
    console.log("Updating card back:", cardBackUrl); // Debugging line

    document.documentElement.style.setProperty(
      "--card-back",
      `url(${cardBackUrl})`
    );
  }, [cardBackUrl]);

  const cardBacks = {
    traditional: "/assets/card-back-9.jpg",
    squiggle: "/assets/card-back-1.png",
    abstract: "/assets/card-back-2.jpg",
    fabric: "/assets/card-back-4.jpg",
    blobs: "/assets/card-back-5.jpg",
    waterfall: "/assets/card-back-6.jpg",
    geometric: "/assets/card-back-7.jpg",
    halftone: "/assets/card-back-8.png",
    odo: "/assets/card-back-10.png",
  };

  const handleCardBackChange = (key) => {
    const newUrl = cardBacks[key];
    setCardBackUrl(newUrl);
  };

  const handleVolumeChange = (newValue) => {
    setGlobalVolume(newValue / 100);
  };

  return (
    <div
      className={`${styles.drawer_container} ${
        isOpen ? styles.open : styles.closed
      }`}
    >
      <div className={styles.selection_drawer}>
        <div className={styles.category_btns}>
          <button
            className={selectionToggle ? styles.selected_category : ""}
            onClick={() => setSelectionToggle(true)}
          >
            Card Backs
          </button>
          <button
            className={!selectionToggle ? styles.selected_category : ""}
            onClick={() => setSelectionToggle(false)}
          >
            Backgrounds
          </button>
        </div>

        {selectionToggle ? (
          <div className={styles.options_selection}>
            <ul>
              {Object.keys(cardBacks).map((key) => (
                <li key={key}>
                  <button onClick={() => handleCardBackChange(key)}>
                    {key}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={styles.options_selection}>
            <ul>
              {Object.keys(backgrounds).map((key) => (
                <li key={key}>
                  <button onClick={() => handleBackgroundChange(key)}>
                    {key}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <AudioSlider
            value={globalVolume * 100}
            onValueChange={handleVolumeChange}
          />
        </div>
      </div>
      <div className={styles.tab} onClick={toggleDrawer}>
        {isOpen ? (
          <ArrowRightToLine size={32} strokeWidth={2} />
        ) : (
          <ArrowLeftFromLine size={32} strokeWidth={2} />
        )}
      </div>
    </div>
  );
}

export default UIOptions;
