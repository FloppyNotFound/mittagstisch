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

const getLunch = async (dayOfWeek: number): Promise<Lunch | undefined> => {
	const url = 'http://www.bistro-bic.de/Speiseplan/';
	const fetchResponse = await fetch(url);
	const html = await fetchResponse.text();
	const bic = toLunch(html, dayOfWeek);

	return bic;
};

const toLunch = (html: string, dayOfWeek: number): Lunch | undefined => {
	const dayOfWeekBic = WeekOfDayMap[dayOfWeek];

	const dom = parse(html);
	const rootNodes = dom.querySelector('.content_main_dho')?.getElementsByTagName('p');

	const map: Record<string, string> = {};
	rootNodes?.forEach((dayNode) => {
		const day = dayNode.getElementsByTagName('strong');
		if (!day.length) {
			return;
		}

		const food = dayNode.getElementsByTagName('span');
		if (!food.length) {
			return;
		}

		const dayName = day[0].text.trim();

		map[dayName] = food[0].innerHTML
			.split('</strong>')[1]
			.split('<br>')
			.filter((_, i) => !!i)
			.join('<br>');
	});

	const lunch: Lunch = Object.keys(map)
		.filter((key) => key === dayOfWeekBic)
		.map((key) => {
			const food = map[key];

			return {
				bistroName: `Bistro BIC`,
				meal: food,
				pdfLink: '',
				price: '',
				status: '',
			};
		})[0];

	return lunch;
};

export default getLunch;
