import Slider from "@mui/material/Slider";

function AudioSlider({ value, onValueChange }) {
  const handleChange = (event, newVal) => {
    onValueChange(newVal);
  };

  return (
    <Slider
      style={{ width: 300 }}
      value={value}
      onChange={handleChange}
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
            backgroundColor: "darkgray",
          },
        },
        "& .MuiSlider-rail": {
          backgroundColor: "lightgray",
        },
        "& .MuiSlider-track": {
          display: "none",
        },
      }}
    />
  );
}

export default AudioSlider;
