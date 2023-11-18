import parse from 'node-html-parser';
import { Lunch } from '../models/lunch.interface';

const url = 'https://buschmannle.wixsite.com/meinewebsite/wochenkarte';

const getLunch = async (dayOfWeek: number): Promise<Lunch | undefined> => {
	const fetchResponse = await fetch(url);
	const html = await fetchResponse.text();
	const bic = toLunch(html, dayOfWeek);

	return bic;
};

const toLunch = (html: string, _: number) => {
	const dom = parse(html);

	const pdfButton = dom.querySelector('.wixui-button');

	if (!pdfButton) {
		return void 0;
	}

	const pdfHref = pdfButton.getAttribute('href');
	if (!pdfHref) {
		return void 0;
	}

	const lunch = toLunchModel(pdfHref);

	return lunch;
};

const toLunchModel = (pdfLink: string): Lunch => {
	return {
		bistroName: `Bistro am Kanal`,
		meal: '',
		pdfLink,
		price: '',
		status: '',
	};
};

export default getLunch;
