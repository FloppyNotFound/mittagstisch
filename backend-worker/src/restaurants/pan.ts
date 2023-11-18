import parse from 'node-html-parser';
import { Lunch } from '../models/lunch.interface';

const url = 'https://www.pan-leipzig.de/SPEISEKARTEN/Mittag/';

const getLunch = async (dayOfWeek: number): Promise<Lunch | undefined> => {
	const fetchResponse = await fetch(url);
	const html = await fetchResponse.text();
	const bic = toLunch(html, dayOfWeek);

	return bic;
};

function toLunch(html: string, dayOfWeek: number): Lunch | undefined {
	const dom = parse(html);

	const pdfRootNode = dom.querySelector('.wdn-pricelist-links');
	const links = pdfRootNode?.getElementsByTagName('a');

	if (!links || links.length < 2) {
		return void 0;
	}

	const pdfUrl = links[1].getAttribute('href');
	if (!pdfUrl) {
		return void 0;
	}

	const pdfHref = new URL(pdfUrl, url).href;

	const lunch = toLunchModel('', pdfHref);

	return lunch;
}

const toLunchModel = (food: string, pdfHref: string): Lunch => {
	return {
		bistroName: `Pan`,
		meal: food,
		pdfLink: pdfHref,
		price: '',
		status: '',
	};
};

export default getLunch;
