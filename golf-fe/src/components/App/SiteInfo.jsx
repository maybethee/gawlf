import styles from "./SiteInfo.module.css";

function SiteInfo({ setViewingInfo }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Site Info</h3>
        <button onClick={() => setViewingInfo(false)}>x</button>
      </div>
      <div className={styles.credits}>
        <p>
          Made by <a href="https://github.com/maybethee">maybethee</a>
        </p>

        <p>Favicons:</p>
        <ul>
          <li>
            <a
              href="https://www.flaticon.com/free-icons/spades"
              title="spades icons"
            >
              Spades icons
            </a>{" "}
            created by Smashicons - Flaticon
          </li>
          <li>
            <a
              href="https://www.flaticon.com/free-icons/diamond"
              title="diamond icons"
            >
              Diamond icons
            </a>{" "}
            created by Smashicons - Flaticon
          </li>
        </ul>

        <p>
          Most card backs illustrations, as well as some backgrounds - Designed
          by <a href="https://www.freepik.com">Freepik</a>
        </p>
        <p>Other photos from Unsplash:</p>
        <ul>
          <li>
            <a href="https://unsplash.com/@ninjason">Jason Leung</a> - a dark
            blue area with a white stripe on it
          </li>
          <li>
            <a href="https://unsplash.com/@britishlibrary">British Library</a> -
            waterfalls painting
          </li>
          <li>
            <a href="https://unsplash.com/@pawel_czerwinski">
              Pawel Czerwinski
            </a>{" "}
            - blue and pink particles illustration
          </li>
          <li>
            <a href="https://unsplash.com/@chrislawton">Chris Lawton</a> - body
            of water
          </li>
          <li>
            <a href="https://unsplash.com/@rosellastudio">Madison Bracaglia</a>{" "}
            - white and gray abstract painting
          </li>
          <li>
            <a href="https://unsplash.com/@tirzavandijk">Tirza van Dijk</a> -
            brown and beige cloth
          </li>
          <li>
            <a href="https://unsplash.com/@ethanscoot">Ethan Schut</a> - yellow
            flowers in bloom during daytime
          </li>
          <li>
            <a href="https://unsplash.com/@carolineelisabeth">
              Caroline McFarland
            </a>{" "}
            - a bunch of green leaves with water droplets on them
          </li>
          <li>
            <a href="https://unsplash.com/@xcrap">César Couto</a> - a couple of
            cows standing on top of a grass covered field
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SiteInfo;
