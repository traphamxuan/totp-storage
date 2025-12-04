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
	let isAuthenticated = $state(false);

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

	async function handleDelete(id: string) {
		entries = entries.filter((entry) => entry.id !== id);
		total = total - 1; // Decrement total when removing an entry
	}

	onMount(async () => {
		await init();
		await loadEntries();
		isAuthenticated = !!ctx.user;
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

	<OtpList bind:entries {total} onLoad={loadEntries} onDelete={handleDelete} />
</div>
