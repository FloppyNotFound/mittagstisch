import mittagstischBarrel from './mittagstisch-barrel';
import { Lunch } from './models/lunch.interface';

const defaultHeaders: HeadersInit = {
	'content-type': 'application/json;charset=UTF-8',
	'Access-Control-Allow-Origin': 'http://localhost:4200',
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		let json: Lunch[];

		const dayOfWeek = new Date().getDay();

		// You can get pretty far with simple logic like if/switch-statements
		switch (url.pathname) {
			case '/today':
				json = await mittagstischBarrel.fetch(dayOfWeek);
				break;
			case '/tommorow':
				json = await mittagstischBarrel.fetch(dayOfWeek);
				break;
			default:
				json = [];
		}

		const response = new Response(JSON.stringify(json), {
			status: 200,
			headers: defaultHeaders,
		});

		return response;
	},
};
