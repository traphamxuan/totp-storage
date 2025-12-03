<script lang="ts">
	import { onMount } from 'svelte';
	import OtpList from '$lib/features/otp/OtpList.svelte';
	import init from '@totp-store/totp-rs-web';
	import { listEntries } from '$lib/features/otp/api';
	import OtpForm from '$lib/features/otp/OtpForm.svelte';

	let entries: TOTPEntry[] = $state([]);
	let total: number = $state(0);

	async function onEntryAdded(entry: TOTPEntry) {
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
	});
</script>

<div class="max-w-4xl mx-auto p-4">
	<h1 class="text-3xl font-bold mb-6 text-center">TOTP Storage</h1>

	<!-- Add New TOTP Form -->
	<OtpForm {onEntryAdded} />

	<OtpList bind:entries {total} onLoad={loadEntries} onDelete={handleDelete} />
</div>
