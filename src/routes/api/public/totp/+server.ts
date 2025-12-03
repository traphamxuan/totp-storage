import { totpService } from '$lib/server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '10');

		// Standard behavior - return entries without secrets
		const result = totpService.listTOTPEntries(page, limit);
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