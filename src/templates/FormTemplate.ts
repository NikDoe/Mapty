interface Iinputs {
	[key: string]: string | string[];
}

const inputs: Iinputs = {
	Type: ["running", "cycling"],
	Duration: "min",
	Distance: "km",
	Cadence: "step/min",
	Gain: "meters",
};

interface IForm {
	body: HTMLBodyElement;
	render(): void;
	show(): void;
	hide(): void;
}

export default class FormTemlate implements IForm {
	constructor(public body: HTMLBodyElement = document.body as HTMLBodyElement) {}

	render(): void {
		const form = document.createElement("form") as HTMLFormElement;
		form.className = "workout-form";
		for (const key in inputs) {
			const div = document.createElement("div");
			div.className = "form-row";
			if (key === "Gain") div.className = ["form-row", "hide"].join(" ");

			const label = document.createElement("label") as HTMLLabelElement;
			label.htmlFor = key;
			label.className = "form-label";
			label.textContent = key;
			div.append(label);

			if (typeof inputs[key] !== "string") {
				const select = document.createElement("select") as HTMLSelectElement;
				select.className = "select-form";
				select.name = key;
				select.id = key;
				for (const str of inputs[key]) {
					const option = document.createElement("option") as HTMLOptionElement;
					option.value = str;
					option.textContent = str;

					select.append(option);
				}
				div.append(select);
				select.addEventListener("change", this.toggle);
			} else {
				const input = document.createElement("input") as HTMLInputElement;
				input.className = "form-input";
				input.id = key;
				input.type = "text";
				input.maxLength = 5;
				div.append(input);
			}

			form.append(div);
		}
		this.body.append(form);
	}

	show(): void {}

	hide(): void {}

	toggle(): void {
		const cadence = document.getElementById("Cadence") as HTMLInputElement;
		const gain = document.getElementById("Gain") as HTMLInputElement;
		cadence.closest(".form-row")?.classList.toggle("hide");
		gain.closest(".form-row")?.classList.toggle("hide");
	}
}
