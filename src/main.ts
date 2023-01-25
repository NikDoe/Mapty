import "./css/style.css";
import MapTemplate from "./templates/MapTemplate";

const initApp = (): void => {
	const map = new MapTemplate();
	map.render();
};

document.addEventListener("DOMContentLoaded", initApp);
