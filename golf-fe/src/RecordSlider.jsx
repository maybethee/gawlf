import Slider from "@mui/material/Slider";

function RecordSlider({ value, onValueChange, maxGames }) {
  const handleChange = (event, newVal) => {
    onValueChange(newVal);
  };

  return (
    <Slider
      style={{ width: 400 }}
      value={value}
      onChange={handleChange}
      min={0}
      max={maxGames}
      aria-label="Game History Slider"
      sx={{
        height: 20, // Thickness of the rail
        borderRadius: 5, // Remove rounded edges
        "& .MuiSlider-thumb": {
          height: 20, // Match the rail height
          width: 40, // Make the thumb wide like a scroll bar
          borderRadius: 3, // Square edges for the thumb
          backgroundColor: "gray", // Thumb color
          boxShadow: "none", // Remove shadow for a flat look
          "&:hover, &.Mui-focusVisible": {
            backgroundColor: "darkgray", // Thumb color on hover/focus
          },
        },
        "& .MuiSlider-rail": {
          backgroundColor: "lightgray", // Rail color
        },
        "& .MuiSlider-track": {
          display: "none", // Hide the track
        },
      }}
    />
  );
}

export default RecordSlider;
