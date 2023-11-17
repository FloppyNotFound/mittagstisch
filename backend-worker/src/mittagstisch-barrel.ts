import { Lunch } from './models/lunch.interface';
import toLunch from './restaurants/bistro-bic';

export default {
	async fetch(dayOfWeek: number, request: Request, env: Env, ctx: ExecutionContext): Promise<Lunch[]> {
		const url = 'http://www.bistro-bic.de/Speiseplan/';
		const fetchResponse = await fetch(url);
		const html = await fetchResponse.text();

		const res: Lunch[] = [toLunch(html, dayOfWeek)];

		return res;
	},
};
