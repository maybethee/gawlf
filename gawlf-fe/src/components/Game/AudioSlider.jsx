import { useEffect, useRef } from "react";
import Slider from "@mui/material/Slider";
import placeSound from "/assets/place.mp3";

function AudioSlider({ value, onValueChange, onRelease }) {
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(placeSound);
    audioRef.current.preload = "auto";
    return () => {
      audioRef.current = null;
    };
  }, []);

  const handleChange = (event, newVal) => {
    onValueChange(newVal);
  };

  const handleMouseRelease = (event, newVal) => {
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }

    onRelease(newVal);
  };

  return (
    <Slider
      style={{ width: 150 }}
      value={value}
      onChange={handleChange}
      onChangeCommitted={handleMouseRelease}
      min={0}
      max={100}
      aria-label="Audio Volume Slider"
      sx={{
        height: 5,
        borderRadius: 5,
        "& .MuiSlider-thumb": {
          height: 18,
          width: 18,
          borderRadius: 50,
          backgroundColor: "gray",
          boxShadow: "none",
          "&:hover, &.Mui-focusVisible": {
            backgroundColor: "#374151",
          },
        },
        "& .MuiSlider-rail": {
          backgroundColor: "#e11d47",
        },
        "& .MuiSlider-track": {
          display: "none",
        },
      }}
    />
  );
}

export default AudioSlider;
