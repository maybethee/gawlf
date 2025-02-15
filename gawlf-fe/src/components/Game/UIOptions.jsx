import { useEffect, useState } from "react";
import { ArrowRightToLine, Settings } from "lucide-react";
import styles from "./UIOptions.module.css";
import AudioSlider from "./AudioSlider";
import { useAudio } from "../../context/useAudio";
import { Volume1, Volume2 } from "lucide-react";
import { updateUserConfig } from "../../utils/api";

function UIOptions({
  updateBackground,
  backgrounds,
  backgroundUrl,
  userId,
  userConfig,
  updatedConfig,
  setUpdatedConfig,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [cardBackUrl, setCardBackUrl] = useState("/assets/card-back-9.jpg");
  const { globalVolume, setGlobalVolume } = useAudio();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    console.log("user config in ui options:", userConfig);
    if (userConfig) {
      if (userConfig?.all_audio_notifications !== undefined) {
        setChecked(userConfig.all_audio_notifications);
      }
      if (userConfig?.card_back_url !== undefined) {
        setCardBackUrl(userConfig.card_back_url);
      }
      if (userConfig?.global_volume !== undefined) {
        setGlobalVolume(userConfig.global_volume / 100);
      }
      setUpdatedConfig(userConfig);
    }
  }, [userConfig]);

  const handleCheckboxChange = () => {
    const newCheckedValue = !checked;
    setChecked(newCheckedValue);

    const newConfig = {
      ...updatedConfig,
      all_audio_notifications: newCheckedValue,
    };

    setUpdatedConfig(newConfig);

    updateUserConfig(userId, newConfig);
  };

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

    const newConfig = {
      ...updatedConfig,
      card_back_url: newUrl,
    };

    setUpdatedConfig(newConfig);

    updateUserConfig(userId, newConfig);
  };

  const handleVolumeChange = (newValue) => {
    setGlobalVolume(newValue / 100);
  };

  const handleVolumeRelease = (newValue) => {
    const newConfig = {
      ...updatedConfig,
      global_volume: newValue,
    };

    setUpdatedConfig(newConfig);

    updateUserConfig(userId, newConfig);
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
            <h3>Card Back</h3>
            <form action="">
              <select
                name=""
                id=""
                onChange={handleCardBackChange}
                value={cardBackUrl}
              >
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
            <h3>Background</h3>
            <form action="">
              <select
                name=""
                id=""
                onChange={handleBackgroundChange}
                value={backgroundUrl}
              >
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
            <h3>Volume</h3>
            <div className={styles.slider_container}>
              <span>
                <Volume1 />
              </span>
              <AudioSlider
                value={globalVolume * 100}
                onValueChange={handleVolumeChange}
                onRelease={handleVolumeRelease}
              />
              <span>
                <Volume2 />
              </span>
            </div>
          </div>

          <div id="checkbox-div">
            <input
              type="checkbox"
              checked={checked}
              onChange={handleCheckboxChange}
            />
            <label>
              Always play notification audio on your turn (unchecked: only when
              tabbed out)
            </label>
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
