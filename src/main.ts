import "./css/style.css";
import MapTemplate from "./templates/MapTemplate";
import FormTemlate from "./templates/FormTemplate";

const initApp = (): void => {
	const map = new MapTemplate();
	const form = new FormTemlate();
	form.render();
	map.render();
};

document.addEventListener("DOMContentLoaded", initApp);
