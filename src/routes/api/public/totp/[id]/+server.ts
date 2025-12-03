import { totpService } from '$lib/server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { generate_token } from '@totp-store/totp-rs-bundler'

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		if (!id) {
			return json({
				success: false,
				error: 'Missing TOTP entry ID'
			}, { status: 400 });
		}

		const entry = totpService.getTOTPEntry(id);

		if (!entry) {
			return json({
				success: false,
				error: 'TOTP entry not found'
			}, { status: 404 });
		}

		const token = generate_token(entry.secret);

		return json({
			success: true,
			data: {
				id: entry.id,
				token: token
			}
		});
	} catch (error) {
		console.error('Error generating TOTP token:', error);
		return json({
			success: false,
			error: 'Failed to generate TOTP token'
		}, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		if (!id) {
			return json({
				success: false,
				error: 'Missing TOTP entry ID'
			}, { status: 400 });
		}

		const result = totpService.deleteTOTPEntry(id);

		if (result) {
			return json({
				success: true,
				message: 'TOTP entry deleted successfully'
			});
		} else {
			return json({
				success: false,
				error: 'TOTP entry not found'
			}, { status: 404 });
		}
	} catch (error) {
		return json({
			success: false,
			error: 'Failed to delete TOTP entry'
		}, { status: 500 });
	}
};