import { Map, tileLayer } from "leaflet";

export default class MyMap {
	private map: Map;
	private zoom: number = 14;
	private constructor(private _el: HTMLElement) {
		this.map = new Map(this._el);
	}

	async loadMap(): Promise<void> {
		const { coords } = await new Promise<GeolocationPosition>((res, rej) => {
			navigator.geolocation.getCurrentPosition(res, rej);
		});

		this.map.setView([coords.latitude, coords.longitude], this.zoom);

		tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.map);
	}
}
