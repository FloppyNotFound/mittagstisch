import { Lunch } from './models/lunch.interface';
import { Restaurant } from './models/restaurant.interface';
import bicLunch from './restaurants/bistro-bic';

const restaurants: Restaurant[] = [
	{
		getLunch: bicLunch,
	},
];

export default {
	async fetch(dayOfWeek: number): Promise<Lunch[]> {
		const lunches = await Promise.all(restaurants.map((res) => res.getLunch(dayOfWeek)));

		return lunches.filter((l) => !!l).map((l) => <Lunch>l);
	},
};
