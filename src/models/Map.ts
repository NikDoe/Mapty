import { Map, tileLayer } from "leaflet";

export default class MyMap {
	constructor(private _el: HTMLElement, private zoom: number = 14) {
		this.loadMap();
	}

	async loadMap(): Promise<void> {
		const { coords } = await new Promise<GeolocationPosition>((res, rej) => {
			navigator.geolocation.getCurrentPosition(res, rej);
		});

		const map = new Map(this._el);
		map.setView([coords.latitude, coords.longitude], this.zoom);

		tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map);
	}
}
