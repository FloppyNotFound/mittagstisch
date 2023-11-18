import parse from 'node-html-parser';
import { Lunch } from '../models/lunch.interface';

const url = 'https://www.philippus-leipzig.de/catering/cafeteria-m9/';

const getLunch = async (dayOfWeek: number): Promise<Lunch | undefined> => {
	const fetchResponse = await fetch(url);
	const html = await fetchResponse.text();
	const bic = toLunch(html, dayOfWeek);

	return bic;
};

const toLunch = (html: string, _: number) => {
	const dom = parse(html);

	const links = dom.querySelector('.content--small')?.getElementsByTagName('a');

	if (!links?.length) {
		return void 0;
	}

	const pdfUrl = links[0].getAttribute('href');
	if (!pdfUrl) {
		return void 0;
	}

	const pdfHref = new URL(pdfUrl, url).href;

	const lunch = toLunchModel(pdfHref);

	return lunch;
};

const toLunchModel = (pdfLink: string): Lunch => {
	return {
		bistroName: `Cafeteria M9`,
		meal: '',
		pdfLink,
		price: '',
		status: '',
	};
};

export default getLunch;
