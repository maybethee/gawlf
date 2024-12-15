import { createConsumer } from "@rails/actioncable";

const cableUrl = import.meta.env.VITE_CABLE_URL || "ws://localhost:3000/cable";
const cable = createConsumer(cableUrl);

export default cable;
