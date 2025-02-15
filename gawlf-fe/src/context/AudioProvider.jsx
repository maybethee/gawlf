import { useState } from "react";
import { AudioContext } from "./AudioContext";

export const AudioProvider = ({ children }) => {
  const [globalVolume, setGlobalVolume] = useState(0.5);

  return (
    <AudioContext.Provider value={{ globalVolume, setGlobalVolume }}>
      {children}
    </AudioContext.Provider>
  );
};
