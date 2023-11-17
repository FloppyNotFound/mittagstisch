import { Lunch } from './models/lunch.interface';
import bicLunch from './restaurants/bistro-bic';

const restaurants: [Restaurant] = [
	{
		getLunch: bicLunch,
	},
];

export default {
	async fetch(dayOfWeek: number, request: Request, env: Env, ctx: ExecutionContext): Promise<Lunch[]> {
		const lunches = await Promise.all(restaurants.map((res) => res.getLunch(dayOfWeek)));

		return lunches.filter((l) => !!l).map((l) => <Lunch>l);
	},
};
