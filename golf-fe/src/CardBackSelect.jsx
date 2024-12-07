import { useEffect, useState } from "react";

function CardBackSelect({ updateBackground, backgrounds }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectionToggle, setSelectionToggle] = useState(true);
  const [cardBackUrl, setCardBackUrl] = useState("/assets/card-back-1.png");

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
    squiggle: "/assets/card-back-1.png",
    abstract: "/assets/card-back-2.jpg",
    oil: "/assets/card-back-3.jpg",
    fabric: "/assets/card-back-4.jpg",
    pheasant: "/assets/card-back-5.jpg",
    waterfall: "/assets/card-back-6.jpg",
    geometric: "/assets/card-back-7.jpg",
    halftone: "/assets/card-back-8.png",
    fox: "/assets/card-back-9.jpg",
    odo: "/assets/card-back-10.png",
    armor: "/assets/card-back-11.jpg",
  };

  const handleCardBackChange = (key) => {
    const newUrl = cardBacks[key];
    setCardBackUrl(newUrl);
  };

  return (
    <div className={`drawer-container ${isOpen ? "open" : "closed"}`}>
      <div className="card-back-drawer">
        <button
          className={`${selectionToggle ? "selected-category" : ""}`}
          onClick={() => setSelectionToggle(true)}
        >
          Card Backs
        </button>
        <button
          className={`${!selectionToggle ? "selected-category" : ""}`}
          onClick={() => setSelectionToggle(false)}
        >
          Backgrounds
        </button>

        {selectionToggle ? (
          <div className="options-selection">
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
          <div className="options-selection">
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
      </div>
      <div className="tab" onClick={toggleDrawer}>
        {isOpen ? ">" : "<"}
      </div>
    </div>
  );
}

export default CardBackSelect;
