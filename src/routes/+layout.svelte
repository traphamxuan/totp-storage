<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { ClerkProvider } from 'svelte-clerk';
	import { publicConfig } from '$lib/configs';
	

	injectSpeedInsights();

	let { children } = $props();

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>


<ClerkProvider publishableKey={publicConfig.clerk.publishableKey}>
	{@render children()}
</ClerkProvider>
