import { Lunch } from './models/lunch.interface';
import getLunch from './restaurants/bistro-bic';

export default {
	async fetch(dayOfWeek: number, request: Request, env: Env, ctx: ExecutionContext): Promise<Lunch[]> {
		const lunches: Lunch[] = [];

		const bic = await getLunch(dayOfWeek);
		lunches.push(bic);

		return lunches;
	},
};
