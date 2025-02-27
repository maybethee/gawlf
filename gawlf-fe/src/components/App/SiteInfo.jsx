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
          Made by Raphael Schnee (
          <a href="https://github.com/maybethee">maybethee</a>) for Katy, Jacob,
          and Charlie
        </p>

        <h4>Attributions:</h4>
        <ul>
          <li>
            <a
              href="https://www.flaticon.com/free-icons/spades"
              title="spades icons"
            >
              Spades icons
            </a>{" "}
            and{" "}
            <a
              href="https://www.flaticon.com/free-icons/diamond"
              title="diamond icons"
            >
              Diamond icons
            </a>{" "}
            created by Smashicons - Flaticon
          </li>
          <li>
            Most card backs illustrations and some backgrounds - Designed by{" "}
            <a href="https://www.freepik.com">Freepik</a>
          </li>
          <li>
            Other photos from Unsplash:
            <ul>
              <li>
                <a href="https://unsplash.com/@ninjason">Jason Leung</a> - a
                dark blue area with a white stripe on it
              </li>
              <li>
                <a href="https://unsplash.com/@britishlibrary">
                  British Library
                </a>{" "}
                - waterfalls painting
              </li>
              <li>
                <a href="https://unsplash.com/@pawel_czerwinski">
                  Pawel Czerwinski
                </a>{" "}
                - blue and pink particles illustration
              </li>
              <li>
                <a href="https://unsplash.com/@chrislawton">Chris Lawton</a> -
                body of water
              </li>
              <li>
                <a href="https://unsplash.com/@rosellastudio">
                  Madison Bracaglia
                </a>{" "}
                - white and gray abstract painting
              </li>
              <li>
                <a href="https://unsplash.com/@tirzavandijk">Tirza van Dijk</a>{" "}
                - brown and beige cloth
              </li>
              <li>
                <a href="https://unsplash.com/@ethanscoot">Ethan Schut</a> -
                yellow flowers in bloom during daytime
              </li>
              <li>
                <a href="https://unsplash.com/@carolineelisabeth">
                  Caroline McFarland
                </a>{" "}
                - a bunch of green leaves with water droplets on them
              </li>
              <li>
                <a href="https://unsplash.com/@xcrap">César Couto</a> - a couple
                of cows standing on top of a grass covered field
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SiteInfo;
