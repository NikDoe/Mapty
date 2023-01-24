import "./css/style.css";
import MyMap from "./models/Map";

const initApp = (): void => {
	MyMap.instance;
};

document.addEventListener("DOMContentLoaded", initApp);
