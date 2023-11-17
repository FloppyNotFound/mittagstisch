import { Lunch } from './lunch.interface';

export interface Restaurant {
	getLunch: (dayOfWeek: number) => Promise<Lunch | undefined>;
}
