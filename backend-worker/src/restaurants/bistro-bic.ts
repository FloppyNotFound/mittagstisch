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

const toLunch = (html: string, dayOfWeek: number): Lunch => {
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
				price: '0',
				status: '',
			};
		})[0];

	return lunch;
};

export default toLunch;
