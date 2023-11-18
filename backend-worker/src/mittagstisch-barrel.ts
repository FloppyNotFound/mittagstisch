import { Lunch } from './models/lunch.interface';
import { Restaurant } from './models/restaurant.interface';
import bicLunch from './restaurants/bistro-bic';
import geschmackssacheLunch from './restaurants/geschmackssache';
import bistroAmKanalLunch from './restaurants/bistro-am-kanal';

const restaurants: Restaurant[] = [
	{
		getLunch: bicLunch,
	},
	{
		getLunch: geschmackssacheLunch,
	},
	{
		getLunch: bistroAmKanalLunch,
	},
];

export default {
	async fetch(dayOfWeek: number): Promise<Lunch[]> {
		const lunches = await Promise.all(restaurants.map((res) => res.getLunch(dayOfWeek)));

		return lunches.filter((l) => !!l).map((l) => <Lunch>l);
	},
};
