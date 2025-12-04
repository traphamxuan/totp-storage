import { privateConfig } from '$lib/server/configs';
import { totpService } from '$lib/server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import axios from 'axios';

// Add Turnstile validation function
async function validateTurnstileToken(token: string, ip: string): Promise<boolean> {
	try {
		const response = await axios.post(
			'https://challenges.cloudflare.com/turnstile/v0/siteverify',
			`secret=${encodeURIComponent(privateConfig.turnstile.secretKey)}&response=${encodeURIComponent(token)}&remoteip=${encodeURIComponent(ip)}`,
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

		return response.data.success === true;
	} catch (error) {
		console.error('Error validating Turnstile token:', error);
		return false;
	}
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '10');
		const search = url.searchParams.get('search') || undefined;

		// Validate sortBy parameter
		const sortByParam = url.searchParams.get('sortBy');
		const validSortFields = ['issuer', 'label', 'createdAt'] as const;
		const sortBy = sortByParam && validSortFields.includes(sortByParam as any)
			? (sortByParam as 'issuer' | 'label' | 'createdAt')
			: undefined;

		// Validate sortOrder parameter
		const sortOrderParam = url.searchParams.get('sortOrder');
		const sortOrder = sortOrderParam === 'asc' || sortOrderParam === 'desc'
			? (sortOrderParam as 'asc' | 'desc')
			: undefined;

		// Standard behavior - return entries without secrets
		const result = await totpService.listTOTPEntries(page, limit, { search, sortBy, sortOrder });
		return json({
			success: true,
			data: {
				entries: result.entries,
				total: result.total
			}
		});
	} catch (error) {
		return json({
			success: false,
			error: 'Failed to list TOTP entries'
		}, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	try {
		const payload: EnrollmentResult = await request.json();

		// Extract Turnstile token from request headers
		const turnstileToken = request.headers.get('x-turnstile-token');

		// Validate Turnstile token
		if (!turnstileToken) {
			return json({
				success: false,
				error: 'Turnstile token is required'
			}, { status: 400 });
		}

		// Get client IP address
		const clientIP = getClientAddress();

		// Validate Turnstile token
		const isTokenValid = await validateTurnstileToken(turnstileToken, clientIP);
		if (!isTokenValid) {
			return json({
				success: false,
				error: 'Invalid Turnstile token'
			}, { status: 403 });
		}

		// Add the entry (type: 'public' | 'challenge')
		const result = await totpService.addTotp({ ...payload, type: 'public' });
		return json({
			success: true,
			data: result
		});
	} catch (error) {
		console.error(error);
		return json({
			success: false,
			error: 'Failed to add TOTP entry'
		}, { status: 500 });
	}
};

// Add PATCH endpoint to update used_at field
export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const { ids } = await request.json();

		// Validate input
		if (!ids || !Array.isArray(ids) || ids.length === 0) {
			return json({
				success: false,
				error: 'Missing or invalid IDs array'
			}, { status: 400 });
		}

		// Update used_at field for the specified entries
		const result = await totpService.updateUsedAt(ids);

		if (result) {
			return json({
				success: true,
				message: `Successfully updated used_at field for ${ids.length} entries`
			});
		} else {
			return json({
				success: false,
				error: 'Failed to update used_at field'
			}, { status: 500 });
		}
	} catch (error) {
		console.error('Error updating used_at field:', error);
		return json({
			success: false,
			error: 'Failed to update used_at field'
		}, { status: 500 });
	}
};