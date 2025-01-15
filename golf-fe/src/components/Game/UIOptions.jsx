import { useEffect, useState } from "react";
import { ArrowRightToLine, Settings } from "lucide-react";
import styles from "./UIOptions.module.css";
import AudioSlider from "./AudioSlider";
import { useAudio } from "../../context/useAudio";
import { Volume1, Volume2 } from "lucide-react";

function UIOptions({ updateBackground, backgrounds }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cardBackUrl, setCardBackUrl] = useState("/assets/card-back-9.jpg");
  const { globalVolume, setGlobalVolume } = useAudio();

  const toggleDrawer = () => {
    setIsOpen((prev) => !prev);
  };

  const handleBackgroundChange = (event) => {
    updateBackground(event.target.value);
  };

  useEffect(() => {
    console.log("Updating card back:", cardBackUrl);

    document.documentElement.style.setProperty(
      "--card-back",
      `url(${cardBackUrl})`
    );
  }, [cardBackUrl]);

  const cardBacks = [
    { value: "/assets/card-back-9.jpg", label: "traditional" },
    { value: "/assets/card-back-1.png", label: "squiggle" },
    { value: "/assets/card-back-2.jpg", label: "abstract" },
    { value: "/assets/card-back-4.jpg", label: "fabric" },
    { value: "/assets/card-back-5.jpg", label: "blobs" },
    { value: "/assets/card-back-6.jpg", label: "waterfall" },
    { value: "/assets/card-back-7.jpg", label: "geometric" },
    { value: "/assets/card-back-8.png", label: "halftone" },
    { value: "/assets/card-back-10.png", label: "odo" },
  ];

  const handleCardBackChange = (event) => {
    const newUrl = event.target.value;
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
        <div className={styles.options_selection}>
          <div className={styles.option_container}>
            <h3>Card Backs</h3>
            <form action="">
              <select name="" id="" onChange={handleCardBackChange}>
                {cardBacks.map((style) => {
                  return (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  );
                })}
              </select>
            </form>
          </div>

          <div className={styles.option_container}>
            <h3>Backgrounds</h3>
            <form action="">
              <select name="" id="" onChange={handleBackgroundChange}>
                {backgrounds.map((background) => {
                  return (
                    <option key={background.value} value={background.value}>
                      {background.label}
                    </option>
                  );
                })}
              </select>
            </form>
          </div>

          <div className={styles.option_container}>
            <h3>Audio Volume</h3>
            <div className={styles.slider_container}>
              <span>
                <Volume1 />
              </span>
              <AudioSlider
                value={globalVolume * 100}
                onValueChange={handleVolumeChange}
              />
              <span>
                <Volume2 />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.tab} onClick={toggleDrawer}>
        {isOpen ? (
          <ArrowRightToLine size={32} strokeWidth={2} />
        ) : (
          <Settings size={32} strokeWidth={2} />
        )}
      </div>
    </div>
  );
}

export default UIOptions;
