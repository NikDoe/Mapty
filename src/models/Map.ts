import { Map, tileLayer } from "leaflet";
interface IMap {
	map: Map;
}

export default class MyMap implements IMap {
	static instance: MyMap = new MyMap();

	public map: Map = new Map("map");

	private constructor() {
		this.getPosition();
	}

	async getPosition() {
		const { coords } = await new Promise<GeolocationPosition>((res, rej) => {
			navigator.geolocation.getCurrentPosition(res, rej);
		});

		this.loadMap(coords);
	}

	loadMap(coords: GeolocationCoordinates) {
		const lat = coords.latitude;
		const lng = coords.longitude;

		this.map.setView([lat, lng], 13);

		tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.map);
	}
}
