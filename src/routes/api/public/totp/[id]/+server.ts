import { totpService } from '$lib/server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

// Add CORS headers
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		if (!id) {
			return json({
				success: false,
				error: 'Missing TOTP entry ID'
			}, {
				status: 400,
				headers: corsHeaders
			});
		}

		const entry = await totpService.getTotp(id);

		if (!entry) {
			return json({
				success: false,
				error: 'TOTP entry not found'
			}, {
				status: 404,
				headers: corsHeaders
			});
		}

		// Update the used_at field when the entry is accessed
		await totpService.updateUsedAt([id]);

		const tokenResult = totpService.generateToken(entry.secret);

		return json({
			success: true,
			data: {
				id: entry.id,
				token: tokenResult.token,
				expiresIn: tokenResult.expiresIn,
				generatedAt: tokenResult.generatedAt,
				createdAt: entry.createdAt
			}
		}, {
			headers: corsHeaders
		});
	} catch (error) {
		console.error('Error generating TOTP token:', error);
		return json({
			success: false,
			error: 'Failed to generate TOTP token'
		}, {
			status: 500,
			headers: corsHeaders
		});
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		if (!id) {
			return json({
				success: false,
				error: 'Missing TOTP entry ID'
			}, {
				status: 400,
				headers: corsHeaders
			});
		}

		const result = await totpService.deleteTotp(id);

		if (result) {
			return json({
				success: true,
				message: 'TOTP entry deleted successfully'
			}, {
				headers: corsHeaders
			});
		} else {
			return json({
				success: false,
				error: 'TOTP entry not found'
			}, {
				status: 404,
				headers: corsHeaders
			});
		}
	} catch (error) {
		return json({
			success: false,
			error: 'Failed to delete TOTP entry'
		}, {
			status: 500,
			headers: corsHeaders
		});
	}
};

// Handle preflight requests
export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		headers: corsHeaders
	});
};