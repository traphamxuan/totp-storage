<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { ClerkProvider } from 'svelte-clerk';
	import { publicConfig } from '$lib/configs';

	injectSpeedInsights();
	injectAnalytics();

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>TOTP Storage - Secure OTP Management for Automation Testing</title>
	<meta
		name="description"
		content="Securely store and manage TOTP codes for seamless automation testing. Access your OTP tokens anywhere with our cloud-based 2FA solution."
	/>
	<meta
		name="keywords"
		content="TOTP, OTP, 2FA, MFA, automation testing, security token, authentication, time-based one-time password"
	/>
	<meta name="og:title" content="TOTP Storage - Secure OTP Management for Automation Testing" />
	<meta
		name="og:description"
		content="Store and manage TOTP codes securely for automation testing workflows. Access your OTP tokens from anywhere on the internet."
	/>
	<meta name="og:type" content="website" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="TOTP Storage - Secure OTP Management" />
	<meta
		name="twitter:description"
		content="Manage TOTP codes for automation testing without disrupting authentication flows. Secure cloud-based OTP storage."
	/>
</svelte:head>

<ClerkProvider publishableKey={publicConfig.clerk.publishableKey}>
	{@render children()}
</ClerkProvider>
