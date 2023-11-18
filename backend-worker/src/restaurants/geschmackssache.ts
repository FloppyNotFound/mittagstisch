import parse from 'node-html-parser';
import { Lunch } from '../models/lunch.interface';

const url = 'https://geschmackssache-leipzig.de/';

const getLunch = async (dayOfWeek: number): Promise<Lunch | undefined> => {
	const fetchResponse = await fetch(url);
	const html = await fetchResponse.text();
	const bic = toLunch(html, dayOfWeek);

	return bic;
};

const toLunch = (html: string, dayOfWeek: number): Lunch | undefined => {
	if ([0, 6].includes(dayOfWeek)) {
		return void 0;
	}

	const dom = parse(html);

	const wochenkartenTags = dom.querySelectorAll('.wochenkarte');
	if (!wochenkartenTags.length) {
		return void 0;
	}

	const rootNodes = wochenkartenTags[0].getElementsByTagName('tr');
	if (!rootNodes.length) {
		return void 0;
	}

	if (rootNodes.length < dayOfWeek - 1) {
		return void 0;
	}

	const dayOfWeekGeschmackssache = dayOfWeek - 1;
	const dayNode = rootNodes[dayOfWeekGeschmackssache];

	const dayInfos = dayNode.getElementsByTagName('td');
	if (dayInfos.length !== 3) {
		return void 0;
	}

	const food = dayInfos[1].textContent;
	const price = dayInfos[2].textContent;

	const lunch = toLunchModel(food, price);

	return lunch;
};

const toLunchModel = (food: string, price: string): Lunch => {
	return {
		bistroName: `Geschmackssache Leipzig`,
		meal: `${food} ${price}`,
		pdfLink: '',
		price,
		status: '',
	};
};

export default getLunch;
