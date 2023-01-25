import MyMap from "../models/Map";

interface DOMMap {
	body: HTMLBodyElement;
	render(): void;
}

export default class MapTemplate implements DOMMap {
	constructor(public body: HTMLBodyElement = document.body as HTMLBodyElement) {}

	render(): void {
		const div = document.createElement("div") as HTMLDivElement;
		div.id = "map";
		this.body.append(div);
		const map = new MyMap(div);
		map.loadMap();
	}
}
