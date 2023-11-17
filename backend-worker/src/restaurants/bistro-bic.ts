import parse from 'node-html-parser';
import { Lunch } from '../models/lunch.interface';

enum WeekOfDayMap {
	'Sonntag',
	'Montag',
	'Dienstag',
	'Mittwoch',
	'Donnerstag',
	'Freitag',
	'Samstag',
}

const url = 'http://www.bistro-bic.de/Speiseplan/';

const getLunch = async (dayOfWeek: number): Promise<Lunch | undefined> => {
	const fetchResponse = await fetch(url);
	const html = await fetchResponse.text();
	const bic = toLunch(html, dayOfWeek);

	return bic;
};

const toLunch = (html: string, dayOfWeek: number): Lunch | undefined => {
	const dayOfWeekBic = WeekOfDayMap[dayOfWeek];

	const dom = parse(html);
	const rootNodes = dom.querySelector('.content_main_dho')?.getElementsByTagName('p');
	if (!rootNodes) {
		return void 0;
	}

	const foodPerDay: Record<string, string> = {};
	rootNodes.forEach((dayNode) => {
		const day = dayNode.getElementsByTagName('strong');
		if (!day.length) {
			return;
		}

		const food = dayNode.getElementsByTagName('span');
		if (!food.length) {
			return;
		}

		const dayName = day[0].text.trim();
		foodPerDay[dayName] = food[0].innerHTML
			.split('</strong>')[1]
			.split('<br>')
			// First <br> is an empty item and can be skipped
			.filter((_, i) => !!i)
			.join('<br>');
	});

	const lunch = Object.keys(foodPerDay)
		.filter((key) => key === dayOfWeekBic)
		.map((key) => {
			const food = foodPerDay[key];

			return toLunchModel(food);
		})[0];

	return lunch;
};

const toLunchModel = (food: string): Lunch => {
	return {
		bistroName: `Bistro BIC`,
		meal: food,
		pdfLink: '',
		price: '',
		status: '',
	};
};

export default getLunch;
