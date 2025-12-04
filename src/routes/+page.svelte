<script lang="ts">
	import { onMount } from 'svelte';
	import init from '@totp-store/totp-rs-web';
	import { listEntries } from '$lib/features/otp';
	import OtpForm from '$lib/features/otp/OtpForm.svelte';
	import OtpList from '$lib/features/otp/OtpList.svelte';
	import { SignedIn, SignedOut, UserButton, SignInButton, useClerkContext } from 'svelte-clerk';
	import type { Totp } from '$lib/entities';

	const ctx = useClerkContext();

	let entries: Totp[] = $state([]);
	let total: number = $state(0);

	async function onEntryAdded(entry: Totp) {
		entries = [entry, ...entries];
		total = total + 1; // Increment total when adding an entry
	}

	async function loadEntries(
		page: number = 1,
		limit: number = 10,
		search?: string,
		sortBy?: string,
		sortOrder?: 'asc' | 'desc'
	) {
		try {
			// Fetch entries with secrets for offline use
			const result = await listEntries(page, limit, search, sortBy, sortOrder);
			if (result) {
				// If this is the first page, replace entries, otherwise append
				entries = result.entries;
				total = result.total;
			}
		} catch (error) {
			console.error('Error loading entries:', error);
		}
	}

	onMount(async () => {
		await init();
		await loadEntries();
	});
</script>

<div class="max-w-4xl mx-auto p-4 relative">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold text-center flex-1">TOTP Storage</h1>
		<div>
			<SignedOut>
				<div
					class="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-300 text-sm"
					title="Install Chrome Extension"
				>
					<SignInButton />
				</div>
			</SignedOut>
			<SignedIn>
				<UserButton />
			</SignedIn>
		</div>
	</div>

	<!-- Add New TOTP Form -->
	<OtpForm {onEntryAdded} />

	<OtpList bind:entries {total} onLoad={loadEntries} />

	<!-- Description section for SEO -->
	<div class="bg-white rounded-lg shadow-md p-6 mt-8">
		<div class="mb-8 text-black-700 dark:text-black-300">
			<h3 class="text-xl font-semibold mb-2">Description</h3>
			<p class="mb-4">
				TOTP Storage is a secure solution for managing Time-based One-Time Password (TOTP) tokens
				used in two-factor authentication (2FA) systems. Our platform enables automation testing
				tools to access TOTP codes without disrupting the original MFA authentication flow.
			</p>
			<p class="mb-4">
				With TOTP Storage, you can securely store OTP codes for multiple accounts and access them
				from anywhere you have internet connectivity. Perfect for development teams that need to
				test authentication flows without manually entering codes.
			</p>
			<h2 class="text-xl font-semibold mb-2">Key Features</h2>
			<ul class="list-disc pl-5 mb-4">
				<li>Secure cloud-based OTP management</li>
				<li>Seamless integration with automation testing tools</li>
				<li>No disruption to existing MFA authentication flows</li>
				<li>Access TOTP tokens from any device with internet</li>
				<li>Support for multiple account management</li>
			</ul>
		</div>
	</div>
</div>
