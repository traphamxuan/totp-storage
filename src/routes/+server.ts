import { totpService } from '$lib/server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		// Load the first 100 TOTP entries
		const result = await totpService.listTOTPEntries(1, 100);

		return json({
			entries: result.entries,
			total: result.total
		});
	} catch (error) {
		console.error('Error loading TOTP entries:', error);
		return json(
			{
				entries: [],
				total: 0
			},
			{ status: 500 }
		);
	}
};