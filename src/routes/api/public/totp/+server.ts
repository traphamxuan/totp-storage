import { totpService } from '$lib/server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

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
		const result = totpService.listTOTPEntries(page, limit, { search, sortBy, sortOrder });
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

export const POST: RequestHandler = async ({ request }) => {
	try {
		const payload: EnrollmentResult = await request.json();

		// TODO: Validate Cloudflare Turnstile captcha using captchaToken
		// Example placeholder:
		// const captchaValid = await validateTurnstileCaptcha(captchaToken);
		// if (!captchaValid) {
		//   return json({ success: false, error: 'Captcha failed' }, { status: 403 });
		// }

		// Add the entry (type: 'public' | 'challenge')
		const id = totpService.addTOTPEntry(payload.secret, { ...payload });

		return json({
			success: true,
			data: totpService.getTOTPEntry(id)
		});
	} catch (error) {
		console.error(error);
		return json({
			success: false,
			error: 'Failed to add TOTP entry'
		}, { status: 500 });
	}
};